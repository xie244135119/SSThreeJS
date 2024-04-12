// /*
//  * Author  Kayson.Wan
//  * Date  2023-05-15 16:08:01
//  * LastEditors  werner.pei
//  * LastEditTime  2023-06-07 09:10:24
//  * Description
//  */
// /*
//  * Author  Kayson.Wan
//  * Date  2023-03-30 16:41:16
//  * LastEditors  Kayson.Wan
//  * LastEditTime  2023-04-27 17:48:18
//  * Description  基础光照调试
//  */
// import * as THREE from 'three';
// // import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
// import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

// // import ThreeJs from '..';
// import ThreeJs from '..';

// /**
//  * 光照设调整工具
//  */
// export default class BaseLightSetting {
//   /**
//    * @type ThreeJs
//    */
//   threeJs = null;
//   //灯光照射目标位置
//   lightTarget = new THREE.Object3D();
//   cubeMap = null;

//   // GUI 属性配置文件
//   guiSetting = null;

//   defaultSetting = {
//     preset: 'Default',
//     closed: false,
//     remembered: {
//       Default: {
//         0: {
//           ambientIntensity: 0.2,
//           ambientLightColor: '#ababab',
//           visible: true,
//           directionalIntensity: 1,
//           directionalLightColor: '#f2e1be', // '#FFFFE0',
//           far: 500,
//           near: 0,
//           toneMappingExposure: 1,
//           castShadow: true,
//           shadowPosition_x: 12,
//           shadowPosition_y: 55,
//           shadowPosition_z: -47,
//           topBottom: 100,
//           leftRight: 148,
//           bias: -0.0013000000000000002,
//           normalBias: 0.02,
//           radius: 1,

//           fog_visible: true,
//           fog_color: '#c5e7ff',
//           fog_near: 0,
//           fog_far: 10000,

//           background: true,
//           environment: { none: 'none', blueSky: 'blueSky' }
//           // cubeMapVisible =true,
//         }
//       }
//     },
//     folders: {
//       环境光: {
//         preset: 'Default',
//         closed: false,
//         folders: {}
//       },
//       平行光: {
//         preset: 'Default',
//         closed: false,
//         folders: {}
//       },
//       阴影: {
//         preset: 'Default',
//         closed: false,
//         folders: {}
//       },
//       雾: {
//         preset: 'Default',
//         closed: false,
//         folders: {}
//       }
//     }
//   };

//   constructor(threeJs, defaultSetting) {
//     this.threeJs = threeJs;
//     this.guiSetting = defaultSetting || this.defaultSetting;
//     // this.addCubeMap();
//     this.shadowTest();
//   }

// /**
//  * 阴影测试
//  * @param {*} directionalLight
//  */
// shadowTest = () => {
//   const ambientLight = this.threeJs.threeAmbientLight;
//   const directionalLight = this.threeJs.threeDirectionLight;
//   directionalLight.castShadow = true;
//   directionalLight.shadow.mapSize.width = 1024;
//   directionalLight.shadow.mapSize.height = 1024;
//   directionalLight.shadow.camera.near = 0.1;
//   directionalLight.shadow.camera.far = 1000;
//   directionalLight.shadow.camera.top = 500;
//   directionalLight.shadow.camera.bottom = -500;
//   directionalLight.shadow.camera.left = -500;
//   directionalLight.shadow.camera.right = 500;
//   directionalLight.shadow.bias = 0.001;
//   directionalLight.shadow.normalBias = 0.02;
//   // directionalLight.shadow.color = new THREE.Color('red');
//   //测试
//   this.threeJs.threeScene.add(this.lightTarget);
//   directionalLight.target = this.lightTarget;
//   // this.lightTarget.position.set(-455, 0, -54);
//   this.lightTarget.position.set(0, 0, 0);

//     this.initGui(ambientLight, directionalLight);
//   };

//   // 光照gui
//   initGui = (ambientLight, directionalLight) => {
//     if (window.ENV.DEBUG) {
//       const helper = new THREE.DirectionalLightHelper(directionalLight, 20);
//       helper.position.copy(directionalLight);
//       directionalLight.attach(helper);
//     }

//     // const params = {
//     //   ambientLightColor: '#ababab',
//     //   ambientIntensity: 0.2,
//     //   directionalLightColor: '#ababab',
//     //   directionalIntensity: 1,
//     //   visible: true,
//     //   castShadow: true,
//     //   exponent: 30,
//     //   target: 'plane',
//     //   debug: true,
//     //   near: 0,
//     //   far: 500,
//     //   shadowPosition_x: 12,
//     //   shadowPosition_y: 55,
//     //   shadowPosition_z: -47,
//     //   topBottom: 112,
//     //   leftRight: 130,
//     //   bias: -0.001,
//     //   radius: 1
//     // };
//     const setting = this.guiSetting.remembered.Default[0];
//     const params = {
//       toneMappingExposure: setting.toneMappingExposure,
//       ambientLightColor: setting.ambientLightColor,
//       ambientIntensity: setting.ambientIntensity,
//       directionalLightColor: setting.directionalLightColor,
//       directionalIntensity: setting.directionalIntensity,
//       visible: setting.visible,
//       castShadow: setting.castShadow,
//       exponent: setting.exponent,
//       target: setting.target,

