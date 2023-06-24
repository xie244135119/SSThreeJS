/*
 * Author  Murphy.xie
 * Date  2023-04-11 18:00:50
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-08 18:21:52
 * Description
 */
import React, { useEffect } from 'react';
import BaseLightSetting from '../../../core/baseLightSetting/BaseLightSetting';
// import SSThreejs, { THREE, ThreeEvent } from '../../../core/index';
import PostProcessUtil from '../../../core/PostProcessUtil';
import SSThreeJs, { THREE, SSThreeEvent } from '../../../core/index';

export default function ParentIndex(props) {
  // eslint-disable-next-line react/prop-types
  const { children } = props;

  useEffect(() => {
    const js = new SSThreeJs();
    js.setup('threecontainer');
    js.threeScene.background = new THREE.Color(0, 0, 0);
    js.addDymaicDebug();

    // 几何体
    const geomertry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(1, 1, 1)
    });
    const mesh = new THREE.Mesh(geomertry, material);
    js.threeScene.add(mesh);

    js.threeEvent.addEventListener(SSThreeEvent.EventType.CLICK, (e) => {
      console.log(' 点击事件 ', e);
    });
    js.threeEvent.addEventListener(SSThreeEvent.EventType.DBLCLICK, (e) => {
      console.log(' 双击 ', e);
    });
    js.threeEvent.addEventListener(SSThreeEvent.EventType.DRAG, (e) => {
      console.log(' 拖拽 ', e);
    });

    // js.closeWebglRender();
    //
    const uti = new PostProcessUtil({
      scene: js.threeScene,
      camera: js.threeCamera,
      render: js.threeRenderer,
      container: js.threeContainer
    });
    // uti.initPostProcess(true);

    const baseSetting = new BaseLightSetting(js);
    return () => {
      js.destroy();
    };
  }, []);

  return (
    <div>
      <span>三级页面</span>
      {children}
      <div id="threecontainer" style={{ height: 800 }} />
    </div>
  );
}
