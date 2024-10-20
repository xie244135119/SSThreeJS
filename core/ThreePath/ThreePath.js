/*
 * Author  Kayson.Wan
 * Date  2022-09-15 16:14:58
 * LastEditors  xie244135119
 * LastEditTime  2022-11-02 16:34:54
 * Description
 */
import * as THREE from 'three';
import ThreeJs from '../index';
import { PathGeometry, PathTubeGeometry, PathPointList } from './three.path.module';
import ThreeLoop from '../threeLoop';

class ThreePath {
  // 创建 更新的标记
  #isLoopRender = false;

  // 绑定 核心threejs
  threeJs = null;

  // 所有测点数据
  #pathDataList = [];

  constructor(aThreeJs) {
    this.threeJs = aThreeJs;
  }

  /**
   * 根据点位路径创建道路
   * @param {*} param0 { points:点数组位[], mapPath: 纹理路径, color : 颜色 ,scrollSpeed:速度 [-]反向流动 0.02 ,repeat: 平铺 0.2
   * pathWidth = 30 ,close : 是否闭合false} , emissiveIntensity 自发光强度
   */
  addRoadPath = ({
    points,
    mapPath,
    color,
    opacity = 1,
    scrollSpeed = 0.02,
    repeat = 0.2,
    pathWidth = 30,
    depthTest = true,
    emissiveIntensity = 1,
    progress = 1
  }) => {
    // // random vector3 points
    // const points = [
    //   new THREE.Vector3(-726.8485068426608, 0.037200927734375, -389.0138678873509),
    // ];
    const type = 'path';
    if (!(this.threeJs instanceof ThreeJs)) {
      console.error('【ThreePath】尚未配置 threejs');
      return null;
    }

    const { threeScene, threeRenderer } = this.threeJs;
    if (!this.#isLoopRender) {
      this.#isLoopRender = true;
      ThreeLoop.add(this.update, 'roadpath render');
    }

    const up = new THREE.Vector3(0, 1, 0);

    // create PathPointList
    const pathPointList = new PathPointList();
    // pathPointList.set(points, 0.3, 10, up, false);
    pathPointList.set(points, 0.3, 10, up, false);
    // create geometry
    const width = 0.2;
    const geometry = new PathGeometry();
    geometry.update(pathPointList, {
      width,
      arrow: false
    });
    const texture = new THREE.TextureLoader().load(
      //   mapPath || './public/threeTextures/overview/pilpeline3.png',
      //   mapPath || './public/threeTextures/overview/path_007_18.png',
      mapPath || './public/threeTextures/overview/light.png',
      (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = map.wrapS;
        map.anisotropy = threeRenderer.capabilities.getMaxAnisotropy();
      }
    );
    const material = new THREE.MeshPhongMaterial({
      // color: color || 0x58dede,
      color,
      // emissive: color || 0x58dede,
      // emissive: color,
      emissiveMap: texture,
      emissiveIntensity,
      depthWrite: true,
      transparent: true,
      opacity,
      // side: THREE.FrontSide,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 0,
      polygonOffsetUnits: 1.0,
      depthTest
    });
    material.map = texture;
    const mesh = new THREE.Mesh(geometry, material);
    threeScene.add(mesh);
    // window.pathMat = material;

    const playing = true;
    const params = {
      useTexture: true,
      color: [88, 222, 222],
      scrollUV: true,
      scrollSpeed,
      width: pathWidth,
      cornerRadius: 1,
      cornerSplit: 10,
      progress,
      playSpeed: 0.14,
      repeat
    };
    // 存储
    const data = {
      pathPointList,
      mesh,
      geometry,
      texture,
      params,
      playing,
      type
    };
    this.#pathDataList.push(data);
    // ------
    // // // gui
    // const gui = new GUI();
    // gui.domElement.style.position = 'absolute';
    // gui.domElement.style.top = '1.5rem';
    // gui.domElement.style.right = '1.2rem';
    // gui.domElement.style.zIndex = 2000;
    // gui.name = 'three调试配置';
    // gui.width = 300;
    // gui.closed = false;
    // let _params = {
    //   color: new THREE.Color(1, 1, 1)
    // };
    // gui.addColor(_params, 'color').onChange((value) => {
    //   material.color = new THREE.Color(value.r / 255, value.g / 255, value.b / 255);
    // });
    return data;
  };

