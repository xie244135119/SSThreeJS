import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader';
import { ColorifyShader } from 'three/examples/jsm/shaders/ColorifyShader';
import { ColorCorrectionShader } from 'three/examples/jsm/shaders/ColorCorrectionShader';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
import { HueSaturationShader } from 'three/examples/jsm/shaders/HueSaturationShader';
// import { PixelShader } from 'three/examples/jsm/shaders/PixelShader';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import { SepiaShader } from 'three/examples/jsm/shaders/SepiaShader';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader';
import { LuminosityHighPassShader } from 'three/examples/jsm/shaders/LuminosityHighPassShader';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader';
import { BleachBypassShader } from 'three/examples/jsm/shaders/BleachBypassShader';
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass';
import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass';
import ThreeLoop from './SSThreeLoop';

export default class SSPostProcess {
  //
  threeJs = null;

  /**
   * @type EffectComposer
   */
  effectComposer = null;

  /**
   * @type OutlinePass
   */
  #outlinePass = null;

  /**
   * @type RenderPass
   */
  #renderPass = null;

  constructor(aThreeJs) {
    this.threeJs = aThreeJs;
  }

  /**
   * destory
   */
  destroy = () => {
    this.closeRender();
    if (this.effectComposer) {
      let effectComposer = this.getEffectComposer();
      effectComposer.passes.forEach((e) => {
        this.disposeMaterialByPass(e);
      });
      this.disposeMaterialByPass(effectComposer.copyPass);
      this.#outlinePass = null;
      effectComposer.passes = [];
      effectComposer.renderTarget1.dispose();
      effectComposer.renderTarget2.dispose();
      effectComposer.writeBuffer = null;
      effectComposer.readBuffer = null;
      effectComposer.copyPass = null;
      effectComposer = null;
    }
  };

  /**
   * 基础后处理
   */
  setup = () => {
    // 2.抗锯齿通道  使用FXAAShader---------------------
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this.threeJs.threeRenderer.getPixelRatio();
    fxaaPass.material.uniforms.resolution.value.x =
      1 / (this.threeJs.threeContainer.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms.resolution.value.y =
      1 / (this.threeJs.threeContainer.offsetHeight * pixelRatio);

    this.getEffectComposer().addPass(fxaaPass);
  };

  /**
   * 增加模型轮廓
   * @param {Array<THREE.Object3D} aObject3Ds 一组模型体
   * @param {string | number} color #FFFFE0 #003354
   * @returns
   */
  addOutlineByObject3Ds = (aObject3Ds = [], color = '#003354') => {
    const effectComposer = this.getEffectComposer();
    const { threeContainer: canvas, threeScene, threeCamera } = this.threeJs;
    if (this.#renderPass === null) {
      this.#renderPass = new RenderPass(threeScene, threeCamera);
    }
    if (effectComposer.passes.findIndex((item) => item === this.#renderPass) === -1) {
      effectComposer.addPass(this.#renderPass);
    }
    if (this.#outlinePass === null) {
      this.#outlinePass = new OutlinePass(
        { x: canvas.clientWidth, y: canvas.clientHeight },
        this.threeJs.threeScene,
        this.threeJs.threeCamera
      );
      // 粗细
      this.#outlinePass.edgeStrength = 5;
      // 发光强度
      this.#outlinePass.edgeGlow = 2;
      // 光晕粗
      this.#outlinePass.edgeThickness = 1;
      // 闪烁频率
      this.#outlinePass.pulsePeriod = 3;
      // 是否使用纹理
      this.#outlinePass.usePatternTexture = false;
    }
    this.#outlinePass.visibleEdgeColor = new THREE.Color(color);
    this.#outlinePass.hiddenEdgeColor = new THREE.Color(color);
    if (effectComposer.passes.findIndex((item) => item === this.#outlinePass) === -1) {
      effectComposer.addPass(this.#outlinePass);
    }
    this.#outlinePass.selectedObjects = aObject3Ds;
  };

  /**
   * 移除已添加描边
   */
  removeOutline = () => {
    const effectComposer = this.getEffectComposer();
    this.disposeMaterialByPass(this.#outlinePass);
    effectComposer.removePass(this.#outlinePass);
    this.disposeMaterialByPass(this.#renderPass);
    effectComposer.removePass(this.#renderPass);
  };

  /**
   * 增加覆盖盒
   * @param {Array<THREE.Object3D>} aModels 一组模型体
   * @param {THREE.MeshStandardMaterialParameters} materialParams 材质配置
   * @returns
   */
  addMaskBoxByObject3Ds = (aObject3Ds = [], materialParams = '#00ffff') => {
    const material = new THREE.MeshStandardMaterial({
      name: 'tempmask',
      transparent: true,
      opacity: 0.3,
      color: '#00ffff',
      depthWrite: false,
      userData: {
        temp_isMask: true
      },
      ...materialParams
    });

    aObject3Ds.forEach((item) => {
      if (item instanceof THREE.Object3D) {
        if (item.userData?.tempMask) {
          item.userData.tempMask.visible = true;
          return;
        }
        const cloneitem = item.clone();
        cloneitem.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.material = material;
          }
        });
        item.parent.add(cloneitem);
        item.userData.tempMask = cloneitem;
      }
    });
  };

  /**
   * 移除标记物
   * @param {Array<THREE.Object3D} aObject3Ds
   */
  removeMaskBox = (aObject3Ds = []) => {
    aObject3Ds.forEach((item) => {
      if (item instanceof THREE.Object3D) {
        if (item.userData?.tempMask instanceof THREE.Object3D) {
          item.userData.tempMask.visible = false;
        }
      }
    });
  };

  /**
   * 获取基础后处理
   * @returns
   */
  getEffectComposer = () => {
    if (this.effectComposer instanceof EffectComposer) {
      return this.effectComposer;
    }
    const { threeRenderer, threeContainer } = this.threeJs;
    const effectComposer = new EffectComposer(threeRenderer);
    const canvas = threeContainer;
    effectComposer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.effectComposer = effectComposer;
    // this.effectComposer.renderTarget1.texture.colorSpace = THREE.SRGBColorSpace;
    // this.effectComposer.renderTarget2.texture.colorSpace = THREE.SRGBColorSpace;
    return effectComposer;
  };

  /**
   * dispose
   */
  disposeMaterialByPass = (pass) => {
    if (pass instanceof Pass) {
      const properyNames = Object.getOwnPropertyNames(pass);
      properyNames.forEach((e) => {
        const value = pass[e];
        if (value instanceof THREE.Material) {
          this.threeJs.threeDisposeQueue.dispose(value);
        } else if (value instanceof Array) {
          value.forEach((e) => {
            if (e instanceof THREE.Material) {
              this.threeJs.threeDisposeQueue.dispose(e);
            }
          });
        } else if (value instanceof FullScreenQuad) {
          this.threeJs.threeDisposeQueue.dispose(value.material);
          value.dispose();
        } else if (['copyUniforms', 'uniforms'].indexOf(e) !== -1) {
          this.threeJs.threeDisposeQueue.disposeUniforms(value.copyUniforms || value.uniforms);
        }
      });

      if (pass.dispose) {
        pass.dispose();
      }
    }
  };

  /**
   * open render
   */
  openRender = () => {
    ThreeLoop.add(() => {
      this.effectComposer.render();
    }, 'postProcess update');
  };

  /**
   * close render
   */
  closeRender = () => {
    ThreeLoop.removeId('postProcess update');
  };
}
