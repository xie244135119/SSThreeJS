/*
 * Author  Kayson.Wan
 * Date  2023-03-30 16:41:16
 * LastEditors  Kayson.Wan
 * LastEditTime  2026-03-12 17:43:07
 * Description  基础光照调试
 */
import * as THREE from 'three';
import GUI from 'lil-gui';
import ThreeJs, { SSDispose } from '..';

/**
 * 光照设调整工具
 */
export default class BaseLightSetting {
  /**
   * @type ThreeJs
   */
  threeJs = null;

  // 灯光照射目标位置
  lightTarget = new THREE.Object3D();

  //
  cubeMap = null;

  // 辅助框
  cameraHelper = null;

  // GUI 属性配置文件
  guiSetting = null;

  // 跟踪几何体
  geometries = [];

  defaultSetting = {
    controllers: { 输出设置: '' },
    folders: {
      环境: {
        controllers: { tone曝光度: 1, toneMaping: THREE.ACESFilmicToneMapping },
        folders: {}
      },
      灯光: {
        controllers: {
          环境光强度: 0.2,
          环境光颜色: '#ababab',
          启用平行光: true,
          平行光强度: 2,
          平行光颜色: '#f2e1be',
          平行光位置x: -89,
          平行光位置y: 160,
          平行光位置z: 27
        },
        folders: {}
      },
      阴影: {
        controllers: {
          接收阴影: true,
          阴影分辨率: 2048,
          阴影范围上下宽度: 100,
          阴影范围左右宽度: 148,
          阴影贴图偏差: -0.0013000000000000002,
          shadowCamera最远距离: 500,
          shadowCamera最近距离: 0
        },
        folders: {}
      },
      雾: {
        controllers: { 启用雾: true, 雾颜色: '#c5e7ff', 雾最近距离: 0, 雾最远距离: 10000 },
        folders: {}
      },
      天空盒: {
        controllers: { 启用背景: true, environment: { none: 'none', blueSky: 'blueSky' } },
        folders: {}
      }
    }
  };

  constructor(threeJs, defaultSetting, gui = true) {
    this.threeJs = threeJs;
    this.guiSetting = defaultSetting || this.defaultSetting;
    this.startShadowTest(gui);
  }

  /**
   * 阴影测试 gui
   * @param {*} directionalLight
   */
  startShadowTest = (openGui) => {
    const ambientLight = this.threeJs.threeAmbientLight;
    const directionalLight = this.threeJs.threeDirectionalLight;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.bias = 0.001;

    this.threeJs.threeScene.add(this.lightTarget);
    directionalLight.target = this.lightTarget;
    this.lightTarget.position.set(0, 0, 0);

    this.initGui(ambientLight, directionalLight, openGui);
  };

