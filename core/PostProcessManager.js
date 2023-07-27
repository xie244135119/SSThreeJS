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
  PredicationMode,
  BrightnessContrastEffect,
  KernelSize
} from 'postprocessing';
import SSThreeObject from './SSThreeObject';
import ThreeLoop from './SSThreeLoop';
import SSModuleInterface from './SSModule/module.interface';

export default class SSPostProcessManagerModule extends SSModuleInterface {
  composer = null;

  /**
   * @type OutlineEffect
   */
  outlineEffect = null;

  bloomEffect = null;

  // constructor(ssThreeObject, openDebug = false) {
  //   super();
  //   this.ssThreeObject = ssThreeObject;
  // }

  createComposer = (openDebug) => {
    const scene = this.ssThreeObject.threeScene;
    const camera = this.ssThreeObject.threeCamera;
    const renderer = this.ssThreeObject.threeRenderer;
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
      outlineColor: '#00FFFF' // 描述框的颜�
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
    // this.addSMAAGUI(composer, outlineEffect, smaaEffect, edgeDetectionMaterial);

    // 合并所有的后处理效果 Merge all effects into one pass.
    const effects = [bloomEffect, outlineEffect, smaaEffect];
    const effectPass = new EffectPass(camera, ...effects);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);

    this.composer = composer;
    this.ssThreeObject.threeEffectComposer = composer;
    console.log('composer', composer);

    this.ssThreeObject.cancelRender();
    ThreeLoop.add(() => {
      composer.render();
    }, 'PostProcessManager Render');

    return composer;
  };

  /**
   * 默认配置
   */
  defaultConfig = {
    bloom: {
      blendFunction: BlendFunction.SCREEN,
      smoothing: 1,
      inverted: true,
      ignoreBackground: false,
      opacity: 1,
      luminanceThreshold: 0.61,
      luminanceSmoothing: 0.5,
      mipmapBlur: true,
      intensity: 10.0
    },
    outline: {
      blendFunction: BlendFunction.SCREEN,
      visibleEdgeColor: new THREE.Color('#00FFFF'),
      // hiddenEdgeColor: new THREE.Color('#00FFFF'),
      pulseSpeed: 0.7,
      edgeStrength: 4.42,
      kernelSize: KernelSize.MEDIUM, // enum 0-5
      blur: false
    }
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
    // visibleEdgeColor = '#00FFFF',
    // pulseSpeed = 0.7,
    // edgeStrength = 4.42,
    // kernelSize = 2
    visibleEdgeColor = this.defaultConfig.outline.visibleEdgeColor,
    pulseSpeed = this.defaultConfig.outline.pulseSpeed,
    edgeStrength = this.defaultConfig.outline.edgeStrength,
    kernelSize = this.defaultConfig.outline.kernelSize
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
    console.log('meshList', meshList);
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

  addSMAAGUI = (composer, outlineEffect, smaaEffect, edgeDetectionMaterial) => {
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
      },
      outline: {
        edgeStrength: 4.42, // 亮度，强度
        pulseSpeed: 0.7, // 闪烁呼吸频率
        visibleEdgeColor: '#00FFFF', // 描边颜色
        hiddenEdgeColor: '#00FFFF', // 遮挡面颜色
        height: 480,
        blur: false,
        outlineColor: '#00FFFF', // 描述框的颜�
        outlineAlpha: 0.5 // 描述框的透明层�
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

    folder.add(params.outline, 'edgeStrength', 0.0, 10.0, 0.01).onChange((value) => {
      this.outlineEffect.edgeStrength = value;
    });
    folder.add(params.outline, 'pulseSpeed', 0.0, 10.0, 0.01).onChange((value) => {
      this.outlineEffect.pulseSpeed = value;
    });
    folder.addColor(params.outline, 'visibleEdgeColor', '#000000').onChange((value) => {
      this.outlineEffect.visibleEdgeColor.set(value);
      console.log('value', value);
    });
    folder.addColor(params.outline, 'hiddenEdgeColor', '#000000').onChange((value) => {
      this.outlineEffect.hiddenEdgeColor.set(value);
    });
    folder.add(params.outline, 'height', 0.0, 1000.0, 0.01).onChange((value) => {
      this.outlineEffect.height = value;
    });
    folder.open();
  };

  // 枚举 BlendFunction
  getModuleConfigSource() {
    return {
      // lightType: ['AmbientLight', 'DirectionalLight', 'SpotLight', 'PointLight', 'RectAreaLight']
      blendFunction: Object.keys(BlendFunction).map((item) => BlendFunction[item]),
      kernelSize: Object.keys(KernelSize).map((item) => KernelSize[item])
    };
  }

  _setConfigValue() {
    if (this.bloomEffect) {
      this.bloomEffect.blendMode.setBlendFunction(this.defaultConfig.bloom.blendFunction);
      this.bloomEffect.smoothing = this.defaultConfig.bloom.smoothing;
      this.bloomEffect.luminanceMaterial.setThreshold(this.defaultConfig.bloom.luminanceThreshold);
      this.bloomEffect.intensity = this.defaultConfig.bloom.intensity;
      this.bloomEffect.luminanceMaterial.setSmoothingFactor(
        this.defaultConfig.bloom.luminanceSmoothing
      );
      this.bloomEffect.inverted = this.defaultConfig.bloom.inverted;
      this.bloomEffect.ignoreBackground = this.defaultConfig.bloom.ignoreBackground;
      this.bloomEffect.opacity = this.defaultConfig.bloom.opacity;
    }

    if (this.outlineEffect) {
      this.outlineEffect.blendMode.setBlendFunction(this.defaultConfig.outline.blendFunction);
      this.outlineEffect.visibleEdgeColor.set(
        this.defaultConfig.outline.visibleEdgeColor.r,
        this.defaultConfig.outline.visibleEdgeColor.g,
        this.defaultConfig.outline.visibleEdgeColor.b
      );
      this.outlineEffect.hiddenEdgeColor.set(
        this.defaultConfig.outline.visibleEdgeColor.r,
        this.defaultConfig.outline.visibleEdgeColor.g,
        this.defaultConfig.outline.visibleEdgeColor.b
      );
      // this.outlineEffect.hiddenEdgeColor.set(
      //   this.defaultConfig.outline.hiddenEdgeColor.r,
      //   this.defaultConfig.outline.hiddenEdgeColor.g,
      //   this.defaultConfig.outline.hiddenEdgeColor.b
      // );
      this.outlineEffect.pulseSpeed = this.defaultConfig.outline.pulseSpeed;
      this.outlineEffect.edgeStrength = this.defaultConfig.outline.edgeStrength;
      this.outlineEffect.kernelSize = Math.abs(this.defaultConfig.outline.kernelSize) % 5;
      this.outlineEffect.blur = this.defaultConfig.outline.blur;
    }
  }

  moduleMount() {
    // console.log(' 开发模块注册 ', this.defaultConfig);
    this.createComposer(false);
    // 初始化赋值
    this._setConfigValue();
  }

  moduleUnmount() {
    // console.log(' 开发模块解除注册 ');
  }

  moduleImport(e = {}) {
    // console.log(' 导入的文件配置 import ', e);
    this.defaultConfig = e;
    this._setConfigValue();
  }

  moduleExport() {
    // console.log(' 处理完戯后的文件配置 export ', this.defaultConfig);
    return this.defaultConfig;
  }

  getModuleConfig() {
    return this.defaultConfig;
  }

  moduleGuiChange(e) {
    // console.log(' develop change ', e);
    if (!this.bloomEffect) return;
    this.defaultConfig = e.target;
    //
    this._setConfigValue();
  }
}
