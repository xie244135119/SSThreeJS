/*
 * Author  Murphy.xie
 * Date  2023-06-23 17:48:56
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-24 20:12:18
 * Description
 */
import * as THREE from 'three';
// 后处理
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
import SSThreeLoop from '../SSThreeLoop';
import SSDispose from '../SSDispose';
import SSModuleInterface from './module.interface';
import SSThreeObject from '../SSThreeObject';

export default class SSPostProcessModule {
  // 标题
  title = '模块-three后处理【原生版】';

  /**
   * @type {EffectComposer}
   */
  effectComposer = null;

  /**
   * @type {OutlinePass}
   */
  #outlinePass = null;

  /**
   * @type {RenderPass}
   */
  #renderPass = null;

  /**
   * 伽马矫正
   * @param {ShaderPass}
   */
  #gammaPass = null;

  /**
   * bloom pass
   * @param {UnrealBloomPass}
   */
  #unrealBloomPass = null;

  /**
   *
   * @param {SSThreeObject} ssThreeObject
   */
  constructor(ssThreeObject) {
    this.ssThreeObject = ssThreeObject;
  }

  /**
   * destory
   */
  destroy = () => {
    this.closeRender();
    if (this.effectComposer) {
      let effectComposer = this.getEffectComposer();
      effectComposer.passes.forEach((e) => {
        SSDispose.dispose(e);
      });
      SSDispose.dispose(effectComposer.copyPass);
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
   * temp 基础后处理
   */
  setup = () => {
    // 2.抗锯齿通道  使用FXAAShader---------------------
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this.ssThreeObject.threeRenderer.getPixelRatio();
    fxaaPass.material.uniforms.resolution.value.x =
      1 / (this.ssThreeObject.threeContainer.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms.resolution.value.y =
      1 / (this.ssThreeObject.threeContainer.offsetHeight * pixelRatio);

    this.getEffectComposer().addPass(fxaaPass);
  };

  moduleMount() {
    //
  }

  /**
   * 增加模型轮廓
   * @param {Array<THREE.Object3D} aObject3Ds 一组模型体
   * @param {string | number} color #FFFFE0 #003354
   * @returns
   */
  addOutlineByObject3Ds = (aObject3Ds = [], color = '#003354') => {
    const effectComposer = this.getEffectComposer();
    const { threeContainer: canvas, threeScene, threeCamera } = this.ssThreeObject;
    if (this.#renderPass === null) {
      this.#renderPass = new RenderPass(threeScene, threeCamera);
    }
    if (effectComposer.passes.findIndex((item) => item === this.#renderPass) === -1) {
      effectComposer.addPass(this.#renderPass);
    }
    if (this.#gammaPass === null) {
      this.#gammaPass = new ShaderPass(GammaCorrectionShader);
    }
    if (effectComposer.passes.findIndex((item) => item === this.#gammaPass) === -1) {
      effectComposer.addPass(this.#gammaPass);
    }
    if (this.#outlinePass === null) {
      this.#outlinePass = new OutlinePass(
        { x: canvas.clientWidth, y: canvas.clientHeight },
        this.ssThreeObject.threeScene,
        this.ssThreeObject.threeCamera
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
    effectComposer.removePass(this.#outlinePass);
    effectComposer.removePass(this.#renderPass);
    effectComposer.removePass(this.#gammaPass);
    SSDispose.dispose(this.#outlinePass);
    SSDispose.dispose(this.#gammaPass);
    SSDispose.dispose(this.#renderPass);
  };

  /**
   * add bloom
   */
  addBloom = () => {
    const effectComposer = this.getEffectComposer();
    if (this.#unrealBloomPass === null) {
      this.#unrealBloomPass = new UnrealBloomPass(
        new THREE.Vector2(
          this.ssThreeObject.threeContainer.offsetWidth,
          this.ssThreeObject.threeContainer.offsetHeight
        )
      );
    }
    if (effectComposer.passes.findIndex((item) => item === this.#unrealBloomPass) === -1) {
      this.effectComposer.addPass(this.#unrealBloomPass);
    }
  };

  /**
   * remove bloom
   */
  removeBloom = () => {
    this.effectComposer?.removePass?.(this.#unrealBloomPass);
    SSDispose.dispose(this.#unrealBloomPass);
  };

  /**
   * 增加覆盖盒
   * @param {Array<THREE.Object3D>} aObject3Ds 一组模型体
   * @param {THREE.MeshStandardMaterialParameters} materialParams 材质配置
   * @returns
   */
  addMaskBoxByObject3Ds = (aObject3Ds, materialParams) => {
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
      if (item.isObject3D) {
        if (item.userData?.tempMask) {
          item.userData.tempMask.visible = true;
          item.userData.tempMask.position.copy(item.position);
          return;
        }
        const cloneitem = item.clone();
        cloneitem.name = `${item.name}_tempmask`;
        cloneitem.traverse((obj) => {
          if (obj.type === 'Mesh') {
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
      if (item.isObject3D) {
        if (item.userData?.tempMask?.isObject3D) {
          // item.userData.tempMask.visible = false;
          SSDispose.dispose(item.userData?.tempMask);
          item.userData.tempMask.removeFromParent();
          item.userData.tempMask = null;
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
    const { threeRenderer, threeContainer } = this.ssThreeObject;
    const effectComposer = new EffectComposer(threeRenderer);
    const canvas = threeContainer;
    effectComposer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.effectComposer = effectComposer;
    this.openRender();
    // this.effectComposer.renderTarget1.texture.encoding = THREE.sRGBEncoding;
    // this.effectComposer.renderTarget2.texture.encoding = THREE.sRGBEncoding;
    return effectComposer;
  };

  /**
   * open render
   */
  openRender = () => {
    this.ssThreeObject.cancelRender();
    SSThreeLoop.add(() => {
      if (this.effectComposer.passes.length > 0) {
        this.effectComposer.render();
      }
    }, 'postProcess update');
  };

  /**
   * close render
   */
  closeRender = () => {
    this.ssThreeObject.render();
    SSThreeLoop.removeId('postProcess update');
  };

  getModuleConfig() {
    return {
      // 粗细
      edgeStrength: 5,
      // 发光强度
      edgeGlow: 2,
      // 光晕粗
      edgeThickness: 1,
      // 闪烁频率
      pulsePeriod: 3
    };
  }

  moduleGuiChange(params) {
    console.log(' gui params ', params);
  }
}