  /**
   * 根据点位路径创建道路
   * @param {*} param0 { points:点数组位[], mapPath: 纹理路径, color : 颜色 ,scrollSpeed:速度 0.02 ,repeat: 平铺 0.2
   * radius = 2 , radialSegments = 8 圆柱分段数,close : 是否闭合false}
   */
  addTubePath = ({
    points,
    mapPath,
    color,
    radius = 2,
    radialSegments = 8,
    scrollSpeed = 0.02,
    repeat = 0.2,
    depthTest = true
  }) => {
    const type = 'tube';
    if (!(this.threeJs instanceof ThreeJs)) {
      console.error('【ThreePath】尚未配置 threejs');
      return null;
    }

    const { threeScene, threeRenderer } = this.threeJs;
    if (!this.#isLoopRender) {
      this.#isLoopRender = true;
      // threeLoop.add({ id: 'path', update: this.update });
      ThreeLoop.add(this.update, 'roadpath render');
    }

    const up = new THREE.Vector3(0, 1, 0);

    // create PathPointList
    const pathPointList = new PathPointList();
    // pathPointList.set(points, 0.3, 10, up, false);
    pathPointList.set(points, 0.3, 10, up, false);

    // create geometry
    const geometry = new PathTubeGeometry({
      pathPointList,
      options: { radius, radialSegments, arrow: false },
      usage: THREE.DynamicDrawUsage
    });
    // update geometry when pathPointList changed
    geometry.update(pathPointList, {
      radius, // default is 0.1
      radialSegments, // default is 8
      progress: 1, // default is 1
      startRad: 0, // default is 0
      arrow: false
    });

    const texture = new THREE.TextureLoader().load(
      //   mapPath || './public/threeTextures/overview/pilpeline3.png',
      //   mapPath || './public/threeTextures/overview/path_007_18.png',
      mapPath || './public/threeTextures/overview/light.png',
      (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = map.wrapS;
        map.anisotropy = threeRenderer.capabilities.getMaxAnisotropy();
      }
    );
    const material = new THREE.MeshPhongMaterial({
      color: color || 0x58dede,
      depthWrite: true,
      transparent: true,
      opacity: 0.9,
      // side: THREE.FrontSide,
      side: THREE.DoubleSide,
      depthTest
    });
    material.map = texture;
    window.pathMat = material;

    const mesh = new THREE.Mesh(geometry, material);
    threeScene.add(mesh);

    const playing = true;
    const params = {
      useTexture: true,
      color: [88, 222, 222],
      scrollUV: true,
      scrollSpeed,
      radius,
      radialSegments,
      cornerRadius: 0.3,
      cornerSplit: 10,
      progress: 1,
      playSpeed: 0.14,
      repeat
    };

    // var gui = new dat.GUI();
    // 存储
    const data = {
      pathPointList,
      mesh,
      geometry,
      texture,
      params,
      playing,
      type
    };
    this.#pathDataList.push(data);
    return data;
  };

  /**
   * 销毁道路
   */
  removeRoad = (data) => {
    if (data) {
      if (this.threeJs instanceof ThreeJs) {
        this.threeJs.threeDisposeQueue.dispose(data.mesh);
        this.threeJs.threeScene.remove(data.mesh);
      }
      const findIndex = this.#pathDataList.findIndex((item) => item === data);
      this.#pathDataList.splice(findIndex, 1);
      if (this.#pathDataList.length === 0) {
        this.#isLoopRender = false;
        ThreeLoop.removeId('roadpath render');
      }
    }
  };

  destroy = () => {
    ThreeLoop.removeId('roadpath render');
    this.#pathDataList.forEach((data) => {
      console.log(' data ', data);
      this.threeJs.threeDisposeQueue.dispose(data.mesh);
      this.threeJs.threeScene.remove(data.mesh);
    });
    this.#pathDataList = [];
    // cancelAnimationFrame(this.#frameHandle);
  };

  update = () => {
    if (this.#pathDataList.length === 0) {
      return;
    }
    for (let i = 0; i < this.#pathDataList.length; i++) {
      const { pathPointList, geometry, texture, params, type } = this.#pathDataList[i];
      let { playing } = this.#pathDataList[i];
      if (type === 'path') {
        // progress
        if (playing) {
          const distance = pathPointList.distance();
          if (distance > 0) {
            params.progress += params.playSpeed / distance;
            if (params.progress > 1) {
              playing = false;
              params.progress = 1;
            }
          } else {
            playing = false;
            params.progress = 1;
          }
          geometry.update(pathPointList, {
            width: params.width,
            progress: params.progress
          });
        }
        if (params.scrollUV) {
          texture.offset.x -= params.scrollSpeed;
          // texture.repeat.x = 0.2;
          texture.repeat.x = params.repeat;
        }
      }

      if (type === 'tube') {
        // progress
        if (playing) {
          const distance = pathPointList.distance();

          if (distance > 0) {
            params.progress += params.playSpeed / distance;
            if (params.progress > 1) {
              playing = false;
              params.progress = 1;
            }
          } else {
            playing = false;
            params.progress = 1;
          }

          geometry.update(pathPointList, {
            radius: params.radius,
            radialSegments: params.radialSegments,
            progress: params.progress
          });
        }

        if (params.scrollUV) {
          texture.offset.x -= params.scrollSpeed;
          texture.repeat.x = params.repeat;
        }
      }
    }
  };
}
export default ThreePath;