//       near: setting.near,
//       far: setting.far,
//       shadowPosition_x: setting.shadowPosition_x,
//       shadowPosition_y: setting.shadowPosition_y,
//       shadowPosition_z: setting.shadowPosition_z,
//       topBottom: setting.topBottom,
//       leftRight: setting.leftRight,
//       bias: setting.bias,
//       normalBias: setting.normalBias || 0.02,
//       radius: setting.radius,
//       // 雾
//       fog_visible: setting.fog_visible,
//       fog_color: setting.fog_color,
//       fog_near: setting.fog_near,
//       fog_far: setting.fog_far,

//       background: true,
//       environment: { none: 'none', blueSky: 'blueSky' }
//     };

//     const gui = new GUI({
//       load: this.guiSetting
//     });
//     gui.domElement.style.position = 'absolute';
//     // gui.domElement.style.top = '30.5rem';
//     gui.domElement.style.right = '0rem';
//     gui.domElement.style.zIndex = 100;
//     gui.name = '灯光阴影效果调试配置';
//     gui.width = 300;
//     gui.closed = false;
//     //调整最外层GUI的z-index在页面最上方
//     const dgacElement = gui.domElement.parentElement;
//     dgacElement.style.zIndex = 1000;
//     gui.remember(params);

//     // -------环境光-------
//     const amfolder = gui.addFolder('环境光');
//     ambientLight.intensity = params.ambientIntensity;
//     amfolder.add(params, 'ambientIntensity', 0, 5).onChange((e) => {
//       console.log('e', e);
//       ambientLight.intensity = e;
//     });
//     ambientLight.color = new THREE.Color(params.ambientLightColor);
//     amfolder.addColor(params, 'ambientLightColor').onChange((e) => {
//       console.log('e', e);
//       ambientLight.color = new THREE.Color(e);
//     });
//     // -------平行光-------
//     const dirfolder = gui.addFolder('平行光');
//     dirfolder.add(params, 'visible').onChange((e) => {
//       directionalLight.visible = e;
//     });
//     directionalLight.intensity = params.directionalIntensity;
//     dirfolder.add(params, 'directionalIntensity', 0, 5).onChange((e) => {
//       directionalLight.intensity = e;
//     });
//     directionalLight.color = new THREE.Color(params.directionalLightColor);
//     dirfolder.addColor(params, 'directionalLightColor').onChange((e) => {
//       directionalLight.color = new THREE.Color(e);
//     });
//     directionalLight.shadow.camera.far = params.far;
//     dirfolder.add(params, 'far', 0, 3000, 1).onChange((e) => {
//       directionalLight.shadow.camera.far = e;
//       directionalLight.shadow.camera.updateWorldMatrix();
//       directionalLight.shadow.camera.updateProjectionMatrix();
//     });
//     directionalLight.shadow.camera.near = params.near;
//     dirfolder.add(params, 'near', 0, 100, 0.01).onChange((e) => {
//       directionalLight.shadow.camera.near = e;
//       directionalLight.shadow.camera.updateWorldMatrix();
//       directionalLight.shadow.camera.updateProjectionMatrix();
//     });
//     // -------阴影-------
//     const shadowfolder = gui.addFolder('阴影');
//     directionalLight.position.set(params.shadowPosition_x, params.shadowPosition_y, params.shadowPosition_z);

//     this.threeJs.threeRenderer.toneMappingExposure = params.toneMappingExposure;
//     shadowfolder.add(params, 'toneMappingExposure').onChange((e) => {
//       this.threeJs.threeRenderer.toneMappingExposure = e;
//     });

//     directionalLight.castShadow = params.castShadow;
//     shadowfolder.add(params, 'castShadow').onChange((e) => {
//       directionalLight.castShadow = e;
//     });
//     shadowfolder.add(params, 'shadowPosition_x').onChange((e) => {
//       directionalLight.position.x = e;
//     });
//     shadowfolder.add(params, 'shadowPosition_y').onChange((e) => {
//       directionalLight.position.y = e;
//     });
//     shadowfolder.add(params, 'shadowPosition_z').onChange((e) => {
//       directionalLight.position.z = e;
//     });

