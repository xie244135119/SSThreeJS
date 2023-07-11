/*
 * Author  Kayson.Wan
 * Date  2023-06-23 17:50:25
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-28 18:18:25
 * Description
 */
import * as THREE from 'three';
// eslint-disable-next-line import/extensions
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {
  BlendFunction,
  CopyMaterial,
  BloomEffect,
  SelectiveBloomEffect,
  ShaderPass,
  EffectComposer,
  EffectPass,
  RenderPass,
  FXAAEffect,
  OutlineEffect,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  PredicationMode
} from 'postprocessing';
import SSThreeObject from './SSThreeObject';
import ThreeLoop from './SSThreeLoop';
import SSFileInterface from './SSFileSetting/file.interface';

export default class PostProcessManager extends SSFileInterface {
  /**
   * @type SSThreeObject
   */
  ssthreeObject = null;

  composer = null;

  /**
   * @type OutlineEffect
   */
  outlineEffect = null;

  bloomEffect = null;

  // constructor(ssthreeObject, openDebug = false) {
  //   super();
  //   this.ssthreeObject = ssthreeObject;
  // }

  createComposer = (openDebug) => {
    const scene = this.ssthreeObject.threeScene;
    const camera = this.ssthreeObject.threeCamera;
    const renderer = this.ssthreeObject.threeRenderer;
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // composer.addPass(new EffectPass(camera, new BloomEffect()));
    // bloom
    const bloomEffect = new SelectiveBloomEffect(scene, camera, {
      luminanceThreshold: 0.61,
      luminanceSmoothing: 0.5,
      mipmapBlur: true,
      intensity: 10.0
    });

    bloomEffect.inverted = true;
    this.bloomEffect = bloomEffect;
    // 描边
    const outlineEffect = new OutlineEffect(scene, camera, {
      blendFunction: BlendFunction.SCREEN,
      edgeStrength: 4.42, // 亮度，强度
      pulseSpeed: 0.7, // 闪烁呼吸频率
      visibleEdgeColor: '#00FFFF', // 描边颜色
      hiddenEdgeColor: '#00FFFF', // 遮挡面颜色
      height: 480,
      blur: false,
      xRay: true
    });
    outlineEffect.blurPass.blurMaterial.kernelSize = 2; // int : 0-5 边缘模糊宽度
    this.outlineEffect = outlineEffect;

    // outlineEffect.selection.add(actors.children[0]);

    // 抗锯齿
    const smaaEffect = new SMAAEffect({
      blendFunction: BlendFunction.SET,
      preset: SMAAPreset.LOW,
      edgeDetectionMode: EdgeDetectionMode.COLOR,
      predicationMode: PredicationMode.DEPTH
    });
    const { edgeDetectionMaterial } = smaaEffect;
    edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
    edgeDetectionMaterial.predicationThreshold = 0.002;
    edgeDetectionMaterial.predicationScale = 1;
    composer.multisampling = 3; // 抗锯齿强度
    // this.addSMAAGUI(composer, smaaEffect, edgeDetectionMaterial);

    // 合并所有的后处理效果 Merge all effects into one pass.
    const effects = [outlineEffect, bloomEffect, smaaEffect];
    // const effects = [outlineEffect, bloomEffect];
    const effectPass = new EffectPass(camera, ...effects);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);

    this.ssthreeObject.threeRenderer.autoClear = true; //----
    //
    this.composer = composer;
    this.ssthreeObject.threeEffectComposer = composer;
    console.log('composer', composer);

    ThreeLoop.add(() => {
      composer.render();
    }, 'PostProcessManager Render');

    if (openDebug) {
      // //gui 修改围墙颜色
      const gui = new GUI();
      const params = {
        luminanceThreshold: 1,
        intensity: 1,
        smoothing: 1,
        inverted: true,
        ignoreBackground: false,
        opacity: 1
      };
      const folder = gui.addFolder('bloom配置');
      folder.add(params, 'luminanceThreshold', 0, 1, 0.01).onChange((e) => {
        bloomEffect.luminanceMaterial.setThreshold(e);
      });
      folder.add(params, 'intensity', 0, 10, 0.01).onChange((e) => {
        bloomEffect.intensity = e;
      });
      folder.add(params, 'smoothing', 0, 1, 0.01).onChange((e) => {
        bloomEffect.luminanceMaterial.setSmoothingFactor(e);
      });
      folder.add(params, 'inverted').onChange((e) => {
        bloomEffect.inverted = e;
      });
      folder.add(params, 'ignoreBackground').onChange((e) => {
        bloomEffect.ignoreBackground = e;
      });
      folder.add(params, 'opacity', 0, 1, 0.01).onChange((e) => {
        bloomEffect.opacity = e;
      });
    }

