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
import SSFileSetting from '../../../core/SSFileSetting/index_1';
import SceneSetting from './ssthreejs.setting.json';
import SSDevelopMode from '../../../core/SSFileSetting/develop.module';
import SSLightModule from '../../../core/SSFileSetting/light.module';
import PostProcessManager from '../../../core/PostProcessManager';

export default function ParentIndex(props) {
  // eslint-disable-next-line react/prop-types
  //
  const jsRef = useRef(new SSThreeJs());

  // 测试 SS
  const testcssrender = () => {
    const cssrender = new SSCssRenderer(jsRef.current.ssthreeObject);
    cssrender.setup2D();
    cssrender.addLine(
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

    // 几何体
    const geomertry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(1, 1, 1)
    });
    const mesh = new THREE.Mesh(geomertry, material);
    jsRef.current.ssthreeObject.threeScene.add(mesh);

    //
    testcssrender();

    // js.closeWebglRender();

    // 引用配置
    const fileSetting = new SSFileSetting(jsRef.current.ssthreeObject);
    fileSetting.registerModules([SSDevelopMode, SSLightModule, PostProcessManager]);
    fileSetting.addDebugModel();
    fileSetting.import(SceneSetting);
    return () => {
      fileSetting.removeDebugModel();
      jsRef.current.destroy();
    };
  }, []);

  return (
    <div>
      <div id="threecontainer" style={{ height: 800 }} />
    </div>
  );
}
