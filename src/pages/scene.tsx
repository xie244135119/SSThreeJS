import React, { useEffect, useRef } from 'react';
// import SSThreejs, { THREE, ThreeEvent } from '../../core/index';
// import PostProcessUtil from '../../core/PostProcessUtil';

import MeshReflectorMaterial from '../../core/SSMaterial/MeshReflectorMaterial';
// import SSWater from '../../core/Water/SSWater';
import SSThreeJs, { THREE, SSCssRenderer, SSThreeLoop, SSThreeTool } from '../../core/index';
// import SceneSetting from './ssthreejs.setting.json';
import SSPickPointMode from '../../core/SSModule/pickpoint.module';
import SSLightModule from '../../core/SSModule/light.module';
// import VideoSceneViewerManager from '../../core/VideoSceneViewer/VideoSceneViewerManager';
// import videoBlendImg from '../../core/assets/default_ground1.png';
// import SSEvent from '../../core/SSEvent';
// import SSPostProcessManagerModule from '../../core/SSPostProcess/PostProcessManager';
// import SSPostProcessModule from '../../core/SSModule/basepostprocess.module';
import SSWatchLookModule from '../../core/SSModule/watchlook.module';
import { SSMesh } from '../../core/index';

export default function ParentIndex(props) {
  // eslint-disable-next-line react/prop-types
  //
  const jsRef = useRef(new SSThreeJs());

  // 测试 SS
  const testcssrender = () => {
    SSThreeTool.addLine(
      {
        x: 0,
        y: 0,
        z: 0
      },
      {
        x: 4,
        y: 4,
        z: 4
      }
    );
  };

  // --------反射---------
  const reflectorTest = () => {
    const { ssThreeObject } = jsRef.current;
    // 透過geometry以及material來建立Mesh物件
    const geometry2 = new THREE.PlaneGeometry(60, 60, 1, 1);
    const material2 = new THREE.MeshBasicMaterial();
    const mesh2 = new THREE.Mesh(geometry2, material2);
    // 將材質置換成MeshReflectorMaterial
    // 添加到程式碼
    const fadingReflectorOptions = {
      mixBlur: 2,
      mixStrength: 1.5,
      resolution: 2048, // 材質圖的解析度
      blur: [0, 0], // 高斯模糊的材質解析度為何
      minDepthThreshold: 0.7, // 從多遠的地方開始淡出
      maxDepthThreshold: 2, // 到多遠的地方會淡出到沒畫面
      depthScale: 2,
      depthToBlurRatioBias: 2,
      mirror: 0,
      distortion: 2,
      mixContrast: 2,
      reflectorOffset: 0, // 鏡面跟物理中間是否要留一段距離才開始反射
      bufferSamples: 8
    };
    mesh2.material = new MeshReflectorMaterial(
      ssThreeObject.threeRenderer,
      ssThreeObject.threeCamera,
      ssThreeObject.threeScene,
      mesh2,
      fadingReflectorOptions
    );
    ssThreeObject.threeScene.add(mesh2);
    mesh2.position.y = 0.1;
    mesh2.position.x = 5;
    // 旋轉mesh角度以作為地面
    mesh2.rotateX(Math.PI * -0.5);
  };

  // 测试 360全景相机
  const test360Video = () => {
    const video = document.createElement('video');
    video.preload = true;
    video.autoplay = true;
    video.loop = true;
    video.src = '/360video.mp4';

    setTimeout(() => {
      video.play();
      console.log(' 视频开始播放 ');
    }, 5000);
    const videotexture = new THREE.VideoTexture(video);
    videotexture.minFilter = THREE.LinearFilter;
    videotexture.colorSpace = THREE.SRGBColorSpace;
    // videotexture.format = THREE.PixelFormat;
    window.videotexture = videotexture;

    //
    const materialArray = [];
    // materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
    // materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
    // materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
    // materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
    const material = new THREE.MeshBasicMaterial({
      map: videotexture,
      side: THREE.DoubleSide
      // color: 'red'
    });
    materialArray.push(material);
    // materialArray.push(new THREE.MeshBasicMaterial({ color: 0xff51ba }))

    const geo = new THREE.SphereGeometry(5);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(1, 5, 1);
    mesh.name = '360全景视频';
    jsRef.current.ssThreeObject.threeScene.add(mesh);

    // 调整相机
    jsRef.current.setModelPosition(mesh.position, mesh.position);
  };

  useEffect(() => {
    jsRef.current.setup('threecontainer');
    jsRef.current.ssThreeObject.threeScene.background = new THREE.Color(0, 0, 0);
    jsRef.current.addDymaicDebug();

    const plane = new THREE.PlaneGeometry(5, 5);
    const planeMaterial = new THREE.MeshBasicMaterial({});
    const planeMesh = new THREE.Mesh(plane, planeMaterial);
    planeMesh.rotation.set(-Math.PI / 2, 0, 0);
    jsRef.current.ssThreeObject.threeScene.add(planeMesh);
    // 几何体
    const geomertry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(1, 1, 1)
      // side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geomertry, material);
    mesh.position.set(0, 0.5, 0);
    mesh.name = 'TestBox';
    jsRef.current.ssThreeObject.threeScene.add(mesh);

    //
    // testcssrender();

    reflectorTest();

    // js.closeWebglRender();

    // // 视频融合Data
    // const videoFusionData = [
    //   {
    //     camera: {
    //       name: '视频融合_test',
    //       fov: 27,
    //       aspect: 1,
    //       near: 0.1,
    //       far: 164,
    //       position: { x: 0.7180480205018174, y: 1.2705360638579253, z: 2.052677400678885 },
    //       rotation: { x: -0.6313513526773442, y: 0.20934010887576412, z: 0.1507975959985109 },
    //       target: { x: 0, y: 0, z: 0 }
    //     },
    //     video: { poster: videoBlendImg, stream: '' },
    //     // video: { poster: '', stream: './public/threeTextures/videoBlendVideoTest3.mp4' },
    //     eye: {
    //       position: { x: -22.26714020755176, y: 96.87804310841558, z: -144.87257420359424 },
    //       target: { x: -21.692831852230174, y: 96.54080558055747, z: -93.53923082919695 }
    //     }
    //   }
    // ];
    // // 视频融合
    // const videoBlend = new VideoSceneViewerManager(jsRef.current, videoFusionData, true);
    // videoBlend.openVideoFusion(videoFusionData);

    // // // 引用配置
    // jsRef.current.ssModuleCenter.registerModules([
    //   SSPickPointMode,
    //   SSLightModule,
    //   // SSPostProcessManagerModule,
    //   // SSWater,
    //   SSWatchLookModule
    //   // VideoSceneViewerManager
    // ]);
    // jsRef.current.ssModuleCenter.import(SceneSetting);
    // // 开启调试
    // jsRef.current.ssModuleCenter.openDebugModel();
    //
    // test360Video();

    /**
     * @type {SSPostProcessManagerModule}
     */
    // const ssPostProcessManagerModule = jsRef.current.ssModuleCenter.getModuleByClassName(
    //   'SSPostProcessManagerModule'
    // );

    //  jsRef.current.threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (event) => {
    //   const models = jsRef.current.ssThreeObject.getModelsByPoint(event);
    //   if (models.length > 0) {
    //     const castObj = models[0].object;
    //     console.log('models[0].object ', models[0].object);
    //     ssPostProcessManagerModule.outlineObjects([castObj]);
    //   }
    // });

    return () => {
      jsRef.current.destroy();
    };
  }, []);

  /**
   * 测试水材质
   */
  const testWater = () => {
    const water = SSMesh.WaterMesh.fromOptions(100, 100);
    jsRef.current.ssThreeObject.threeScene.add(water);
    jsRef.current.ssTransformControl.attach(water);
  };

  return (
    <div>
      <span>三维测试</span>
      <div id="threecontainer" style={{ height: 800 }} />
    </div>
  );
}
