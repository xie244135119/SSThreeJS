/**
 * @description 后处理插件
 */
import GUI from 'lil-gui';
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
  VignetteEffect,
  LUT3DEffect,
  LookupTexture3D,
  LookupTexture,
  BloomEffectOptions,
  VignetteTechnique,
  HueSaturationEffect,
  ToneMappingEffect,
  ToneMappingMode
} from 'postprocessing';
import SSFile from '../SSTool/SSFile';
import { SSThreeObject, SSThreeLoop, SSDispose, THREE } from '../index'; //'../3d-sdk/ssthingjs.mjs';
import lutImg from '../assets/lut/filmic1.png';

interface SSEffectComposerOptions {
  depthBuffer?: boolean;
  stencilBuffer?: boolean;
  alpha?: boolean;
  multisampling?: number;
  frameBufferType?: number;
}
interface SSToneMappingEffectOptions {
  blendFunction?: BlendFunction;
  mode?: ToneMappingMode; // 对应 ToneMappingMode
  adaptive?: boolean;
  resolution?: number;
  middleGrey?: number;
  maxLuminance?: number;
  whitePoint?: number;
}

interface SSOutlineEffectOptions {
  blendFunction?: BlendFunction;
  patternScale?: number;
  edgeStrength?: number;
  pulseSpeed?: number;
  visibleEdgeColor?: number;
  hiddenEdgeColor?: number;
  multisampling?: number;
  blur?: boolean;
  xRay?: boolean;
}

interface SSBloomEffectOptions {
  blendFunction?: BlendFunction;
  smoothing?: number;
  inverted?: boolean;
  ignoreBackground?: boolean;
  opacity?: number;
  threshold?: number;
  intensity?: number;
}

interface SSHueSaturationEffect {
  blendFunction?: BlendFunction;
  hue?: number;
  saturation?: number;
}

interface SSBrightnessContrastEffect {
  blendFunction?: BlendFunction;
  brightness?: number;
  contrast?: number;
}

interface SSSMAAEffectOptions {
  preset?: SMAAPreset;
  edgeDetectionMode?: EdgeDetectionMode;
  predicationMode?: PredicationMode;
  edgeDetectionThreshold?: number;
  predicationThreshold?: number;
  predicationScale?: number;
}

interface SSLUT3DEffectOptions {
  blendFunction?: BlendFunction;
  tetrahedralInterpolation?: boolean;
}

interface SSVignetteEffectOptions {
  blendFunction?: BlendFunction;
  technique?: VignetteTechnique;
  offset?: number;
  darkness?: number;
}

interface SSGUISettingItem {
  controllers: {
    [key: string]: string | number;
  };
  folders: {
    [key: string]: SSGUISettingItem;
  };
}

export interface SSPostProcessPluginItem {
  toneMappingEffect?: SSToneMappingEffectOptions;
  bloomEffect?: SSBloomEffectOptions;
  outlineEffect?: SSOutlineEffectOptions;
  smaaEffect?: SSSMAAEffectOptions;
  lut3DEffect?: SSLUT3DEffectOptions;
  vignetteEffect?: SSVignetteEffectOptions;
  hueSaturationEffect?: SSHueSaturationEffect;
  brightnessContrastEffect?: SSBrightnessContrastEffect;
  [key: string]: any; // 其他可能的后处理效果配置
}

export default class SSPostProcessPlugin {
  ssThreeObject: SSThreeObject = null;

  /**
   * @description  基础渲染器
   */
  effectComposer: EffectComposer = null;

  /**
   * @description  色调映射
   */
  toneMappingEffect: ToneMappingEffect = null;

  /**
   * @description  描边圈
   */
  outlineEffect: OutlineEffect = null;

  /**
   * @description  泛光effect
   */
  bloomEffect: SelectiveBloomEffect = null;

  /**
   * @description 抗锯齿作用
   */
  smaaEffect: SMAAEffect = null;

  /**
   * @description 滤镜作用
   */
  lutEffect: LUT3DEffect = null;

  /**
   * @description 边角压暗Effect
   */
  vignetteEffect: VignetteEffect = null;

  /**
   * @description 色调饱和度Effect
   */
  hueSaturationEffect: HueSaturationEffect = null;