  // 光照gui
  initGui = (ambientLight, directionalLight, openGui) => {
    const render = () => {
      if (this.cameraHelper) {
        this.threeJs.threeScene.remove(this.cameraHelper);
        this.cameraHelper.geometry.dispose();
        this.cameraHelper.material.dispose();
        this.cameraHelper = null;
      }
      this.cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
      this.geometries.push(this.cameraHelper.geometry); // 跟踪几何体
      this.threeJs.threeScene.add(this.cameraHelper);
    };

    const setting = this.guiSetting.folders;
    const gui = new GUI();
    const params = {
      savePreset() {
        this.guiSetting = gui.save();
        console.log('this.guiSetting:', JSON.stringify(this.guiSetting));
        params.outPutSetting = JSON.stringify(this.guiSetting);
      },
      outPutSetting: '',
      toneMappingExposure: setting.环境.controllers.tone曝光度,
      toneMapping: setting.环境.controllers.toneMapping,
      ambientLightColor: setting.灯光.controllers.环境光颜色,
      ambientIntensity: setting.灯光.controllers.环境光强度,
      directionalLightColor: setting.灯光.controllers.平行光颜色,
      directionalIntensity: setting.灯光.controllers.平行光强度,
      visible: setting.灯光.controllers.启用平行光,
      shadowPosition_x: setting.灯光.controllers.平行光位置x,
      shadowPosition_y: setting.灯光.controllers.平行光位置y,
      shadowPosition_z: setting.灯光.controllers.平行光位置z,
      castShadow: setting.阴影.controllers.接收阴影,
      mapSize: setting.阴影.controllers.阴影分辨率,
      near: setting.阴影.controllers.shadowCamera最近距离,
      far: setting.阴影.controllers.shadowCamera最远距离,
      topBottom: setting.阴影.controllers.阴影范围上下宽度,
      leftRight: setting.阴影.controllers.阴影范围左右宽度,
      bias: setting.阴影.controllers.阴影贴图偏差,
      fog_visible: setting.雾.controllers.启用雾,
      fog_color: setting.雾.controllers.雾颜色,
      fog_near: setting.雾.controllers.雾最近距离,
      fog_far: setting.雾.controllers.雾最远距离,
      background: setting.天空盒.controllers.启用背景,
      environment: { none: 'none', blueSky: 'blueSky' }
    };

    gui.domElement.style.position = 'absolute';
    gui.domElement.style.right = '0rem';
    gui.domElement.style.zIndex = 100;
    gui.name = '灯光阴影效果调试配置';
    gui.width = 300;
    gui.load(this.guiSetting);

    gui.add(params, 'savePreset').name('保存设置');
    gui.add(params, 'outPutSetting').name('输出设置').listen();

    const envfolder = gui.addFolder('环境');
    this.threeJs.threeRenderer.toneMappingExposure = params.toneMappingExposure;
    envfolder
      .add(params, 'toneMappingExposure', -10, 10, 0.01)
      .name('tone曝光度')
      .onChange((e) => {
        this.threeJs.threeRenderer.toneMappingExposure = e;
      });

    this.threeJs.threeRenderer.toneMapping = params.toneMapping;

    envfolder
      .add(params, 'toneMapping', {
        NoTone: 0, // THREE.NoToneMapping,
        Cineon: 3, //THREE.CineonToneMapping,
        ACES: 4, //THREE.ACESFilmicToneMapping,
        Reinhard: 2, // THREE.ReinhardToneMapping,
        Linear: 1 // THREE.LinearToneMapping
      })
      .name('toneMapping')
      .onChange((e) => {
        console.log('e', e);
        this.threeJs.threeRenderer.toneMapping = e;
      });

    const dirfolder = gui.addFolder('灯光');
    ambientLight.intensity = params.ambientIntensity;
    dirfolder
      .add(params, 'ambientIntensity', 0, 15)
      .name('环境光强度')
      .onChange((e) => {
        ambientLight.intensity = e;
      });
    ambientLight.color = new THREE.Color(params.ambientLightColor);
    dirfolder
      .addColor(params, 'ambientLightColor')
      .name('环境光颜色')
      .onChange((e) => {
        ambientLight.color = new THREE.Color(e);
      });

    dirfolder
      .add(params, 'visible')
      .name('启用平行光')
      .onChange((e) => {
        directionalLight.visible = e;
      });
    directionalLight.intensity = params.directionalIntensity;
    dirfolder
      .add(params, 'directionalIntensity', 0, 15)
      .name('平行光强度')
      .onChange((e) => {
        directionalLight.intensity = e;
      });
    directionalLight.color = new THREE.Color(params.directionalLightColor);
    dirfolder
      .addColor(params, 'directionalLightColor')
      .name('平行光颜色')
      .onChange((e) => {
        directionalLight.color = new THREE.Color(e);
      });
    directionalLight.shadow.camera.far = params.far;

    dirfolder
      .add(params, 'shadowPosition_x', -2000, 2000, 0.1)
      .name('平行光位置x')
      .onChange((e) => {
        directionalLight.position.x = e;
      });
    dirfolder
      .add(params, 'shadowPosition_y', -2000, 2000, 0.1)
      .name('平行光位置y')
      .onChange((e) => {
        directionalLight.position.y = e;
      });
    dirfolder
      .add(params, 'shadowPosition_z', -2000, 2000, 0.1)
      .name('平行光位置z')
      .onChange((e) => {
        directionalLight.position.z = e;
      });

    // -------阴影-------
    const shadowfolder = gui.addFolder('阴影');
    directionalLight.position.set(
      params.shadowPosition_x,
      params.shadowPosition_y,
      params.shadowPosition_z
    );

    directionalLight.castShadow = params.castShadow;
    shadowfolder
      .add(params, 'castShadow')
      .name('接收阴影')
      .onChange((e) => {
        directionalLight.castShadow = e;
      });

    directionalLight.shadow.mapSize.width = params.mapSize;
    directionalLight.shadow.mapSize.height = params.mapSize;
    shadowfolder
      .add(params, 'mapSize', {
        size_512: 512,
        size_1024: 1024,
        size_2048: 2048,
        size_4096: 4096,
        size_8192: 8192
      })
      .name('阴影分辨率')
      .onChange((e) => {
        console.log('e', e);
        directionalLight.shadow.mapSize.width = e;
        directionalLight.shadow.mapSize.height = e;
        directionalLight.shadow.needsUpdate = true; // 标记阴影为需要更新
        directionalLight.shadow.map.dispose(); // 释放旧的贴图
        directionalLight.shadow.map = null; // 强制Three.js重新生成新的贴图
      });

    directionalLight.shadow.camera.top = params.topBottom;
    directionalLight.shadow.camera.bottom = -params.topBottom;
    shadowfolder
      .add(params, 'topBottom', 10, 20000, 1)
      .name('阴影范围上下宽度')
      .onChange((e) => {
        directionalLight.shadow.camera.top = e;
        directionalLight.shadow.camera.bottom = -e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
        render();
      });
    directionalLight.shadow.camera.left = params.leftRight;
    directionalLight.shadow.camera.right = -params.leftRight;
    shadowfolder
      .add(params, 'leftRight', 10, 20000, 1)
      .name('阴影范围左右宽度')
      .onChange((e) => {
        directionalLight.shadow.camera.left = e;
        directionalLight.shadow.camera.right = -e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
        render();
      });
    directionalLight.shadow.bias = params.bias;
    shadowfolder
      .add(params, 'bias', -0.1, 0.1, 0.0001)
      .name('阴影贴图偏差')
      .onChange((e) => {
        directionalLight.shadow.bias = e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
      });

    shadowfolder
      .add(params, 'far', 0, 30000, 1)
      .name('shadowCamera最远距离')
      .onChange((e) => {
        directionalLight.shadow.camera.far = e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
        render();
      });
    directionalLight.shadow.camera.near = params.near;
    shadowfolder
      .add(params, 'near', 0, 100, 0.01)
      .name('shadowCamera最近距离')
      .onChange((e) => {
        directionalLight.shadow.camera.near = e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
        render();
      });
    // directionalLight.shadow.radius = params.radius;
    // shadowfolder.add(params, "radius", -0.1, 3, 0.0001).name('').onChange((e) => {
    //   directionalLight.shadow.radius = e;
    //   directionalLight.shadow.camera.updateWorldMatrix();
    //   directionalLight.shadow.camera.updateProjectionMatrix();
    // });
    // // -------雾-------
    const fogfolder = gui.addFolder('雾');
    this.threeJs.threeScene.fog = params.fog_visible
      ? new THREE.Fog(params.fog_color, params.fog_near, params.fog_far)
      : null;
    fogfolder
      .add(params, 'fog_visible')
      .name('启用雾')
      .onChange((e) => {
        console.log('e', e);
        this.threeJs.threeScene.fog = params.fog_visible
          ? new THREE.Fog(params.fog_color, params.fog_near, params.fog_far)
          : null;
      });
    // this.threeJs.threeScene.fog.near = params.fog_near;
    fogfolder
      .addColor(params, 'fog_color')
      .name('雾颜色')
      .onChange((e) => {
        this.threeJs.threeScene.fog.color = new THREE.Color(e);
      });
    // this.threeJs.threeScene.fog.near = params.fog_near;
    fogfolder
      .add(params, 'fog_near', 0, 60000, 1)
      .name('雾最近距离')
      .onChange((e) => {
        this.threeJs.threeScene.fog.near = e;
      });
    // this.threeJs.threeScene.fog.far = params.fog_far;
    fogfolder
      .add(params, 'fog_far', 0, 60000, 1)
      .name('雾最远距离')
      .onChange((e) => {
        this.threeJs.threeScene.fog.far = e;
      });
    // // -------天空盒-------
    const cubeMapFolder = gui.addFolder('天空盒');
    cubeMapFolder
      .add(params, 'background')
      .name('启用背景')
      .onChange((e) => {
        this.threeJs.ssThreeObject.threeScene.background = e ? this.cubeMap : null;
      });
    cubeMapFolder.add(params, 'environment', { none: 'none', blueSky: 'blueSky' }).onChange((e) => {
      if (e === 'blueSky') {
        this.threeJs.threeScene.environment = this.cubeMap;
      }
      if (e === 'none') {
        this.threeJs.threeScene.environment = null;
      }
    });

    if (openGui) {
      this.cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
      this.threeJs.threeScene.add(this.cameraHelper);
    }

    if (!openGui) {
      gui.destroy();
    }
  };

  /**
   * 释放资源
   */
  dispose() {
    if (this.cameraHelper) {
      this.threeJs.threeScene.remove(this.cameraHelper);
      this.cameraHelper.geometry.dispose();
      this.cameraHelper.material.dispose();
      this.cameraHelper = null;
    }

    this.geometries.forEach((geometry) => {
      geometry.dispose();
    });
    this.geometries = [];

    if (this.lightTarget) {
      this.threeJs.threeScene.remove(this.lightTarget);
    }

    if (this.cubeMap) {
      this.cubeMap.dispose();
      this.cubeMap = null;
    }
  }
}
