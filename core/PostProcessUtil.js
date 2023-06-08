import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
// 后处理
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
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
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import { SepiaShader } from 'three/examples/jsm/shaders/SepiaShader';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader';
import { LuminosityHighPassShader } from 'three/examples/jsm/shaders/LuminosityHighPassShader';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader';
import { BleachBypassShader } from 'three/examples/jsm/shaders/BleachBypassShader';
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass';
import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass';
import ThreeLoop from './threeLoop';

export default class PostProcessUtil {
  // 是否打开GUI调试
  isOpenPostEffectGui = window.ENV.DEBUG;

  _scene = null;

  _camera = null;

  _render = null;

  _container = null;

  // GUI 属性配置文件
  _postSetting = null;

  _defaultSetting = {
    preset: 'Default',
    closed: false,
    remembered: {
      Default: {
        0: {
          strength: 0.001,
          threshold: 1,
          radius: 0
        },
        1: {
          enabled: false
        },
        2: {
          opacity: 0
        },
        3: {
          enabled: false
        },
        4: {
          brightness: 0
        },
        5: {
          contrast: 0
        },
        6: {
          enabled: false
        },
        7: {
          color: {
            r: 255,
            g: 255,
            b: 255
          }
        },
        8: {
          enabled: false
        },
        9: {
          powRGB_x: 2,
          powRGB_y: 2,
          powRGB_z: 2
        },
        10: {
          mulRGB_x: 1,
          mulRGB_y: 1,
          mulRGB_z: 1
        },
        11: {
          addRGB_x: 0,
          addRGB_y: 0,
          addRGB_z: 0
        },
        12: {
          enabled: false
        },
        13: {
          enabled: true
        },
        14: {
          hue: 0
        },
        15: {
          saturation: 0.29
        },
        16: {
          enabled: false
        },
        17: {
          enabled: false
        },
        18: {
          angle: 0
        },
        19: {
          amount: 0
        },
        20: {
          enabled: true
        },
        21: {
          offset: 1.37
        },
        22: {
          darkness: 0
        }
      }
    },
    folders: {
      '辉光-BloomPass': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      '镀银-BleachBypass': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      '亮度/对比度-BrightnessContrast': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      '颜色覆盖-Colorify': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      '颜色分布-ColorCorrection': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      GammaCorrection: {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      '色调/饱和度-HueSaturation': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      '亮度-Luminosity': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      'rgb颜色分离-rgbShift': {
        preset: 'Default',
        closed: true,
        folders: {}
      },
      '晕映-vignette': {
        preset: 'Default',
        closed: true,
        folders: {}
      }
    }
  };

  constructor({ scene, camera, render, container, postSetting }) {
    this._scene = scene;
    this._camera = camera;
    this._render = render;
    this._container = container;
    this._postSetting = postSetting || this._defaultSetting;
  }

  /**
   * @type {GUI}
   */
  _gui = null;

  addFilmPassControls = (gui, controls, effectFilm) => {
    controls.grayScale = false;
    controls.noiseIntensity = 0.8;
    controls.scanlinesIntensity = 0.325;
    controls.scanlinesCount = 256;

    controls.updateFilmPass = () => {
      if (controls.grayScale !== undefined) effectFilm.uniforms.grayscale.value = controls.grayScale;
      if (controls.noiseIntensity !== undefined) effectFilm.uniforms.nIntensity.value = controls.noiseIntensity;
      if (controls.scanlinesIntensity !== undefined) effectFilm.uniforms.sIntensity.value = controls.scanlinesIntensity;
      if (controls.scanlinesCount !== undefined) effectFilm.uniforms.sCount.value = controls.scanlinesCount;
    };

    const filmFolder = gui.addFolder('FilmPass');
    filmFolder.add(controls, 'grayScale').onChange(controls.updateFilmPass);
    filmFolder.add(controls, 'noiseIntensity', 0, 1, 0.01).onChange(controls.updateFilmPass);
    filmFolder.add(controls, 'scanlinesIntensity', 0, 1, 0.01).onChange(controls.updateFilmPass);
    filmFolder.add(controls, 'scanlinesCount', 0, 500, 1).onChange(controls.updateFilmPass);
  };

  // bloom辉光效果
  addUnrealBloom = (gui, controls, bloomPass, callback) => {
    // Bloom通道创建
    // let bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.renderToScreen = true;
    gui.remember(controls);
    const bloomFolder = gui.addFolder('辉光-BloomPass');
    bloomFolder.add(bloomPass, 'enabled', false).onChange((boolean) => {
      bloomPass.enabled = boolean;
      gui.updateDisplay();
      callback?.();
    });
    if (controls.strength) bloomPass.strength = controls.strength;
    bloomFolder.add(controls, 'strength', 0.001, 5, 0.001).onChange((v) => {
      bloomPass.strength = v;
      gui.updateDisplay();
    });
    if (controls.threshold) bloomPass.threshold = controls.threshold;
    bloomFolder.add(controls, 'threshold', 0, 1, 0.001).onChange((v) => {
      bloomPass.threshold = v;
      gui.updateDisplay();
      callback?.();
    });
    if (controls.radius) bloomPass.radius = controls.radius;
    bloomFolder.add(controls, 'radius', 0, 10, 0.1).onChange((v) => {
      bloomPass.radius = v;
      gui.updateDisplay();
      callback?.();
    });
  };

  addDotScreenPassControls(gui, controls, dotscreen) {
    controls.centerX = 0.5;
    controls.centerY = 0.5;
    controls.angle = 1;
    controls.scale = 1;

    controls.updateDotScreen = () => {
      dotscreen.uniforms.center.value.copy(new THREE.Vector2(controls.centerX, controls.centerY));
      dotscreen.uniforms.angle.value = controls.angle;
      dotscreen.uniforms.scale.value = controls.scale;
    };

    const dsFolder = gui.addFolder('DotScreenPass');
    dsFolder.add(controls, 'centerX', 0, 5, 0.01).onChange(controls.updateDotScreen);
    dsFolder.add(controls, 'centerY', 0, 5, 0.01).onChange(controls.updateDotScreen);
    dsFolder.add(controls, 'angle', 0, 3.14, 0.01).onChange(controls.updateDotScreen);
    dsFolder.add(controls, 'scale', 0, 10).onChange(controls.updateDotScreen);
  }

  addGlitchPassControls = (gui, controls, glitchPass, callback) => {
    controls.dtsize = 64;
    const gpFolder = gui.addFolder('GlitchPass');
    gpFolder.add(controls, 'dtsize', 0, 1024).onChange((e) => {
      // callback(new THREE.GlitchPass(e));
    });
  };

  addHalftonePassControls = (gui, controls, htshader, callback) => {
    controls.shape = 1;
    controls.radius = 4;
    controls.rotateR = (Math.PI / 12) * 1;
    controls.rotateG = (Math.PI / 12) * 2;
    controls.rotateB = (Math.PI / 12) * 2;
    controls.scatter = 0;
    controls.width = 1;
    controls.height = 1;
    controls.blending = 1;
    controls.blendingMode = 1;
    controls.greyscale = false;

    function applyParams() {
      const newPass = new THREE.HalftonePass(controls.width, controls.height, controls);
      callback(newPass);
    }

    const htFolder = gui.addFolder('HalfTonePass');
    htFolder
      .add(controls, 'shape', { dot: 1, ellipse: 2, line: 3, square: 4 })
      .onChange(applyParams);
    htFolder.add(controls, 'radius', 0, 40, 0.1).onChange(applyParams);
    htFolder.add(controls, 'rotateR', 0, Math.PI * 2, 0.1).onChange(applyParams);
    htFolder.add(controls, 'rotateG', 0, Math.PI * 2, 0.1).onChange(applyParams);
    htFolder.add(controls, 'rotateB', 0, Math.PI * 2, 0.1).onChange(applyParams);
    htFolder.add(controls, 'scatter', 0, 2, 0.1).onChange(applyParams);
    htFolder.add(controls, 'width', 0, 15, 0.1).onChange(applyParams);
    htFolder.add(controls, 'height', 0, 15, 0.1).onChange(applyParams);
    htFolder.add(controls, 'blending', 0, 2, 0.01).onChange(applyParams);
    htFolder
      .add(controls, 'blendingMode', {
        linear: 1,
        multiply: 2,
        add: 3,
        lighter: 4,
        darker: 5
      })
      .onChange(applyParams);
    htFolder.add(controls, 'greyscale').onChange(applyParams);
  };

  addOutlinePassControls = (gui, controls, outlinePass) => {
    controls.edgeStrength = 3.0;
    controls.edgeGlow = 0.0;
    controls.edgeThickness = 1.0;
    controls.pulsePeriod = 0;
    controls.usePatternTexture = false;

    const folder = gui.addFolder('OutlinePass');
    folder.add(controls, 'edgeStrength', 0.01, 10).onChange((value) => {
      outlinePass.edgeStrength = Number(value);
    });
    folder.add(controls, 'edgeGlow', 0.0, 1).onChange((value) => {
      outlinePass.edgeGlow = Number(value);
    });
    folder.add(controls, 'edgeThickness', 1, 4).onChange((value) => {
      outlinePass.edgeThickness = Number(value);
    });
    folder.add(controls, 'pulsePeriod', 0.0, 5).onChange((value) => {
      outlinePass.pulsePeriod = Number(value);
    });

    const colors = {
      visibleEdgeColor: '#ffffff',
      hiddenEdgeColor: '#190a05'
    };

    folder.addColor(colors, 'visibleEdgeColor').onChange((value) => {
      outlinePass.visibleEdgeColor.set(value);
    });
    folder.addColor(colors, 'hiddenEdgeColor').onChange((value) => {
      outlinePass.hiddenEdgeColor.set(value);
    });
  };

  addUnrealBloomPassControls = (gui, controls, bloomPass, callback) => {
    controls.resolution = 256;
    controls.strength = 1;
    controls.radius = 0.1;
    controls.threshold = 0.1;

    const newBloom = () => {
      const newPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(controls.resolution, controls.resolution),
        controls.strength,
        controls.radius,
        controls.threshold
      );

      callback(newPass);
    };

    const folder = gui.addFolder('UnrealBloom');
    folder.add(controls, 'resolution', 2, 1024, 2).onChange(newBloom);
    folder.add(controls, 'strength', 0, 10, 0.1).onChange(newBloom);
    folder.add(controls, 'radius', 0, 10, 0.01).onChange(newBloom);
    folder.add(controls, 'threshold', 0, 0.2, 0.01).onChange(newBloom);
  };