  /**
   * @description 亮度对比度Effect
   */
  brightnessContrastEffect: BrightnessContrastEffect = null;

  // GUI 属性配置文件
  guiSetting = null;

  gui: GUI = null;

  /**
   * @description 后处理配置
   */
  postProcessOptions: SSPostProcessPluginItem = {
    bloomEffect: {
      blendFunction: BlendFunction.SCREEN,
      inverted: false,
      ignoreBackground: true,
      opacity: 1,
      threshold: 0.2,
      smoothing: 0.9,
      intensity: 5
    },
    toneMappingEffect: {
      // blendFunction: BlendFunction.NORMAL,
      blendFunction: BlendFunction.SKIP,
      mode: ToneMappingMode.ACES_FILMIC,
      adaptive: false,
      resolution: 256,
      middleGrey: 0.6,
      maxLuminance: 16.0,
      whitePoint: 16.0
    },
    outlineEffect: {
      blendFunction: BlendFunction.SCREEN,
      visibleEdgeColor: new THREE.Color('#00FFFF').getHex(),
      hiddenEdgeColor: new THREE.Color('#00FFFF').getHex(),
      pulseSpeed: 0.7,
      edgeStrength: 4.42,
      blur: false
    },
    lut3DEffect: {
      blendFunction: BlendFunction.SKIP,
      tetrahedralInterpolation: false
    },
    vignetteEffect: {
      blendFunction: BlendFunction.NORMAL,
      technique: VignetteTechnique.DEFAULT,
      offset: 0.5,
      darkness: 0.5
    },
    smaaEffect: {
      preset: SMAAPreset.MEDIUM,
      edgeDetectionMode: EdgeDetectionMode.COLOR,
      predicationMode: PredicationMode.DISABLED,
      edgeDetectionThreshold: 0.02, // 0.02,
      predicationThreshold: 0.002,
      predicationScale: 1
    },
    hueSaturationEffect: {
      blendFunction: BlendFunction.NORMAL,
      hue: 0,
      saturation: 0
    },
    brightnessContrastEffect: {
      blendFunction: BlendFunction.NORMAL,
      brightness: 0,
      contrast: 0
    }
  };

  /**
   * 销毁方法
   */
  destroy = () => {
    this.gui?.destroy();
    this.gui = null;
    if (this.outlineEffect) {
      this.outlineEffect?.selection?.clear();
      SSDispose.dispose(this.outlineEffect.patternTexture);
      SSDispose.dispose(this.outlineEffect.blurPass.blurMaterial);
      SSDispose.dispose(this.outlineEffect.blurPass.fullscreenMaterial);
      SSDispose.dispose(this.outlineEffect);
    }
    if (this.bloomEffect) {
      this.bloomEffect.selection.clear();
      SSDispose.dispose(this.bloomEffect.luminanceMaterial);
      SSDispose.dispose(this.bloomEffect);
    }
    if (this.smaaEffect) {
      SSDispose.dispose(this.smaaEffect.weightsMaterial);
      SSDispose.dispose(this.smaaEffect.edgeDetectionMaterial);
      SSDispose.dispose(this.smaaEffect);
    }
    if (this.lutEffect) {
      SSDispose.dispose(this.lutEffect.lut);
      SSDispose.dispose(this.lutEffect);
    }
    if (this.vignetteEffect) {
      SSDispose.dispose(this.vignetteEffect);
    }
    if (this.hueSaturationEffect) {
      SSDispose.dispose(this.hueSaturationEffect);
    }
    if (this.brightnessContrastEffect) {
      SSDispose.dispose(this.brightnessContrastEffect);
    }

    if (this.toneMappingEffect) {
      SSDispose.dispose(this.toneMappingEffect);
    }

    SSDispose.dispose(this.effectComposer);

    this.ssThreeObject = null;
  };

  constructor(ssThreeObject) {
    this.ssThreeObject = ssThreeObject;
  }

  /**
   * 添加基础渲染
   */
  addEffectComposer = (options?: SSEffectComposerOptions) => {
    if (!this.effectComposer) {
      const { threeScene, threeCamera, threeRenderer } = this.ssThreeObject;
      this.effectComposer = new EffectComposer(threeRenderer, options);
      // 抗锯齿强度
      // this.effectComposer.multisampling = 2;
      this.effectComposer.multisampling = 1;
      //
      this.ssThreeObject.threeEffectComposer = this.effectComposer;
    }
    return this.effectComposer;
  };

