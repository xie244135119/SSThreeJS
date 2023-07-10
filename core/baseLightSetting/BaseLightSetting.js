/*
 * Author  Kayson.Wan
 * Date  2023-03-30 16:41:16
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-21 10:33:25
 * Description  基础光照调试
 */
import * as THREE from 'three';
import GUI from 'lil-gui';
import ThreeJs from '..';

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

  // GUI 属性配置文件
  guiSetting = null;

  defaultSetting = {
    controllers: { 输出设置: '' },
    folders: {
      环境: { controllers: { tone曝光度: 1, toneMaping: 1 }, folders: {} },
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
          阴影分辨率: [1024, 2048, 4096],
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
    // this.addCubeMap();
    this.startShadowTest(gui);
  }

  /**
   * 阴影测试 gui
   * @param {*} directionalLight
   */
  startShadowTest = (openGui) => {
    const ambientLight = this.threeJs.threeAmbientLight;
    const directionalLight = this.threeJs.threeDirectionLight;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.bias = 0.001;
    // directionalLight.shadow.normalBias = 1;
    // directionalLight.shadow.color = new THREE.Color('red');
    // 测试
    this.threeJs.threeScene.add(this.lightTarget);
    directionalLight.target = this.lightTarget;
    // this.lightTarget.position.set(-455, 0, -54);
    this.lightTarget.position.set(0, 0, 0);

    this.initGui(ambientLight, directionalLight, openGui);
  };

  // 光照gui
  initGui = (ambientLight, directionalLight, openGui) => {
    // const params = {
    //   savePreset() {
    //     // save current values to an object
    //     this.guiSetting = gui.save();
    //     console.log("this.guiSetting:", JSON.stringify(this.guiSetting));
    //     // loadButton.enable();
    //   },
    //   loadPreset() {
    //     gui.load(this.guiSetting);
    //   },
    //   ambientIntensity: 0.2,
    //   ambientLightColor: "#ababab",
    //   visible: true,
    //   directionalIntensity: 1,
    //   directionalLightColor: "#f2e1be", // '#FFFFE0',
    //   far: 500,
    //   near: 0,
    //   toneMappingExposure: 1,
    //   toneMapping: 1,
    //   castShadow: true,
    //   shadowPosition_x: 12,
    //   shadowPosition_y: 55,
    //   shadowPosition_z: -47,
    //   topBottom: 100,
    //   leftRight: 148,
    //   bias: -0.0013000000000000002,
    //   radius: 1,

    //   fog_visible: true,
    //   fog_color: "#c5e7ff",
    //   fog_near: 0,
    //   fog_far: 10000,

    //   background: true,
    //   environment: { none: "none", blueSky: "blueSky" },
    // };
    const setting = this.guiSetting.folders;
    console.log('setting', setting);
    const gui = new GUI();
    const params = {
      savePreset() {
        this.guiSetting = gui.save();
        console.log('this.guiSetting:', JSON.stringify(this.guiSetting));
        params.outPutSetting = JSON.stringify(this.guiSetting);
      },
      outPutSetting: '',
      // loadPreset() {
      //   gui.load(this.guiSetting);
      // },
      toneMappingExposure: setting.环境.controllers.tone曝光度,
      toneMapping: [
        {
          ACES: THREE.ACESFilmicToneMapping,
          Reinhard: THREE.ReinhardToneMapping,
          Linear: THREE.LinearToneMapping
        }
      ],
      ambientLightColor: setting.灯光.controllers.环境光颜色,
      ambientIntensity: setting.灯光.controllers.环境光强度,
      directionalLightColor: setting.灯光.controllers.平行光颜色,
      directionalIntensity: setting.灯光.controllers.平行光强度,
      visible: setting.灯光.controllers.启用平行光,
      shadowPosition_x: setting.灯光.controllers.平行光位置x,
      shadowPosition_y: setting.灯光.controllers.平行光位置y,
      shadowPosition_z: setting.灯光.controllers.平行光位置z,
      //
      castShadow: setting.阴影.controllers.接收阴影,
      mapSize: [1024, 2048, 4096],
      // exponent: setting.exponent,
      // target: setting.target,

      near: setting.阴影.controllers.shadowCamera最近距离,
      far: setting.阴影.controllers.shadowCamera最远距离,
      topBottom: setting.阴影.controllers.阴影范围上下宽度,
      leftRight: setting.阴影.controllers.阴影范围左右宽度,
      bias: setting.阴影.controllers.阴影贴图偏差,
      // radius: setting.radius,
      // 雾
      fog_visible: setting.雾.controllers.启用雾,
      fog_color: setting.雾.controllers.雾颜色,
      fog_near: setting.雾.controllers.雾最近距离,
      fog_far: setting.雾.controllers.雾最远距离,

      background: setting.天空盒.controllers.启用背景,
      environment: { none: 'none', blueSky: 'blueSky' }
    };

    gui.domElement.style.position = 'absolute';
    // gui.domElement.style.top = '30.5rem';
    gui.domElement.style.right = '0rem';
    gui.domElement.style.zIndex = 100;
    gui.name = '灯光阴影效果调试配置';
    gui.width = 300;
    gui.closed = true;
    gui.load(this.guiSetting);

    // gui.remember(params);
    gui.add(params, 'savePreset').name('保存设置');
    gui.add(params, 'outPutSetting').name('输出设置').listen();
    // gui.add(params, "loadPreset").name("加载设置");
    // -------环境光-------
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
      .add(params, 'toneMappingExposure', {
        NoTone: THREE.NoToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACES: THREE.ACESFilmicToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Linear: THREE.LinearToneMapping
      })
      .name('toneMaping')
      .onChange((e) => {
        console.log('e', e);
        this.threeJs.threeRenderer.toneMapping = e;
      });
    // -------平行光-------
    const dirfolder = gui.addFolder('灯光');
    ambientLight.intensity = params.ambientIntensity;
    dirfolder
      .add(params, 'ambientIntensity', 0, 5)
      .name('环境光强度')
      .onChange((e) => {
        console.log('ambientLight e', ambientLight, e);
        ambientLight.intensity = e;
      });
    ambientLight.color = new THREE.Color(params.ambientLightColor);
    dirfolder
      .addColor(params, 'ambientLightColor')
      .name('环境光颜色')
      .onChange((e) => {
        // console.log("e", e);
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
      .add(params, 'directionalIntensity', 0, 5)
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
      .add(params, 'shadowPosition_x')
      .name('平行光位置x')
      .onChange((e) => {
        directionalLight.position.x = e;
      });
    dirfolder
      .add(params, 'shadowPosition_y')
      .name('平行光位置y')
      .onChange((e) => {
        directionalLight.position.y = e;
      });
    dirfolder
      .add(params, 'shadowPosition_z')
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
    shadowfolder
      .add(params, 'mapSize', { low: 512, height: 1024, moreHeight: 2048 })
      .name('阴影分辨率')
      .onChange((e) => {
        console.log('e', e);
        directionalLight.shadow.mapSize.width = e;
        directionalLight.shadow.mapSize.height = e;
        directionalLight.shadow.needsUpdate = true; // 标记阴影为需要更新
        this.threeJs.threeRenderer.render(this.threeJs.threeScene, this.threeJs.threeCamera);
      });

    directionalLight.shadow.camera.top = params.topBottom;
    directionalLight.shadow.camera.bottom = -params.topBottom;
    shadowfolder
      .add(params, 'topBottom', 10, 2000, 1)
      .name('阴影范围上下宽度')
      .onChange((e) => {
        directionalLight.shadow.camera.top = e;
        directionalLight.shadow.camera.bottom = -e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
      });
    directionalLight.shadow.camera.left = params.leftRight;
    directionalLight.shadow.camera.right = -params.leftRight;
    shadowfolder
      .add(params, 'leftRight', 10, 2000, 1)
      .name('阴影范围左右宽度')
      .onChange((e) => {
        directionalLight.shadow.camera.left = e;
        directionalLight.shadow.camera.right = -e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
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
      .add(params, 'far', 0, 3000, 1)
      .name('shadowCamera最远距离')
      .onChange((e) => {
        directionalLight.shadow.camera.far = e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
      });
    directionalLight.shadow.camera.near = params.near;
    shadowfolder
      .add(params, 'near', 0, 100, 0.01)
      .name('shadowCamera最近距离')
      .onChange((e) => {
        directionalLight.shadow.camera.near = e;
        directionalLight.shadow.camera.updateWorldMatrix();
        directionalLight.shadow.camera.updateProjectionMatrix();
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
        this.threeJs.ssthreeObject.threeScene.background = e ? this.cubeMap : null;
      });
    cubeMapFolder.add(params, 'environment', { none: 'none', blueSky: 'blueSky' }).onChange((e) => {
      if (e === 'blueSky') {
        this.threeJs.threeScene.environment = this.cubeMap;
      }
      if (e === 'none') {
        this.threeJs.threeScene.environment = null;
      }
    });

    if (!openGui) {
      gui.destroy();
    }
  };

  destory = () => {
    //
  };

  /**
   * 天空盒
   */
  addCubeMap = () => {
    const urls = [
      '/public/threeTextures/天空/q.jpg',
      '/public/threeTextures/天空/w.jpg',
      '/public/threeTextures/天空/e.jpg',
      '/public/threeTextures/天空/r.jpg',
      '/public/threeTextures/天空/t.jpg',
      '/public/threeTextures/天空/y.jpg'
    ];
    const cubeLoader = new THREE.CubeTextureLoader();
    const texture = cubeLoader.load(urls);
    texture.encoding = THREE.LinearEncoding;
    this.cubeMap = texture;
    this.threeJs.threeScene.background = texture;
    this.threeJs.threeScene.environment = texture;
  };
}