  addSepiaShaderControls = (gui, controls, shaderPass) => {
    controls.amount = 1;
    const folder = gui.addFolder('SepiaShader');
    folder.add(controls, 'amount', 0, 10, 0.1).onChange((e) => {
      shaderPass.uniforms.amount.value = e;
    });
  };

  addColorifyShaderControls(gui, controls, shaderPass) {
    const folder = gui.addFolder('ColorifyShader');
    controls.color = 0xffffff;

    folder.addColor(controls, 'color').onChange((value) => {
      shaderPass.uniforms.color.value = new THREE.Color(value);
    });
  }

  addShaderControl(gui, folderName, shaderPass, toSet, enabled) {
    this._gui = gui;
    const uniformOrDefault = (uniforms, key, def) =>
      // return uniforms[key].value !== undefined && uniforms[key].value !== null ? uniforms[key].value : def;
      def !== undefined && def !== null ? def : uniforms[key].value;
    const addUniformBool = (folder, key, value, shader) => {
      const localControls = {};
      // localControls[key] = uniformOrDefault(shader.uniforms, key, 0);
      localControls[key] = uniformOrDefault(shader.uniforms, key, value);
      this._gui.remember(localControls);
      if (localControls[key]) {
        shader.uniforms[key].value = localControls[key];
      }
      folder.add(localControls, key).onChange((v) => {
        shader.uniforms[key].value = v;
        gui.updateDisplay();
      });
    };

    const addUniformFloat = (folder, key, value, from, to, step, shader) => {
      const localControls = {};
      // localControls[key] = uniformOrDefault(shader.uniforms, key, 0);
      localControls[key] = uniformOrDefault(shader.uniforms, key, value);
      this._gui.remember(localControls);
      if (localControls[key]) {
        shader.uniforms[key].value = localControls[key];
      }
      folder.add(localControls, key, from, to, step).onChange((v) => {
        shader.uniforms[key].value = v;
        gui.updateDisplay();
      });
    };

    const addUniformColor = (folder, key, value, shader) => {
      const localControls = {};
      // localControls[key] = uniformOrDefault(shader.uniforms, key, new THREE.Color(0xffffff));
      localControls[key] = uniformOrDefault(shader.uniforms, key, value);
      this._gui.remember(localControls);
      if (localControls[key]) {
        shader.uniforms[key].value = localControls[key];
      }
      folder.addColor(localControls, key).onChange((value) => {
        shader.uniforms[key].value = new THREE.Color().setRGB(
          value.r / 255,
          value.g / 255,
          value.b / 255
        );
        gui.updateDisplay();
      });
    };

    const addUniformVector3 = (folder, key, value, shader, from, to, step) => {
      // let startValue = uniformOrDefault(shader.uniforms, key, new THREE.Vector3(0, 0, 0));
      const startValue = uniformOrDefault(shader.uniforms, key, value);
      const keyX = `${key}_x`;
      const keyY = `${key}_y`;
      const keyZ = `${key}_z`;

      const localControls = {};
      localControls[keyX] = startValue.x;
      localControls[keyY] = startValue.y;
      localControls[keyZ] = startValue.z;
      this._gui.remember(localControls);
      if (localControls[keyX]) {
        // shader.uniforms[key].value = localControls[key];
        shader.uniforms[key].value.x = localControls[keyX];
        shader.uniforms[key].value.y = localControls[keyY];
        shader.uniforms[key].value.z = localControls[keyZ];
      }
      folder.add(localControls, keyX, from.x, to.x, step.x).onChange((v) => {
        console.log(shader.uniforms[key].value);
        shader.uniforms[key].value.x = v;
        gui.updateDisplay();
      });
      folder.add(localControls, keyY, from.x, to.x, step.x).onChange((v) => {
        shader.uniforms[key].value.y = v;
        gui.updateDisplay();
      });
      folder.add(localControls, keyZ, from.x, to.x, step.x).onChange((v) => {
        shader.uniforms[key].value.z = v;
        gui.updateDisplay();
      });
    };

    const addUniformVector2 = (folder, key, value, shader, from, to, step) => {
      // let startValue = uniformOrDefault(shader.uniforms, key, new THREE.Vector2(0, 0));
      const startValue = uniformOrDefault(shader.uniforms, key, value);
      shader.uniforms[key].value = startValue;

      const keyX = `${key}_x`;
      const keyY = `${key}_y`;

      const localControls = {};
      localControls[keyX] = startValue.x;
      localControls[keyY] = startValue.y;
      this._gui.remember(localControls);
      if (localControls[key]) {
        shader.uniforms[key].value = localControls[key];
      }
      folder.add(localControls, keyX, from.x, to.x, step.x).onChange((v) => {
        shader.uniforms[key].value.x = v;
        gui.updateDisplay();
      });
      folder.add(localControls, keyY, from.y, to.y, step.y).onChange((v) => {
        shader.uniforms[key].value.y = v;
        gui.updateDisplay();
      });
    };

    // create the folder and set enabled
    const folder = gui.addFolder(folderName);
    if (toSet.setEnabled !== undefined ? toSet.setEnabled : true) {
      shaderPass.enabled = enabled !== undefined ? enabled : false;
      this._gui.remember(shaderPass);
      folder.add(shaderPass, 'enabled');
      gui.updateDisplay();
    }

    if (toSet.floats !== undefined) {
      toSet.floats.forEach((p) => {
        const value = p.value !== undefined ? p.value : 0;
        const from = p.from !== undefined ? p.from : 0;
        const to = p.from !== undefined ? p.to : 1;
        const step = p.from !== undefined ? p.step : 0.01;
        addUniformFloat(folder, p.key, value, from, to, step, shaderPass);
      });
    }

    if (toSet.colors !== undefined) {
      toSet.colors.forEach((p) => {
        addUniformColor(folder, p.key, p.value, shaderPass);
      });
    }

    if (toSet.vector3 !== undefined) {
      toSet.vector3.forEach((p) => {
        addUniformVector3(folder, p.key, p.value, shaderPass, p.from, p.to, p.step);
      });
    }

    if (toSet.vector2 !== undefined) {
      toSet.vector2.forEach((p) => {
        addUniformVector2(folder, p.key, p.value, shaderPass, p.from, p.to, p.step);
      });
    }

    if (toSet.booleans !== undefined) {
      toSet.booleans.forEach((p) => {
        addUniformBool(folder, p.key, p.value, shaderPass);
      });
    }
  }