  /**
   * 添加色调映射
   */
  addToneMappingEffect = (options?: SSToneMappingEffectOptions) => {
    if (!this.toneMappingEffect) {
      this.toneMappingEffect = new ToneMappingEffect({
        blendFunction: options?.blendFunction,
        mode: options?.mode,
        adaptive: options?.adaptive,
        resolution: options?.resolution,
        middleGrey: options?.middleGrey,
        maxLuminance: options?.maxLuminance,
        whitePoint: options?.whitePoint
      });
    }
    return this.toneMappingEffect;
  };

  /**
   * 添加基础泛光效果
   */
  addBloomEffect = (options?: SSBloomEffectOptions) => {
    if (!this.bloomEffect) {
      const { threeScene, threeCamera, threeRenderer } = this.ssThreeObject;

      this.bloomEffect = new SelectiveBloomEffect(threeScene, threeCamera, {
        resolutionScale: 0.1,
        blendFunction: options.blendFunction,
        luminanceThreshold: options.threshold,
        luminanceSmoothing: options.smoothing,
        mipmapBlur: true,
        intensity: options.intensity
      });
      this.bloomEffect.setSize(128, 128);
      this.bloomEffect.inverted = options.inverted;
      this.bloomEffect.ignoreBackground = options.ignoreBackground;
    }
    return this.bloomEffect;
  };

  /**
   * 添加自发光物体
   * @param object
   */
  addBloomSelectObject = (object) => {
    this.bloomEffect.selection.add(object);
  };

  /**
   * 更新作用项
   */
  updateEffectOptions = (
    effectKey:
      | 'bloomEffect'
      | 'outlineEffect'
      | 'smaaEffect'
      | 'lut3DEffect'
      | 'vignetteEffect'
      | 'hueSaturationEffect'
      | 'brightnessContrastEffect'
      | 'toneMappingEffect',
    propKey: string,
    propValue: any
  ) => {
    switch (effectKey) {
      case 'toneMappingEffect':
        this.updateToneMappingEffectOptions({
          [propKey]: propValue
        });
        break;
      case 'bloomEffect':
        this.updateBloomEffectOptions({
          [propKey]: propValue
        });
        break;
      case 'lut3DEffect':
        this.updateSLUT3DEffectOptions({
          [propKey]: propValue
        });
        break;
      case 'outlineEffect':
        this.updateOutlineEffectOptions({
          [propKey]: propValue
        });
        break;
      case 'smaaEffect':
        this.updateSMAAEffectOptions({
          [propKey]: propValue
        });
        break;
      case 'vignetteEffect':
        this.updateVignetteEffectOptions({
          [propKey]: propValue
        });
        break;
      case 'hueSaturationEffect':
        this.updateHueSaturationEffectOptions({
          [propKey]: propValue
        });
        break;
      case 'brightnessContrastEffect':
        this.updateBrightnessContrastEffectOptions({
          [propKey]: propValue
        });
        break;
      default:
        break;
    }
  };

  /**
   * @description 添加描边效果
   */
  addOutlineEffect = (options: SSOutlineEffectOptions = {}) => {
    if (!this.outlineEffect) {
      const { threeScene, threeCamera, threeRenderer } = this.ssThreeObject;
      const outlineEffect = new OutlineEffect(threeScene, threeCamera, {
        blendFunction: options?.blendFunction,
        edgeStrength: options?.edgeStrength || 4.42, // 亮度，强度
        pulseSpeed: options?.pulseSpeed || 0.7, // 闪烁呼吸频率
        visibleEdgeColor: options?.visibleEdgeColor || new THREE.Color('#00FFFF').getHex(), // 描边颜色
        hiddenEdgeColor: options?.hiddenEdgeColor || new THREE.Color('#00FFFF').getHex(), // 遮挡面颜色
        height: 480,
        blur: options?.blur || false
      });
      this.outlineEffect = outlineEffect;
    }
    return this.outlineEffect;
  };

