import * as THREE from 'three';
import { BufferGeometry } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export default class SSThreeTool {
  /**
   * 经过拆分后的模型数据，根据子物体获取拆分前 原始物体名称
   * @param {THREE.Object3D} obj3d object
   * @returns
   */
  static getOriginMesh = (obj3d) => {
    if (!(obj3d instanceof THREE.Object3D)) {
      return null;
    }
    if (obj3d.name.indexOf('_') === -1) {
      return obj3d;
    }
    const nameArry = obj3d.name.split('_') || [];
    const lastText = nameArry[nameArry.length - 1];
    if (!lastText) {
      return obj3d;
    }
    if (Number.isNaN(lastText)) {
      return obj3d;
    }
    nameArry.pop();
    return obj3d.parent;
  };

  /**
   * set model center
   * @param {*} obj object3D
   */
  static setObjectCenter = (obj) => {
    const setMesh = (mesh) => {
      if (mesh instanceof THREE.Mesh) {
        const { geometry } = mesh;
        if (geometry instanceof BufferGeometry) {
          geometry.computeBoundingBox();
          geometry.center();
        }
      }
    };

    if (obj instanceof THREE.Object3D) {
      obj.traverse((e) => {
        setMesh(e);
      });
    }
  };

  /**
   * get object center
   * @param {*} obj object3D
   * @returns
   */
  static getObjectCenter = (obj) => {
    if (obj instanceof THREE.Object3D) {
      return obj.getWorldPosition(new THREE.Vector3());
    }
    return new THREE.Vector3();
  };

  /**
   * get camera and scene  on object3D front (reslove 80% )
   * @param {*} obj object3D
   * @param {*} forwardFirection mesh direction
   * @returns
   */
  static getCameraScenePositionByObject = (obj, forwardFirection = 'z') => {
    if (!(obj instanceof THREE.Object3D)) {
      return { cameraPosition: new THREE.Vector3(), scenePosition: new THREE.Vector3() };
    }

    const { max, min } = this.setBoundingBox(obj);
    const xWidth = max.x - min.x;
    const zWidth = max.z - min.z;
    const yHeight = max.y - min.y;
    const objcenter = this.getObjectCenter(obj);
    const cameraPosition = objcenter.clone();
    cameraPosition.y += yHeight / 2;
    const scale = (yHeight / xWidth + 1) * (forwardFirection.indexOf('-') === -1 ? 1 : -1);
    const xdirection = forwardFirection.indexOf('x') !== -1;
    const zdirection = forwardFirection.indexOf('z') !== -1;
    if (xdirection) {
      cameraPosition.x += xWidth * scale;
    } else if (zdirection) {
      cameraPosition.z += zWidth * scale;
    }
    return { cameraPosition, scenePosition: objcenter };
  };

  /**
   * 防抖
   * @param {function} fn 虚函数
   * @param {number} [wait=200] 防抖时间
   * @param {boolean} [immediate=false] 立刻执行
   * @returns
   */
  static debounce = (fn, wait = 200, immediate = false) => {
    let timer;
    return function block() {
      if (immediate) {
        // eslint-disable-next-line prefer-rest-params
        fn.apply(this, arguments);
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        // eslint-disable-next-line prefer-rest-params
        fn.apply(this, arguments);
      }, wait);
    };
  };

  /**
   * 节流
   * @param {function} fn 虚函数
   * @param {number} [wait=200] 等待时间
   * @returns
   */
  static throttle = (fn, wait = 200) => {
    let timer = null;
    return function block() {
      const context = this;
      // eslint-disable-next-line prefer-rest-params
      const args = [...arguments];
      if (timer) return;
      timer = setTimeout(() => {
        fn.apply(context, args);
        timer = null;
      }, wait);
    };
  };

  /**
   * 将三维坐标转化为屏幕坐标
   * @param {*} worldVector
   * @returns
   */
  static worldToScreen = (worldVector, threeCamera) => {
    const standardVector = worldVector.project(threeCamera); // 世界坐标转标准设备坐标
    const a = window.innerWidth / 2;
    const b = window.innerHeight / 2;
    const x = Math.round(standardVector.x * a + a); // 标准设备坐标转屏幕坐标
    const y = Math.round(-standardVector.y * b + b); // 标准设备坐标转屏幕坐标
    const result = {
      x,
      y
    };
    return result;
  };

  /**
   * 将二维坐标转化为三维坐标
   */
  static screenToWorld = (aPoint, aContainer = document.body, threeCamera, targetZ = 0) => {
    const x =
      ((aPoint.x - aContainer.getBoundingClientRect().left) / aContainer.offsetWidth) * 2 - 1; // 规范设施横坐标
    const y =
      -((aPoint.y - aContainer.getBoundingClientRect().top) / aContainer.offsetHeight) * 2 + 1; // 规范设施纵坐标
    const vec = new THREE.Vector3();
    vec.unproject(threeCamera);
    vec.sub(threeCamera.position).normalize();
    //
    const distance = (targetZ - threeCamera.position.z) / vec.z;

    const res = new THREE.Vector3();
    res.copy(threeCamera.position).add(vec.multiplyScalar(distance));
    // res.copy(threeCamera.position).add(vec);
    return res;
  };

  /**
   * 根据物体生成包围盒子
   * @param {*} object
   */
  static setBoundingBox = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    return { max: box.max, min: box.min };
  };

  /**
   * 根据物体生成包围盒子
   * @param {*} object
   */
  static getBoundingBox = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    return box;
  };

  /**
   * 场景无用模型过滤
   * @param {模型name列表} nameList 模型name列表
   * @param {过滤name列表} castNameList 过滤name列表
   * @returns
   */
  static _modelsFilter = (nameList = [], castNameList = []) => {
    if (nameList?.length === 0) {
      return [];
    }
    // 筛选掉可视域视锥体mesh
    // eslint-disable-next-line no-param-reassign
    nameList =
      nameList?.length === 0
        ? []
        : nameList.filter(
          (item) => item.object.name !== '可视域视锥体' && item.object.visible === true
        );
    // 墙体过滤 , 不过滤地板
    const newarray = [];
    nameList.forEach((item) => {
      if (!castNameList.includes(item.object.name)) {
        newarray.push(item);
      }
    });
    // eslint-disable-next-line no-param-reassign
    nameList = newarray;
    return nameList;
  };

  /**
   * 几何体合并
   * @param {*} objects mesh列表
   * @returns
   */
  static mergeBufferGeometry = (objects) => {
    const sumPosArr = [];
    const sumNormArr = [];
    const sumUvArr = [];
    const modelGeometry = new THREE.BufferGeometry();
    let sumPosCursor = 0;
    let sumNormCursor = 0;
    let sumUvCursor = 0;
    let startGroupCount = 0;
    let lastGroupCount = 0;
    for (let a = 0; a < objects.length; a++) {
      const posAttArr = objects[a].geometry.getAttribute('position').array;
      for (let b = 0; b < posAttArr.length; b++) {
        sumPosArr[b + sumPosCursor] = posAttArr[b];
      }
      sumPosCursor += posAttArr.length;
      const numAttArr = objects[a].geometry.getAttribute('normal').array;
      for (let b = 0; b < numAttArr.length; b++) {
        sumNormArr[b + sumNormCursor] = numAttArr[b];
      }
      sumNormCursor += numAttArr.length;
      const uvAttArr = objects[a].geometry.getAttribute('uv').array;
      for (let b = 0; b < uvAttArr.length; b++) {
        sumUvArr[b + sumUvCursor] = uvAttArr[b];
      }
      sumUvCursor += uvAttArr.length;
      const groupArr = objects[a].geometry.groups;
      for (let b = 0; b < groupArr.length; b++) {
        startGroupCount = lastGroupCount;
        modelGeometry.addGroup(startGroupCount, groupArr[b].count, groupArr[b].materialIndex);
        lastGroupCount = startGroupCount + groupArr[b].count;
      }
    }
    modelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sumPosArr, 3));
    // eslint-disable-next-line no-unused-expressions
    sumNormArr.length &&
      modelGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(sumNormArr, 3));
    // eslint-disable-next-line no-unused-expressions
    sumUvArr.length &&
      modelGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(sumUvArr, 2));
    return modelGeometry;
  };

  /**
   * 创建连线
   * @param {*} points
   * @param {*} color
   * @returns line
   */
  static createLine = (points, color = '#00CEFF', depthTest = true) => {
    const pointArr = [];
    let line = null;

    if (points?.length > 1) {
      points.forEach((item) => {
        pointArr.push(item.x);
        pointArr.push(item.y);
        pointArr.push(item.z);
      });
      const lineMaterial = new LineMaterial({
        color,
        linewidth: 0.001,
        depthTest
      });
      const lineGeometry = new LineGeometry().setPositions(pointArr);
      line = new Line2(lineGeometry, lineMaterial);
    }
    return line;
  };
}
