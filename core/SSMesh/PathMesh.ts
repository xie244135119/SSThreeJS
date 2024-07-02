import * as THREE from 'three';
import {
  PathGeometry,
  PathTubeGeometry,
  PathPointList
} from '../libs/three.path/three.path.module';

export default class SSPathMesh {
  // /**
  //  * 根据点位路径创建道路
  //  * @param {*} param0 { points:点数组位[], mapPath: 纹理路径, color : 颜色 ,scrollSpeed:速度 [-]反向流动 0.02 ,repeat: 平铺 0.2
  //  * pathWidth = 30 ,close : 是否闭合false} , emissiveIntensity 自发光强度
  //  */
  // addRoadPath = ({
  //   points,
  //   mapPath,
  //   color,
  //   opacity = 1,
  //   scrollSpeed = 0.02,
  //   repeat = 0.2,
  //   pathWidth = 30,
  //   depthTest = true,
  //   emissiveIntensity = 1,
  //   progress = 1
  // }) => {
  //   const type = 'path';

  //   // create PathPointList
  //   const pathPointList = new PathPointList();
  //   // pathPointList.set(points, 0.3, 10, up, false);
  //   pathPointList.set(points, 0.3, 10);
  //   // create geometry
  //   const width = 0.2;
  //   const geometry = new PathGeometry();
  //   geometry.update(pathPointList, {
  //     width,
  //     arrow: false
  //   });
  //   const texture = new THREE.TextureLoader().load(
  //     //   mapPath || './public/threeTextures/overview/pilpeline3.png',
  //     //   mapPath || './public/threeTextures/overview/path_007_18.png',
  //     mapPath || './public/threeTextures/overview/light.png',
  //     (map) => {
  //       map.wrapS = THREE.RepeatWrapping;
  //       map.wrapT = map.wrapS;
  //       map.anisotropy = threeRenderer.capabilities.getMaxAnisotropy();
  //     }
  //   );
  //   const material = new THREE.MeshPhongMaterial({
  //     // color: color || 0x58dede,
  //     color,
  //     // emissive: color || 0x58dede,
  //     // emissive: color,
  //     emissiveMap: texture,
  //     emissiveIntensity,
  //     depthWrite: true,
  //     transparent: true,
  //     opacity,
  //     // side: THREE.FrontSide,
  //     side: THREE.DoubleSide,
  //     polygonOffset: true,
  //     polygonOffsetFactor: 0,
  //     polygonOffsetUnits: 1.0,
  //     depthTest
  //   });
  //   material.map = texture;
  //   const mesh = new THREE.Mesh(geometry, material);
  //   threeScene.add(mesh);

  //   const playing = true;
  //   const params = {
  //     useTexture: true,
  //     color: [88, 222, 222],
  //     scrollUV: true,
  //     scrollSpeed,
  //     width: pathWidth,
  //     cornerRadius: 1,
  //     cornerSplit: 10,
  //     progress,
  //     playSpeed: 0.14,
  //     repeat
  //   };
  //   // 存储
  //   const data = {
  //     pathPointList,
  //     mesh,
  //     geometry,
  //     texture,
  //     params,
  //     playing,
  //     type
  //   };
  //   this._pathDataList.push(data);
  //   // ------
  //   // // // gui
  //   // const gui = new GUI();
  //   // gui.domElement.style.position = 'absolute';
  //   // gui.domElement.style.top = '1.5rem';
  //   // gui.domElement.style.right = '1.2rem';
  //   // gui.domElement.style.zIndex = 2000;
  //   // gui.name = 'three调试配置';
  //   // gui.width = 300;
  //   // gui.closed = false;
  //   // let _params = {
  //   //   color: new THREE.Color(1, 1, 1)
  //   // };
  //   // gui.addColor(_params, 'color').onChange((value) => {
  //   //   material.color = new THREE.Color(value.r / 255, value.g / 255, value.b / 255);
  //   // });
  //   return data;
  // };

  // /**
  //  * 根据点位路径创建道路
  //  * @param {*} param0 { points:点数组位[], mapPath: 纹理路径, color : 颜色 ,scrollSpeed:速度 0.02 ,repeat: 平铺 0.2
  //  * radius = 2 , radialSegments = 8 圆柱分段数,close : 是否闭合false}
  //  */
  // addTubePath = ({
  //   points,
  //   mapPath,
  //   color,
  //   radius = 2,
  //   radialSegments = 8,
  //   scrollSpeed = 0.02,
  //   repeat = 0.2,
  //   depthTest = true
  // }) => {
  //   const type = 'tube';
  //   const { threeScene, threeRenderer } = this.ssThreeObject;
  //   if (!this._isLoopRender) {
  //     this._isLoopRender = true;
  //     // SSThreeLoop.add({ id: 'path', update: this.update });
  //     SSThreeLoop.add(this.update, 'roadpath render');
  //   }