  /**
   * 初始化后处理效果
   * @returns {effectComposer: EffectComposer, outlinePass: (*|null)}
   */
  initPostProcess = (_effectComposer) => {
    // const _pixelRatio = window.devicePixelRatio;
    // let _effectComposer = new EffectComposer(this._render);
    // _effectComposer.renderTarget1.texture.encoding = THREE.sRGBEncoding;
    // _effectComposer.renderTarget2.texture.encoding = THREE.sRGBEncoding;
    // _effectComposer.setSize(
    //   this._container.clientWidth * _pixelRatio,
    //   this._container.clientHeight * _pixelRatio
    // );

    const renderPass = new RenderPass(this._scene, this._camera);
    const effectCopy = new ShaderPass(CopyShader);
    effectCopy.renderToScreen = true;

    // _effectComposer.removePass();
    // 1.描边通道---------------------
    // 物体边缘发光通道
    // let _outlinePass = new OutlinePass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   this._scene,
    //   this._camera
    // );
    // _outlinePass.edgeStrength = Number(10); //边缘长度
    // _outlinePass.edgeGlow = Number(1); //边缘辉光
    // _outlinePass.edgeThickness = Number(0.5); //边缘厚度 值越小越明显
    // _outlinePass.pulsePeriod = Number(0); //一闪一闪周期
    // _outlinePass.visibleEdgeColor.set(0xffff00); //没有被遮挡的outline的颜色
    // _outlinePass.hiddenEdgeColor.set(0xff0000); //被遮挡的outline的颜色
    // this._outlinePass = _outlinePass;

    // bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );

    // 2.抗锯齿通道  使用FXAAShader---------------------
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this._render.getPixelRatio();
    fxaaPass.material.uniforms.resolution.value.x = 1 / (this._container.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms.resolution.value.y = 1 / (this._container.offsetHeight * pixelRatio);

    const bleachByPassFilter = new ShaderPass(BleachBypassShader);
    const brightnessContrastShader = new ShaderPass(BrightnessContrastShader);
    const colorifyShader = new ShaderPass(ColorifyShader);
    const colorCorrectionShader = new ShaderPass(ColorCorrectionShader);
    const gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
    const hueSaturationShader = new ShaderPass(HueSaturationShader);
    // let luminosityHighPassShader = new ShaderPass(LuminosityHighPassShader);
    const luminosityShader = new ShaderPass(LuminosityShader);
    // let mirrorShader = new ShaderPass(MirrorShader)
    const pixelShader = new ShaderPass(PixelShader);
    pixelShader.uniforms.resolution.value = new THREE.Vector2(256, 256);
    const rgbShiftShader = new ShaderPass(RGBShiftShader);
    // let sepiaShader = new ShaderPass(SepiaShader);
    const vignetteShader = new ShaderPass(VignetteShader);

    // let ssrPass = new SSRPass({
    //   renderer: this._render,
    //   scene: this._scene,
    //   camera: this._camera,
    //   width: innerWidth,
    //   height: innerHeight,
    //   // groundReflector: null,
    //   // selects: null
    // });

    _effectComposer.addPass(renderPass);
    // _effectComposer.addPass(_outlinePass);
    _effectComposer.addPass(bloomPass);

    _effectComposer.addPass(bleachByPassFilter);
    _effectComposer.addPass(brightnessContrastShader);
    _effectComposer.addPass(colorifyShader);
    _effectComposer.addPass(colorCorrectionShader);
    _effectComposer.addPass(gammaCorrectionShader);
    _effectComposer.addPass(hueSaturationShader);
    // _effectComposer.addPass(luminosityHighPassShader);--
    _effectComposer.addPass(luminosityShader);
    // _effectComposer.addPass(pixelShader);--
    _effectComposer.addPass(rgbShiftShader);
    // _effectComposer.addPass(sepiaShader);--
    _effectComposer.addPass(vignetteShader);
    _effectComposer.addPass(fxaaPass);
    // _effectComposer.addPass(ssrPass);--

    _effectComposer.addPass(effectCopy);
    this._effectComposer = _effectComposer;
    if (window.ENV.DEBUG) {
      window.effect = this._effectComposer;
    }

    // setup controls
    const gui = new GUI({
      load: this._postSetting
    });
    // let gui = new GUI();
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '1.5rem';
    gui.domElement.style.right = '5rem';
    gui.name = '后处理效果调试配置';
    gui.width = 300;
    gui.zIndex = 1000;
    gui.closed = true;
    gui.updateDisplay();
    // var controls = {};
    // 辉光效果
    const bloomControls = {
      strength: this._postSetting.remembered.Default['0'].strength,
      threshold: this._postSetting.remembered.Default['0'].threshold,
      radius: this._postSetting.remembered.Default['0'].radius
    };
    this.addUnrealBloom(gui, bloomControls, bloomPass);

    // 镀银的效果
    this.addShaderControl(
      gui,
      '镀银-BleachBypass',
      bleachByPassFilter,
      {
        floats: [
          {
            key: 'opacity',
            value: this._postSetting.remembered.Default['2'].opacity,
            from: 0,
            to: 1,
            step: 0.01
          }
        ]
      },
      true
    );
    // 改变亮度和对比度
    this.addShaderControl(gui, '亮度/对比度-BrightnessContrast', brightnessContrastShader, {
      floats: [
        {
          key: 'brightness',
          value: this._postSetting.remembered.Default['4'].brightness,
          from: 0,
          to: 1,
          step: 0.01
        },
        {
          key: 'contrast',
          value: this._postSetting.remembered.Default['5'].contrast,
          from: 0,
          to: 1,
          step: 0.01
        }
      ]
    });
    // 将某种颜色覆盖到整个屏幕
    this.addShaderControl(gui, '颜色覆盖-Colorify', colorifyShader, {
      colors: [{ key: 'color', value: this._postSetting.remembered.Default['7'].color }]
    });
    // 调整颜色的分布
    this.addShaderControl(gui, '颜色分布-ColorCorrection', colorCorrectionShader, {
      vector3: [
        {
          key: 'powRGB',
          value: {
            x: this._postSetting.remembered.Default['9'].powRGB_x,
            y: this._postSetting.remembered.Default['9'].powRGB_y,
            z: this._postSetting.remembered.Default['9'].powRGB_z
          },
          from: { x: 0, y: 0, z: 0 },
          to: { x: 5, y: 5, z: 5 },
          step: { x: 0.01, y: 0.01, z: 0.01 }
        },
        {
          key: 'mulRGB',
          value: {
            x: this._postSetting.remembered.Default['10'].mulRGB_x,
            y: this._postSetting.remembered.Default['10'].mulRGB_y,
            z: this._postSetting.remembered.Default['10'].mulRGB_z
          },
          from: { x: 0, y: 0, z: 0 },
          to: { x: 5, y: 5, z: 5 },
          step: { x: 0.01, y: 0.01, z: 0.01 }
        },
        {
          key: 'addRGB',
          value: {
            x: this._postSetting.remembered.Default['11'].addRGB_x,
            y: this._postSetting.remembered.Default['11'].addRGB_y,
            z: this._postSetting.remembered.Default['11'].addRGB_z
          },
          from: { x: 0, y: 0, z: 0 },
          to: { x: 1, y: 1, z: 1 },
          step: { x: 0.01, y: 0.01, z: 0.01 }
        }
      ]
    });
    // sRGB 颜色空间
    this.addShaderControl(gui, 'GammaCorrection', gammaCorrectionShader, {});
    // 改变颜色的色调和饱和度
    this.addShaderControl(gui, '色调/饱和度-HueSaturation', hueSaturationShader, {
      floats: [
        {
          key: 'hue',
          value: this._postSetting.remembered.Default['14'].hue,
          from: -1,
          to: 1,
          step: 0.01
        },
        {
          key: 'saturation',
          value: this._postSetting.remembered.Default['15'].saturation,
          from: -1,
          to: 1,
          step: 0.01
        }
      ]
    });
    // // LuminosityHighPass
    // this.addShaderControl(gui, 'LuminosityHighPass', luminosityHighPassShader, {
    //     colors: [{key: 'defaultColor'}],
    //     floats: [
    //         {key: 'luminosityThreshold', from: 0, to: 2, step: 0.01},
    //         {key: 'smoothWidth', from: 0, to: 2, step: 0.01},
    //         {key: 'defaultOpacity', from: 0, to: 1, step: 0.01}
    //     ]
    // });
    // 提高亮度
    this.addShaderControl(gui, '亮度-Luminosity', luminosityShader, {});
    // rgb颜色分离
    this.addShaderControl(gui, 'rgb颜色分离-rgbShift', rgbShiftShader, {
      floats: [
        { key: 'angle', from: 0, to: 6.28, step: 0.001 },
        { key: 'amount', from: 0, to: 0.5, step: 0.001 }
      ]
    });
    // 添加晕映效果，四角压边
    this.addShaderControl(gui, '晕映-vignette', vignetteShader, {
      floats: [
        {
          key: 'offset',
          value: this._postSetting.remembered.Default['21'].offset,
          from: 0,
          to: 10,
          step: 0.01
        },
        // { key: 'offset', from: 0, to: 10, step: 0.01 },
        {
          key: 'darkness',
          value: this._postSetting.remembered.Default['22'].darkness,
          from: 0,
          to: 10,
          step: 0.01
        }
      ]
    });

    if (this.isOpenPostEffectGui) {
      gui.show();
    } else {
      gui.hide();
    }
    // 查找outline通道
    // let outlinePass = this._findPass(this._outlinePass);
    return {
      effectComposer: _effectComposer
      // outlinePass: outlinePass
    };
  };
  // /**
  //  * 局部辉光
  //  */

  // _BloomPass = (obj) => {
  //   let materials = {};

  //   const BLOOM_LAYER = 1;
  //   const bloomLayer = new THREE.Layers();
  //   bloomLayer.set(BLOOM_LAYER);
  //   let renderPass = new RenderPass(this._scene, this._camera);
  //   let unrealBloomComposer = new EffectComposer(this._render);
  //   unrealBloomComposer.renderToScreen = false; // 不渲染到屏幕上
  //   unrealBloomComposer.addPass(renderPass);
  //   // 最终真正渲染到屏幕上的效果合成器 finalComposer
  //   const finalComposer = new EffectComposer(this._render);
  //   finalComposer.addPass(renderPass);
  //   // 创建unreal辉光通道
  //   const unrealBloomPass = new UnrealBloomPass();
  //   unrealBloomPass.threshold = 0.0; // 阈值，
  //   unrealBloomPass.strength = 3; // 强度
  //   unrealBloomPass.radius = 0.01; // 范围
  //   unrealBloomComposer.addPass(unrealBloomPass);
  //   const shaderPass = new ShaderPass(
  //     new THREE.ShaderMaterial({
  //       uniforms: {
  //         baseTexture: { value: null },
  //         bloomTexture: { value: unrealBloomComposer.renderTarget2.texture }
  //       },
  //       vertexShader: `
  //       varying vec2 vUv;
  //       void main() {
  //         vUv = uv;
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  //       }
  //     `,
  //       fragmentShader: `
  //       uniform sampler2D baseTexture;
  //       uniform sampler2D bloomTexture;
  //       varying vec2 vUv;
  //       void main() {
  //         gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
  //       }
  //     `,
  //       defines: {}
  //     }),
  //     'baseTexture'
  //   );
  //   shaderPass.needsSwap = true;
  //   finalComposer.addPass(shaderPass);

  //   //将选中以外的模型材质转为黑色
  //   let _darkenNonBloomed = (obj) => {
  //     const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' }); //黑色材质
  //     if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
  //       materials[obj.uuid] = obj.material;
  //       obj.material = darkMaterial;
  //     }
  //   };

  //   //再将黑色材质转为原始材质
  //   let _restoreMaterial = (obj) => {
  //     if (materials[obj.uuid]) {
  //       obj.material = materials[obj.uuid];
  //       bloomLayer.set(31);
  //       delete materials[obj.uuid];
  //     }
  //   };
  //   // 利用 darkenNonBloomed 函数将除辉光物体外的其他物体的材质转成黑色

  //   let bloomLight = () => {
  //     this._scene.traverse(_darkenNonBloomed);
  //     unrealBloomComposer.render();
  //     //将转成黑色材质的物体还原成初始材质
  //     this._scene.traverse(_restoreMaterial);
  //     finalComposer.render();
  //   };
  //   // let frameRender = () => {
  //   //   window.requestAnimationFrame(() => {
  //   //     bloomLight();
  //   //     bloomLayer.set(BLOOM_LAYER);
  //   //     console.log('执行辉光');
  //   //     // _BloomPass(obj);
  //   //     frameRender();
  //   //   });
  //   // };
  //   // frameRender();

  //   ThreeLoop.add(()=>{
  //     bloomLight();
  //       bloomLayer.set(BLOOM_LAYER);
  //   }, '辉光 render')
  // };

  // 查找通道
  _findPass = (pass) => {
    const index = this._effectComposer.passes.indexOf(pass);
    if (index !== -1) {
      return this._effectComposer.passes[index];
    }
    return null;
  };

  /**
   * 移除 调试工具gui,释放内存
   */
  destroy = () => {
    // console.log(' 后处理 移除处理 ', this._effectComposer.passes);
    // this._effectComposer.passes = [];
    // this._effectComposer.renderTarget1.dispose();
    // this._effectComposer.renderTarget2.dispose();
    // this._effectComposer.writeBuffer = null;
    // this._effectComposer.readBuffer = null;
    // this._effectComposer.copyPass = null;
    // this._effectComposer = null;
    window.effect = null;
    if (this._gui !== null) {
      this._gui.destroy();
      this._gui = null;
    }
  };
}
