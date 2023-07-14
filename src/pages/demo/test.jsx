/*
 * Author  Murphy.xie
 * Date  2023-04-11 18:00:50
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-08 18:21:52
 * Description
 */
import React, { useEffect, useRef } from 'react';
// import SSThreejs, { THREE, ThreeEvent } from '../../../core/index';
// import PostProcessUtil from '../../../core/PostProcessUtil';
import SSThreeJs, { THREE, SSCssRenderer } from '../../../core/index';
import SSModuleCenter from '../../../core/SSModule/index';
import SceneSetting from './ssthreejs.setting.json';
import SSDevelopMode from '../../../core/SSModule/develop.module';
import SSLightModule from '../../../core/SSModule/light.module';
import PostProcessManager from '../../../core/PostProcessManager';
import VideoSceneViewerManager from '../../../core/VideoSceneViewer/VideoSceneViewerManager';
import videoBlendImg from '../../../core/assets/default_ground1.png';

export default function ParentIndex(props) {
  // eslint-disable-next-line react/prop-types
  //
  const jsRef = useRef(new SSThreeJs());

  // 测试 SS
  const testcssrender = () => {
    // const cssrender = new SSCssRenderer(jsRef.current.ssthreeObject);
    // cssrender.setup2D();
    SSCssRenderer.addLine(
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

  useEffect(() => {
    jsRef.current.setup('threecontainer');
    jsRef.current.ssthreeObject.threeScene.background = new THREE.Color(0, 0, 0);
    jsRef.current.addDymaicDebug();

    const plane = new THREE.PlaneGeometry(5, 5);
    const planeMaterial = new THREE.MeshBasicMaterial({});
    const planeMesh = new THREE.Mesh(plane, planeMaterial);
    planeMesh.rotation.set(-Math.PI / 2, 0, 0);
    jsRef.current.ssthreeObject.threeScene.add(planeMesh);
    // 几何体
    const geomertry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(1, 1, 1)
      // side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geomertry, material);
    mesh.position.set(0, 0.5, 0);
    mesh.name = 'TestBox';
    jsRef.current.ssthreeObject.threeScene.add(mesh);

    //
    testcssrender();

    // js.closeWebglRender();

    // 视频融合Data
    const videoFusionData = [
      {
        camera: {
          name: '视频融合_test',
          fov: 27,
          aspect: 1,
          near: 0.1,
          far: 164,
          position: { x: 0.7180480205018174, y: 1.2705360638579253, z: 2.052677400678885 },
          rotation: { x: -0.6313513526773442, y: 0.20934010887576412, z: 0.1507975959985109 },
          target: { x: 0, y: 0, z: 0 }
        },
        video: { poster: videoBlendImg, stream: '' },
        // video: { poster: '', stream: './public/threeTextures/videoBlendVideoTest3.mp4' },
        eye: {
          position: { x: -22.26714020755176, y: 96.87804310841558, z: -144.87257420359424 },
          target: { x: -21.692831852230174, y: 96.54080558055747, z: -93.53923082919695 }
        }
      }
    ];
    // // 视频融合
    // const videoBlend = new VideoSceneViewerManager(jsRef.current, videoFusionData, false);
    // videoBlend.openVideoFusion(videoFusionData);

    // 引用配置
    const moduleCenter = new SSModuleCenter(jsRef.current.ssthreeObject);
    moduleCenter.registerModules([SSDevelopMode, SSLightModule]);
    moduleCenter.addDebugModel();
    moduleCenter.import(SceneSetting);

    return () => {
      moduleCenter.destory();
      moduleCenter.removeDebugModel();
      jsRef.current.destroy();
    };
  }, []);

  return (
    <div>
      <div id="threecontainer" style={{ height: 800 }} />
    </div>
  );
}