  //   const up = new THREE.Vector3(0, 1, 0);

  //   // create PathPointList
  //   const pathPointList = new PathPointList();
  //   // pathPointList.set(points, 0.3, 10, up, false);
  //   pathPointList.set(points, 0.3, 10, up, false);

  //   // create geometry
  //   const geometry = new PathTubeGeometry({
  //     pathPointList,
  //     options: { radius, radialSegments, arrow: false },
  //     usage: THREE.DynamicDrawUsage
  //   });
  //   // update geometry when pathPointList changed
  //   geometry.update(pathPointList, {
  //     radius, // default is 0.1
  //     radialSegments, // default is 8
  //     progress: 1, // default is 1
  //     startRad: 0, // default is 0
  //     arrow: false
  //   });

  //   const texture = new THREE.TextureLoader().load(
  //     //   mapPath || './public/threeTextures/overview/pilpeline3.png',
  //     //   mapPath || './public/threeTextures/overview/path_007_18.png',
  //     mapPath || './public/threeTextures/overview/light.png',
  //     (map) => {
  //       map.wrapS = THREE.RepeatWrapping;
  //       map.wrapT = map.wrapS;
  //       map.anisotropy = threeRenderer.capabilities.getMaxAnisotropy();
  //     }
  //   );
  //   const material = new THREE.MeshPhongMaterial({
  //     color: color || 0x58dede,
  //     depthWrite: true,
  //     transparent: true,
  //     opacity: 0.9,
  //     // side: THREE.FrontSide,
  //     side: THREE.DoubleSide,
  //     depthTest
  //   });
  //   material.map = texture;

  //   const mesh = new THREE.Mesh(geometry, material);
  //   threeScene.add(mesh);

  //   const playing = true;
  //   const params = {
  //     useTexture: true,
  //     color: [88, 222, 222],
  //     scrollUV: true,
  //     scrollSpeed,
  //     radius,
  //     radialSegments,
  //     cornerRadius: 0.3,
  //     cornerSplit: 10,
  //     progress: 1,
  //     playSpeed: 0.14,
  //     repeat
  //   };

  //   // var gui = new dat.GUI();
  //   // 存储
  //   const data = {
  //     pathPointList,
  //     mesh,
  //     geometry,
  //     texture,
  //     params,
  //     playing,
  //     type
  //   };
  //   this._pathDataList.push(data);
  //   return data;
  // };

  /**
   * 路径几何体
   */
  static pathGeomery(points: THREE.Vector3[]) {
    // create PathPointList
    const pathPointList = new PathPointList();
    // pathPointList.set(points, 0.3, 10, up, false);
    pathPointList.set(points, 0.3, 10);
    // Init by max vertex
    // const geometry = new PathGeometry(2000, false);
    // Init by data
    const geometry = new PathGeometry(
      {
        pathPointList: pathPointList,
        options: {
          width: 0.1, // default is 0.1
          arrow: true, // default is true
          progress: 1, // default is 1
          side: 'both' // "left"/"right"/"both", default is "both"
        },
        usage: THREE.StaticDrawUsage // geometry usage
      },
      false
    );
    // 更新的时候触发
    geometry.update(pathPointList, {
      width: 0.1, // default is 0.1
      arrow: true, // default is true
      progress: 1, // default is 1
      side: 'both' // "left"/"right"/"both", default is "both"
    });
    return geometry;
  }

  /**
   * 路径几何体
   */
  static pathTubeGeometry(points: THREE.Vector3[]) {
    // create PathPointList
    const pathPointList = new PathPointList();
    // pathPointList.set(points, 0.3, 10, up, false);
    pathPointList.set(points, 0.3, 10);
    // Init by max vertex
    // const geometry = new PathTubeGeometry(2000, false);
    // Init by data
    const geometry = new PathTubeGeometry(
      {
        pathPointList: pathPointList,
        options: {
          radius: 0.1, // default is 0.1
          radialSegments: 8, // default is 8
          progress: 1, // default is 1
          startRad: 0 // default is 0
        },
        usage: THREE.StaticDrawUsage // geometry usage
      },
      false
    );
    // 更新的时候触发
    geometry.update(pathPointList, {
      radius: 0.1, // default is 0.1
      radialSegments: 8, // default is 8
      progress: 1, // default is 1
      startRad: 0 // default is 0
    });
    return geometry;
  }
}