//     directionalLight.shadow.camera.top = params.topBottom;
//     directionalLight.shadow.camera.bottom = -params.topBottom;
//     shadowfolder.add(params, 'topBottom', 10, 2000, 1).onChange((e) => {
//       directionalLight.shadow.camera.top = e;
//       directionalLight.shadow.camera.bottom = -e;
//       directionalLight.shadow.camera.updateWorldMatrix();
//       directionalLight.shadow.camera.updateProjectionMatrix();
//     });
//     directionalLight.shadow.camera.left = params.leftRight;
//     directionalLight.shadow.camera.right = -params.leftRight;
//     shadowfolder.add(params, 'leftRight', 10, 2000, 1).onChange((e) => {
//       directionalLight.shadow.camera.left = e;
//       directionalLight.shadow.camera.right = -e;
//       directionalLight.shadow.camera.updateWorldMatrix();
//       directionalLight.shadow.camera.updateProjectionMatrix();
//     });
//     directionalLight.shadow.bias = params.bias;
//     shadowfolder.add(params, 'bias', -0.1, 0.1, 0.0001).onChange((e) => {
//       directionalLight.shadow.bias = e;
//       directionalLight.shadow.camera.updateWorldMatrix();
//       directionalLight.shadow.camera.updateProjectionMatrix();
//     });
//     directionalLight.shadow.normalBias = params.normalBias;
//     shadowfolder.add(params, 'normalBias', -0.2, 10, 0.0001).onChange((e) => {
//       directionalLight.shadow.normalBias = e;
//       directionalLight.shadow.camera.updateWorldMatrix();
//       directionalLight.shadow.camera.updateProjectionMatrix();
//     });
//     directionalLight.shadow.radius = params.radius;
//     shadowfolder.add(params, 'radius', -0.1, 3, 0.0001).onChange((e) => {
//       directionalLight.shadow.radius = e;
//       directionalLight.shadow.camera.updateWorldMatrix();
//       directionalLight.shadow.camera.updateProjectionMatrix();
//     });
//     // // -------雾-------
//     const fogfolder = gui.addFolder('雾');
//     this.threeJs.threeScene.fog = params.fog_visible
//       ? new THREE.Fog(params.fog_color, params.fog_near, params.fog_far)
//       : null;
//     fogfolder.add(params, 'fog_visible').onChange((e) => {
//       console.log('e', e);
//       this.threeJs.threeScene.fog = params.fog_visible
//         ? new THREE.Fog(params.fog_color, params.fog_near, params.fog_far)
//         : null;
//     });
//     // this.threeJs.threeScene.fog.near = params.fog_near;
//     fogfolder.addColor(params, 'fog_color').onChange((e) => {
//       this.threeJs.threeScene.fog.color = new THREE.Color(e);
//     });
//     // this.threeJs.threeScene.fog.near = params.fog_near;
//     fogfolder.add(params, 'fog_near', 0, 60000, 1).onChange((e) => {
//       this.threeJs.threeScene.fog.near = e;
//     });
//     // this.threeJs.threeScene.fog.far = params.fog_far;
//     fogfolder.add(params, 'fog_far', 0, 60000, 1).onChange((e) => {
//       this.threeJs.threeScene.fog.far = e;
//     });
//     // // -------天空盒-------
//     const cubeMapFolder = gui.addFolder('天空盒');
//     cubeMapFolder.add(params, 'background').onChange((e) => {
//       this.threeJs.threeScene.background = e ? this.cubeMap : null;
//     });
//     cubeMapFolder.add(params, 'environment', { none: 'none', blueSky: 'blueSky' }).onChange((e) => {
//       if (e === 'blueSky') {
//         this.threeJs.threeScene.environment = this.cubeMap;
//       }
//       if (e === 'none') {
//         this.threeJs.threeScene.environment = null;
//       }
//     });
//     // gui销毁
//     if (!window.ENV.DEBUG) {
//       gui.destroy();
//     }
//   };

//   /**
//    * 天空盒
//    */
//   addCubeMap = () => {
//     const urls = [
//       '/public/sky/threeTextures/天空/q.jpg',
//       '/public/sky/threeTextures/天空/w.jpg',
//       '/public/sky/threeTextures/天空/e.jpg',
//       '/public/sky/threeTextures/天空/r.jpg',
//       '/public/sky/threeTextures/天空/t.jpg',
//       '/public/sky/threeTextures/天空/y.jpg'
//     ];
//     const cubeLoader = new THREE.CubeTextureLoader();
//     const texture = cubeLoader.load(urls);
//     texture.encoding = THREE.LinearEncoding;
//     this.cubeMap = texture;
//     this.threeJs.threeScene.background = texture;
//     this.threeJs.threeScene.environment = texture;
//   };
// }