    return composer;
  };

  /**
   *
   * @param {*} objects [] mesh数组
   * @param {*} visibleEdgeColor 描边颜色
   * @param {*} pulseSpeed 闪烁呼吸频率
   * @param {*} edgeStrength 亮度，强度
   */
  outlineObjects = (
    objects = [],
    visibleEdgeColor = '#00FFFF',
    pulseSpeed = 0.7,
    edgeStrength = 4.42,
    kernelSize = 2
  ) => {
    const meshList = [];
    objects.forEach((element) => {
      if (element instanceof THREE.Mesh) {
        meshList.push(element);
      }
      if (element instanceof THREE.Group) {
        element.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshList.push(child);
          }
        });
      }
    });

    this.outlineEffect.visibleEdgeColor.set(visibleEdgeColor);
    this.outlineEffect.hiddenEdgeColor.set(visibleEdgeColor);
    this.outlineEffect.pulseSpeed = pulseSpeed;
    this.outlineEffect.edgeStrength = edgeStrength;
    this.outlineEffect.blurPass.blurMaterial.kernelSize = kernelSize; // int : 0-5 边缘模糊宽度
    this.outlineEffect.selection.set(meshList);
  };

  /**
   * 设置发光属性
   * @param {*} param
   */
  setBloomEffectConfig = (
    // eslint-disable-next-line no-undef
    param = { luminanceThreshold, luminanceSmoothing, intensity, opacity }
  ) => {
    this.bloomEffect.luminanceMaterial.setThreshold(param.luminanceThreshold);
    this.bloomEffect.intensity = param.intensity;
    this.bloomEffect.luminanceMaterial.setSmoothingFactor(param.luminanceSmoothing);
    this.bloomEffect.opacity = param.opacity;
  };

  addSMAAGUI = (composer, smaaEffect, edgeDetectionMaterial) => {
    const renderer = composer.getRenderer();
    const context = renderer.getContext();

    const AAMode = {
      DISABLED: 0,
      SMAA: 1,
      LEVEL1: 2,
      LEVEL2: 3,
      LEVEL3: 4,
      LEVEL4: 5
    };
    if (renderer.capabilities.isWebGL2) {
      Object.assign(AAMode, { MSAA: 2 });
    }
    const SMAAMode = {
      DEFAULT: 0,
      SMAA_EDGES: 1,
      SMAA_WEIGHTS: 2
    };
    const params = {
      antialiasing: AAMode.LEVEL2,
      smaa: {
        mode: SMAAMode.DEFAULT,
        preset: SMAAPreset.HIGH,
        opacity: smaaEffect.blendMode.opacity.value,
        'blend mode': smaaEffect.blendMode.blendFunction
      },
      edgeDetection: {
        mode: Number(edgeDetectionMaterial.defines.EDGE_DETECTION_MODE),
        'contrast factor': Number(edgeDetectionMaterial.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR),
        threshold: Number(edgeDetectionMaterial.defines.EDGE_THRESHOLD)
      },
      predication: {
        mode: Number(edgeDetectionMaterial.defines.PREDICATION_MODE),
        threshold: Number(edgeDetectionMaterial.defines.PREDICATION_THRESHOLD),
        strength: Number(edgeDetectionMaterial.defines.PREDICATION_STRENGTH),
        scale: Number(edgeDetectionMaterial.defines.PREDICATION_SCALE)
      }
    };

    const gui = new GUI();
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '20.5rem';
    gui.domElement.style.left = '0rem';
    gui.domElement.style.zIndex = 100;
    gui.name = '灯光阴影效果调试配置';
    gui.width = 300;
    gui.closed = false;

    gui.add(params, 'antialiasing', AAMode).onChange((value) => {
      const mode = Number(value);
      composer.multisampling = mode;
      console.log('composer.multisampling', composer.multisampling);
    });
    const folder = gui.addFolder('SMAA');
    folder.add(params.smaa, 'preset', SMAAPreset).onChange((value) => {
      smaaEffect.applyPreset(Number(value));
      edgeDetectionMaterial.setEdgeDetectionThreshold(params.edgeDetection.threshold);
    });

    let subfolder = folder.addFolder('Edge Detection');

    subfolder.add(params.edgeDetection, 'mode', EdgeDetectionMode).onChange((value) => {
      edgeDetectionMaterial.setEdgeDetectionMode(Number(value));
    });

    subfolder.add(params.edgeDetection, 'contrast factor', 1.0, 300.0, 0.01).onChange((value) => {
      edgeDetectionMaterial.setLocalContrastAdaptationFactor(Number(value));
    });

    subfolder.add(params.edgeDetection, 'threshold', 0.0, 0.5, 0.0001).onChange((value) => {
      edgeDetectionMaterial.setEdgeDetectionThreshold(Number(value));
    });

    subfolder = folder.addFolder('Predicated Thresholding');

    subfolder.add(params.predication, 'mode', PredicationMode).onChange((value) => {
      edgeDetectionMaterial.setPredicationMode(Number(value));
    });

    subfolder.add(params.predication, 'threshold', 0.0, 0.5, 0.0001).onChange((value) => {
      edgeDetectionMaterial.setPredicationThreshold(Number(value));
    });

    subfolder.add(params.predication, 'strength', 0.0, 1.0, 0.0001).onChange((value) => {
      edgeDetectionMaterial.setPredicationStrength(Number(value));
    });

    subfolder.add(params.predication, 'scale', 1.0, 5.0, 0.01).onChange((value) => {
      edgeDetectionMaterial.setPredicationScale(Number(value));
    });

    folder.add(params.smaa, 'opacity', 0.0, 1.0, 0.01).onChange((value) => {
      smaaEffect.blendMode.opacity.value = value;
    });

    folder.add(params.smaa, 'blend mode', BlendFunction).onChange((value) => {
      smaaEffect.blendMode.setBlendFunction(Number(value));
    });

    folder.open();
  };

  // 默认配置
  defaultConfig = {
    bloom: {
      smoothing: 1,
      inverted: true,
      ignoreBackground: false,
      opacity: 1,
      luminanceThreshold: 0.61,
      luminanceSmoothing: 0.5,
      mipmapBlur: true,
      intensity: 10.0
    }
  };

  _setConfigValue() {
    this.bloomEffect.luminanceMaterial.setThreshold(this.defaultConfig.bloom.luminanceThreshold);
    this.bloomEffect.intensity = this.defaultConfig.bloom.intensity;
    this.bloomEffect.luminanceMaterial.setSmoothingFactor(
      this.defaultConfig.bloom.luminanceSmoothing
    );
    this.bloomEffect.inverted = this.defaultConfig.bloom.inverted;
    this.bloomEffect.ignoreBackground = this.defaultConfig.bloom.ignoreBackground;
    this.bloomEffect.opacity = this.defaultConfig.bloom.opacity;
  }

  mount(threeobject) {
    console.log(' 开发模块注册 ', threeobject);
    this.ssthreeObject = threeobject;
    this.createComposer(false);
    // 初始化赋值
    this._setConfigValue();
  }

  unmount() {
    console.log(' 开发模块解除注册 ');
  }

  import(e = {}) {
    console.log(' 导入的文件配置 import ', e);
    this.defaultConfig = e;
    this._setConfigValue();
  }

  export() {
    return this.defaultConfig;
  }

  getDebugConfig() {
    return this.defaultConfig;
  }

  onDebugChange(e) {
    // console.log(' develop change ', e);
    if (!this.bloomEffect) return;

    this.defaultConfig.bloom.luminanceThreshold = e.data.bloom.luminanceThreshold;
    this.defaultConfig.bloom.intensity = e.data.bloom.intensity;
    this.defaultConfig.bloom.luminanceSmoothing = e.data.bloom.luminanceSmoothing;
    this.defaultConfig.bloom.inverted = e.data.bloom.inverted;
    this.defaultConfig.bloom.ignoreBackground = e.data.bloom.ignoreBackground;
    this.defaultConfig.bloom.opacity = e.data.bloom.opacity;
    this._setConfigValue();
  }
}