  /**
   * @description 添加抗锯齿效果
   */
  addSMAAEffect = (option?: SSSMAAEffectOptions) => {
    // 抗锯齿
    if (!this.smaaEffect) {
      this.smaaEffect = new SMAAEffect({
        preset: option?.preset,
        edgeDetectionMode: option?.edgeDetectionMode,
        predicationMode: option?.predicationMode
      });
      // 材质
      const { edgeDetectionMaterial } = this.smaaEffect;
      edgeDetectionMaterial.edgeDetectionThreshold = option?.edgeDetectionThreshold; // 0.02;
      edgeDetectionMaterial.predicationThreshold = option?.predicationThreshold; // 0.002;
      edgeDetectionMaterial.predicationScale = option?.predicationScale || 1;
    }
    return this.smaaEffect;
  };

  /**
   * @description 添加色调饱和度效果
   */
  addHueSaturationEffect = (options?: SSHueSaturationEffect) => {
    if (!this.hueSaturationEffect) {
      this.hueSaturationEffect = new HueSaturationEffect({
        blendFunction: options?.blendFunction,
        hue: options?.hue || 0,
        saturation: options?.saturation || 0
      });
    }
    // 色调饱和度
    return this.hueSaturationEffect;
  };

  /**
   * @description 添加亮度对比度效果
   */
  addBrightnessContrastEffect = (options?: SSBrightnessContrastEffect) => {
    if (!this.brightnessContrastEffect) {
      this.brightnessContrastEffect = new BrightnessContrastEffect({
        blendFunction: options?.blendFunction,
        brightness: options?.brightness || 0,
        contrast: options?.contrast || 0
      });
    }
    // 亮度对比度
    return this.brightnessContrastEffect;
  };

