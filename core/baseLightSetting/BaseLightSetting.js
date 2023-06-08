/*
 * Author  Kayson.Wan
 * Date  2023-03-30 16:41:16
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-04-06 13:46:05
 * Description  基础光照调试
 */
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import ThreeJs from '..';

/**
 * 光照设调整工具
 */
export default class BaseLightSetting {
  /**
   * @type ThreeJs
   */
  threeJs = null;

  // GUI 属性配置文件
  guiSetting = null;

  defaultSetting = {
    preset: 'Default',
    closed: false,
    remembered: {
      Default: {
        0: {
          ambientIntensity: 0.2,
          ambientLightColor: '#ababab',
          visible: true,
          directionalIntensity: 1,
          directionalLightColor: '#f2e1be', // '#FFFFE0',
          far: 500,
          near: 0,
          toneMappingExposure: 1,
          castShadow: true,
          shadowPosition_x: 12,
          shadowPosition_y: 55,
          shadowPosition_z: -47,
          topBottom: 100,
          leftRight: 148,
          bias: -0.0013000000000000002,
          radius: 1,

          fog_visible: true,
          fog_color: '#c5e7ff',
          fog_near: 0,
          fog_far: 10000
        }
      }
    },
    folders: {
      环境光: {
        preset: 'Default',
        closed: false,
        folders: {}
      },
      平行光: {
        preset: 'Default',
        closed: false,
        folders: {}
      },
      阴影: {
        preset: 'Default',
        closed: false,
        folders: {}
      },
      雾: {
        preset: 'Default',
        closed: false,
        folders: {}
      }
    }
  };

  constructor(threeJs, defaultSetting) {
    this.threeJs = threeJs;
    this.guiSetting = defaultSetting || this.defaultSetting;
    this.shadowTest();
  }

  /**
   * 阴影测试
   * @param {*} directionalLight
   */
  shadowTest = () => {
    const ambientLight = this.threeJs.threeAmbientLight;
    const directionalLight = this.threeJs.threeDirectionLight;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.bias = 0.001;
    // directionalLight.shadow.color = new THREE.Color('red');

    this.initGui(ambientLight, directionalLight);
  };

