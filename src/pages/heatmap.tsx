/*
 * Author  Murphy.xie
 * Date  2023-04-11 18:00:50
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-08 18:21:52
 * Description
 */
import React, { useEffect, useRef } from 'react';
import SSThreeJs, { THREE, SSCssRenderer, SSThreeLoop, SSThreeTool } from '../../core/index';
import heatmap from 'heatmapjs/heatmap';
import HeightHeatMaterial from '../../core/SSMaterial/HeightHeatMap/index';

export default function ParentIndex(props) {
  // eslint-disable-next-line react/prop-types
  //
  const jsRef = useRef(new SSThreeJs());

  useEffect(() => {
    jsRef.current.setup('threecontainer');
    jsRef.current.ssThreeObject.threeScene.background = new THREE.Color(0, 0, 0);
    jsRef.current.addDymaicDebug();

    const plane = new THREE.PlaneGeometry(5, 5);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: '#ff0000'
    });
    const planeMesh = new THREE.Mesh(plane, planeMaterial);
    planeMesh.rotation.set(-Math.PI / 2, 0, 0);
    jsRef.current.ssThreeObject.threeScene.add(planeMesh);
    // 几何体
    const geomertry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 1, 1)
      // side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geomertry, material);
    mesh.position.set(0, 0.5, 0);
    mesh.name = 'TestBox';
    jsRef.current.ssThreeObject.threeScene.add(mesh);

    return () => {
      jsRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    console.log(' heatmap ', heatmap, HeightHeatMaterial);

    const heatmapInstance = heatmap.create({
      container: document.getElementById('heatmap')
      // radius: 125,
      // maxOpacity: 1,
      // minOpacity: 0,
      // blur: 0.75
    });
    // heatmapInstance.addData([
    //   {
    //     x: 500, // x coordinate of the datapoint, a number
    //     y: 125, // y coordinate of the datapoint, a number
    //     value: 500 // the value at datapoint(x, y)
    //   },
    //   {
    //     x: 550, // x coordinate of the datapoint, a number
    //     y: 125, // y coordinate of the datapoint, a number
    //     value: 500 // the value at datapoint(x, y)
    //   }
    // ]);

    var points = [];
    var max = 0;
    var width = 840;
    var height = 400;
    var len = 200;

    while (len--) {
      var val = Math.floor(Math.random() * 100);
      max = Math.max(max, val);
      var point = {
        //这里可以自定义
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
        value: val
      };
      points.push(point);
    }
    // heatmap data format
    var data = {
      max: max, //所有数据中的最大值
      data: points //最终要展示的数据
    };
    heatmapInstance.setData(data);
    console.log(' heatmapInstance ', heatmapInstance);

    const geo = new THREE.BoxGeometry(200, 200);
    const material = HeightHeatMaterial.getMaterial(heatmapInstance._renderer.canvas);
    const mesh = new THREE.Mesh(geo, material);
    jsRef.current.threeScene.add(mesh);
  }, []);

  return (
    <div>
      <span>三维测试</span>
      <div id="heatmap" style={{ height: 500, width: 600, border: '1px solid red' }} />
      <div id="threecontainer" style={{ height: 500 }} />
    </div>
  );
}