  /**
   * @description 添加滤镜Effect
   */
  addLUTEffect = (options?: SSLUT3DEffectOptions) => {
    if (this.lutEffect) {
      return Promise.resolve(this.lutEffect);
    }

    // 固定纹理
    return new Promise((reslove, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        lutImg,
        (t) => {
          t.generateMipmaps = false;
          t.minFilter = THREE.LinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.wrapS = THREE.ClampToEdgeWrapping;
          t.wrapT = THREE.ClampToEdgeWrapping;
          t.flipY = false;
          reslove(t);
        },
        null,
        reject
      );
    }).then((t: THREE.Texture) => {
      const lut = LookupTexture.from(t);
      this.lutEffect = new LUT3DEffect(lut, {
        blendFunction: options?.blendFunction,
        tetrahedralInterpolation: options?.tetrahedralInterpolation
      });
      return this.lutEffect;
    });
  };

  /**
   * @description 边角压暗 Effect
   */
  addVignetteEffect = (options?: SSVignetteEffectOptions) => {
    if (!this.vignetteEffect) {
      // 边角压暗效果
      this.vignetteEffect = new VignetteEffect({
        blendFunction: options?.blendFunction,
        technique: options?.technique,
        offset: options?.offset,
        darkness: options?.darkness
      });
    }
    return this.vignetteEffect;
  };

  /**
   * 更新基础色调效果
   * @param options
   */
  updateToneMappingEffectOptions = (options?: SSToneMappingEffectOptions) => {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'blendFunction':
          this.toneMappingEffect.blendMode.blendFunction = options.blendFunction;
          break;
        case 'mode':
          this.toneMappingEffect.mode = options.mode;
          break;
        default:
          this.toneMappingEffect[key] = options[key];
          break;
      }
    });
  };

  /**
   * 更新基础泛光效果
   * @param options
   */
  updateBloomEffectOptions = (options?: SSBloomEffectOptions) => {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'blendFunction':
          this.bloomEffect.blendMode.blendFunction = options.blendFunction;
          break;
        case 'opacity':
          this.bloomEffect.blendMode.setOpacity(options.opacity);
          break;
        case 'threshold':
          this.bloomEffect.luminanceMaterial.threshold = options.threshold;
          break;
        case 'smoothing':
          this.bloomEffect.luminanceMaterial.smoothing = options.smoothing;
          break;
        default:
          this.bloomEffect[key] = options[key];
          break;
      }
    });
  };

  /**
   * 更新基础描边效果
   * @param options
   */
  updateOutlineEffectOptions = (options?: SSOutlineEffectOptions) => {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'blendFunction':
          this.outlineEffect.blendMode.blendFunction = options.blendFunction;
          break;
        case 'hiddenEdgeColor':
        case 'visibleEdgeColor':
          this.outlineEffect[key] = new THREE.Color(options[key]);
          break;
        default:
          this.outlineEffect[key] = options[key];
          break;
      }
    });
  };

  /**
   * 修改抗锯齿效果效果
   * @param options
   */
  updateSMAAEffectOptions = (options?: SSSMAAEffectOptions) => {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'preset':
          this.smaaEffect.applyPreset(options.preset);
          break;
        case 'edgeDetectionMode':
          this.smaaEffect.edgeDetectionMaterial.edgeDetectionMode = options.edgeDetectionMode;
          break;
        case 'predicationMode':
          this.smaaEffect.edgeDetectionMaterial.predicationMode = options.predicationMode;
          break;
        default:
          this.smaaEffect[key] = options[key];
          break;
      }
    });
  };

  /**
   * 修改渐晕效果
   * @param options
   */
  updateVignetteEffectOptions = (options?: SSVignetteEffectOptions) => {
    console.log(' 修改边角压暗效果 ');
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'blendFunction':
          this.vignetteEffect.blendMode.blendFunction = options.blendFunction;
          break;
        default:
          this.vignetteEffect[key] = options[key];
          break;
      }
    });
  };

  updateHueSaturationEffectOptions = (options?: SSHueSaturationEffect) => {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'blendFunction':
          this.hueSaturationEffect.blendMode.blendFunction = options.blendFunction;
          break;
        case 'hue':
          this.hueSaturationEffect.hue = options.hue;
          break;
        case 'saturation':
          this.hueSaturationEffect.saturation = options.saturation;
          break;
        default:
          this.hueSaturationEffect[key] = options[key];
          break;
      }
    });
  };

  updateBrightnessContrastEffectOptions = (options?: SSBrightnessContrastEffect) => {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'blendFunction':
          this.brightnessContrastEffect.blendMode.blendFunction = options.blendFunction;
          break;
        case 'brightness':
          this.brightnessContrastEffect.brightness = options.brightness;
          break;
        case 'contrast':
          this.brightnessContrastEffect.contrast = options.contrast;
          break;
        default:
          this.brightnessContrastEffect[key] = options[key];
          break;
      }
    });
  };

  /**
   * 修改滤镜效果
   * @param options
   */
  updateSLUT3DEffectOptions = (options?: SSLUT3DEffectOptions) => {
    Object.keys(options).forEach((key) => {
      switch (key) {
        case 'blendFunction':
          this.lutEffect.blendMode.blendFunction = options.blendFunction;
          break;
        default:
          this.lutEffect[key] = options[key];
          break;
      }
    });
  };

  /**
   * 目标渲染
   */
  render() {
    this.addLUTEffect(this.postProcessOptions.lut3DEffect).then((lutEffect) => {
      const { threeCamera, threeScene } = this.ssThreeObject;
      const effectComposer = this.addEffectComposer({
        // 开启浮点渲染 降低bloom条纹
        frameBufferType: THREE.HalfFloatType // 或 FloatType
      });
      // 添加基础渲染通道
      this.effectComposer.addPass(new RenderPass(threeScene, threeCamera));
      // 合并所有的后处理效果 Merge all effects into one pass.
      const effects = [];
      // let effects = [
      //   // this.addOutlineEffect(this.postProcessOptions.outlineEffect),
      //   // this.addVignetteEffect(this.postProcessOptions.vignetteEffect),
      //   this.addBloomEffect(this.postProcessOptions.bloomEffect),
      //   this.addSMAAEffect(this.postProcessOptions.smaaEffect),
      //   lutEffect
      // ];
      effects.push(this.addOutlineEffect(this.postProcessOptions.outlineEffect));

      effects.push(this.addSMAAEffect(this.postProcessOptions.smaaEffect));
      effects.push(lutEffect);
      if (this.postProcessOptions.bloomEffect) {
        effects.push(this.addBloomEffect(this.postProcessOptions.bloomEffect));
      }
      effects.push(this.addHueSaturationEffect(this.postProcessOptions.hueSaturationEffect));
      effects.push(
        this.addBrightnessContrastEffect(this.postProcessOptions.brightnessContrastEffect)
      );
      effects.push(this.addToneMappingEffect(this.postProcessOptions.toneMappingEffect));

      const effectPass = new EffectPass(threeCamera, ...effects);
      effectPass.renderToScreen = true;
      effectComposer.addPass(effectPass);
      // 开始渲染 ss-three
      this.ssThreeObject.cancelRenderLoop();
      // old
      // this.ssThreeObject.cancelRender();
      SSThreeLoop.add(() => {
        this.effectComposer.render();
      }, 'SSPostProcessPlugin Render');
    });
  }

  /**
   *
   * @param {*} objects [] mesh数组
   * @param {*} visibleEdgeColor 描边颜色
   * @param {*} pulseSpeed 闪烁呼吸频率
   * @param {*} edgeStrength 亮度，强度
   */
  outlineObjects = (objects: THREE.Object3D[]) => {
    const outlineMeshs = [];
    objects.forEach((element) => {
      if (element.type === 'Group') {
        element.traverse((item) => {
          if (item instanceof THREE.Mesh) {
            outlineMeshs.push(item);
          }
        });
      } else {
        outlineMeshs.push(element);
      }
    });
    this.outlineEffect?.selection.set(outlineMeshs);
  };

  /**
   * @description 添加GUI调试
   */
  addDebug = () => {
    if (!this.gui) {
      const params = {
        save: () => {
          const setting: SSGUISettingItem = this.gui.save() as any;
          console.log(' 保存的插件配置：', setting, this.constructor.name);
          const resault = {};
          Object.keys(setting.folders).forEach((key) => {
            resault[key] = setting.folders[key].controllers;
          });
          SSFile.exportJson(resault, `${this.constructor.name}.json`);
        }
      };
      this.gui = new GUI();
      // const gui = new GUI();
      this.gui.domElement.style.position = 'absolute';
      this.gui.domElement.style.top = '0';
      this.gui.domElement.style.left = 'unset';
      this.gui.domElement.style.right = '30px';
      this.gui.domElement.style.zIndex = '100';
      this.gui.title('SSPostProcessPlugin');
      this.gui.open();
      this.gui.add(params, 'save').name('保存设置');
    }

    const specialKeyMap = {
      // blendFunction: Object.keys(BlendFunction).map((item) => BlendFunction[item]),
      // preset: Object.keys(SMAAPreset).map((item) => SMAAPreset[item]),
      // edgeDetectionMode: Object.keys(EdgeDetectionMode).map((item) => EdgeDetectionMode[item]),
      // predicationMode: Object.keys(PredicationMode).map((item) => PredicationMode[item])
      blendFunction: BlendFunction,
      preset: SMAAPreset,
      edgeDetectionMode: EdgeDetectionMode,
      predicationMode: PredicationMode,
      mode: ToneMappingMode
    };

    const colorKeys = ['visibleEdgeColor', 'hiddenEdgeColor'];

    // const { bloomEffect, outlineEffect, vignetteEffect, lut3DEffect, smaaEffect } = this.postProcessOptions;
    Object.keys(this.postProcessOptions).forEach((folderKey) => {
      const folder = this.gui.addFolder(folderKey);
      const options = this.postProcessOptions[folderKey];

      Object.keys(options).forEach((key) => {
        if (specialKeyMap[key]) {
          folder
            .add(options, key, specialKeyMap[key])
            .onChange((e) => {
              this.updateEffectOptions(folderKey as any, key, e);
            })
            .step(0.01)
            .name(key)
            .listen();
        } else if (colorKeys.includes(key)) {
          folder
            .addColor(options, key)
            .onChange((e) => {
              console.log(' 颜色变化的时候 ', e);
              this.updateEffectOptions(folderKey as any, key, e);
            })
            .listen();
        } else {
          folder
            .add(options, key)
            .onChange((e) => {
              this.updateEffectOptions(folderKey as any, key, e);
            })
            .step(0.01)
            .name(key)
            .listen();
        }
      });
    });
  };

  /**
   * 解析配置
   */
  fromJson(json?: SSPostProcessPluginItem) {
    Object.keys(json || {}).forEach((key) => {
      this.postProcessOptions[key] = {
        ...(this.postProcessOptions[key] || {}),
        ...json[key]
      };
    });
    this.render();
  }
}