  // 光照gui
  initGui = (ambientLight, directionalLight) => {
    // const params = {
    //   ambientLightColor: '#ababab',
    //   ambientIntensity: 0.2,
    //   directionalLightColor: '#ababab',
    //   directionalIntensity: 1,
    //   visible: true,
    //   castShadow: true,
    //   exponent: 30,
    //   target: 'plane',
    //   debug: true,
    //   near: 0,
    //   far: 500,
    //   shadowPosition_x: 12,
    //   shadowPosition_y: 55,
    //   shadowPosition_z: -47,
    //   topBottom: 112,
    //   leftRight: 130,
    //   bias: -0.001,
    //   radius: 1
    // };
    const setting = this.guiSetting.remembered.Default[0];
    const params = {
      toneMappingExposure: setting.toneMappingExposure,
      ambientLightColor: setting.ambientLightColor,
      ambientIntensity: setting.ambientIntensity,
      directionalLightColor: setting.directionalLightColor,
      directionalIntensity: setting.directionalIntensity,
      visible: setting.visible,
      castShadow: setting.castShadow,
      exponent: setting.exponent,
      target: setting.target,

      near: setting.near,
      far: setting.far,
      shadowPosition_x: setting.shadowPosition_x,
      shadowPosition_y: setting.shadowPosition_y,
      shadowPosition_z: setting.shadowPosition_z,
      topBottom: setting.topBottom,
      leftRight: setting.leftRight,
      bias: setting.bias,
      radius: setting.radius,
      // 雾
      fog_visible: setting.fog_visible,
      fog_color: setting.fog_color,
      fog_near: setting.fog_near,
      fog_far: setting.fog_far
    };

    const gui = new GUI({
      load: this.guiSetting
    });
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '30.5rem';
    gui.domElement.style.right = '5rem';
    gui.domElement.style.zIndex = 100;
    gui.name = '灯光阴影效果调试配置';
    gui.width = 300;
    gui.closed = false;

    gui.remember(params);

    // -------环境光-------
    const amfolder = gui.addFolder('环境光');
    ambientLight.intensity = params.ambientIntensity;
    amfolder.add(params, 'ambientIntensity', 0, 5).onChange((e) => {
      console.log('e', e);
      ambientLight.intensity = e;
    });
    ambientLight.color = new THREE.Color(params.ambientLightColor);
    amfolder.addColor(params, 'ambientLightColor').onChange((e) => {
      console.log('e', e);
      ambientLight.color = new THREE.Color(e);
    });
    // -------平行光-------
    const dirfolder = gui.addFolder('平行光');
    dirfolder.add(params, 'visible').onChange((e) => {
      directionalLight.visible = e;
    });
    directionalLight.intensity = params.directionalIntensity;
    dirfolder.add(params, 'directionalIntensity', 0, 5).onChange((e) => {
      directionalLight.intensity = e;
    });
    directionalLight.color = new THREE.Color(params.directionalLightColor);
    dirfolder.addColor(params, 'directionalLightColor').onChange((e) => {
      directionalLight.color = new THREE.Color(e);
    });
    directionalLight.shadow.camera.far = params.far;
    dirfolder.add(params, 'far', 0, 3000, 1).onChange((e) => {
      directionalLight.shadow.camera.far = e;
      directionalLight.shadow.camera.updateWorldMatrix();
      directionalLight.shadow.camera.updateProjectionMatrix();
    });
    directionalLight.shadow.camera.near = params.near;
    dirfolder.add(params, 'near', 0, 100, 0.01).onChange((e) => {
      directionalLight.shadow.camera.near = e;
      directionalLight.shadow.camera.updateWorldMatrix();
      directionalLight.shadow.camera.updateProjectionMatrix();
    });
    // -------阴影-------
    const shadowfolder = gui.addFolder('阴影');
    directionalLight.position.set(
      params.shadowPosition_x,
      params.shadowPosition_y,
      params.shadowPosition_z
    );

    this.threeJs.threeRenderer.toneMappingExposure = params.toneMappingExposure;
    shadowfolder.add(params, 'toneMappingExposure').onChange((e) => {
      this.threeJs.threeRenderer.toneMappingExposure = e;
    });

    directionalLight.castShadow = params.castShadow;
    shadowfolder.add(params, 'castShadow').onChange((e) => {
      directionalLight.castShadow = e;
    });
    shadowfolder.add(params, 'shadowPosition_x').onChange((e) => {
      directionalLight.position.x = e;
    });
    shadowfolder.add(params, 'shadowPosition_y').onChange((e) => {
      directionalLight.position.y = e;
    });
    shadowfolder.add(params, 'shadowPosition_z').onChange((e) => {
      directionalLight.position.z = e;
    });

    directionalLight.shadow.camera.top = params.topBottom;
    directionalLight.shadow.camera.bottom = -params.topBottom;
    shadowfolder.add(params, 'topBottom', 10, 2000, 1).onChange((e) => {
      directionalLight.shadow.camera.top = e;
      directionalLight.shadow.camera.bottom = -e;
      directionalLight.shadow.camera.updateWorldMatrix();
      directionalLight.shadow.camera.updateProjectionMatrix();
    });
    directionalLight.shadow.camera.left = params.leftRight;
    directionalLight.shadow.camera.right = -params.leftRight;
    shadowfolder.add(params, 'leftRight', 10, 2000, 1).onChange((e) => {
      directionalLight.shadow.camera.left = e;
      directionalLight.shadow.camera.right = -e;
      directionalLight.shadow.camera.updateWorldMatrix();
      directionalLight.shadow.camera.updateProjectionMatrix();
    });
    directionalLight.shadow.bias = params.bias;
    shadowfolder.add(params, 'bias', -0.1, 0.1, 0.0001).onChange((e) => {
      directionalLight.shadow.bias = e;
      directionalLight.shadow.camera.updateWorldMatrix();
      directionalLight.shadow.camera.updateProjectionMatrix();
    });
    directionalLight.shadow.radius = params.radius;
    shadowfolder.add(params, 'radius', -0.1, 3, 0.0001).onChange((e) => {
      directionalLight.shadow.radius = e;
      directionalLight.shadow.camera.updateWorldMatrix();
      directionalLight.shadow.camera.updateProjectionMatrix();
    });
    // // -------雾-------
    const fogfolder = gui.addFolder('雾');
    this.threeJs.threeScene.fog = params.fog_visible
      ? new THREE.Fog(params.fog_color, params.fog_near, params.fog_far)
      : null;
    fogfolder.add(params, 'fog_visible').onChange((e) => {
      console.log('e', e);
      this.threeJs.threeScene.fog = params.fog_visible
        ? new THREE.Fog(params.fog_color, params.fog_near, params.fog_far)
        : null;
    });
    // this.threeJs.threeScene.fog.near = params.fog_near;
    fogfolder.addColor(params, 'fog_color').onChange((e) => {
      this.threeJs.threeScene.fog.color = new THREE.Color(e);
    });
    // this.threeJs.threeScene.fog.near = params.fog_near;
    fogfolder.add(params, 'fog_near', 0, 60000, 1).onChange((e) => {
      this.threeJs.threeScene.fog.near = e;
    });
    // this.threeJs.threeScene.fog.far = params.fog_far;
    fogfolder.add(params, 'fog_far', 0, 60000, 1).onChange((e) => {
      this.threeJs.threeScene.fog.far = e;
    });
    // gui销毁
    if (!window.ENV.DEBUG) {
      gui.destroy();
    }
  };
}
