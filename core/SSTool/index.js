import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { BufferGeometry } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import SSThreeLoop from '../SSThreeLoop';

export default class SSThreeTool {
  /**
   * use tween animation
   * @param {object} aStartPoint 开始的起点
   * @param {object} aEndPoint 结束的起点
   * @param {function(object, number): void} onUpdate 更新过程
   * @param {number} [speed=1] 运行速度
   * @param {function ():void} onComplete
   */
  static useTweenAnimate = (
    aStartPoint = {},
    aEndPoint = {},
    onUpdate = () => {},
    speed = 1,
    onComplete = () => {}
  ) => {
    let _animateFrameRef;
    const tweenAnimate = new TWEEN.Tween(aStartPoint);
    tweenAnimate.to(aEndPoint, speed * 1000);
    tweenAnimate.onUpdate(onUpdate);
    tweenAnimate.onStop(() => {
      TWEEN.remove(tweenAnimate);
      SSThreeLoop.removeId(_animateFrameRef);
    });
    tweenAnimate.onComplete(() => {
      SSThreeLoop.removeId(_animateFrameRef);
      onComplete?.();
    });
    tweenAnimate.easing(TWEEN.Easing.Linear.None);
    tweenAnimate.start();

    _animateFrameRef = SSThreeLoop.add(() => {
      if (tweenAnimate.isPlaying()) {
        TWEEN.update();
      }
    });
  };

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
   * @param {THREE.Object3D} obj object3D
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
   * @param {THREE.Object3D} obj object3D
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
   * @param {THREE.Object3D} obj object3D
   * @param {string} forwardFirection mesh direction x,y,z
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
   * @param {THREE.Vector3} worldVector
   * @param {THREE.Camera} camera
   * @returns
   */
  static worldToScreen = (worldVector, camera) => {
    const standardVector = worldVector.project(camera); // 世界坐标转标准设备坐标
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
   * @param {THREE.Object3D} object
   */
  static setBoundingBox = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    return { max: box.max, min: box.min };
  };

  /**
   * 根据物体生成包围盒子
   * @param {THREE.Object3D} object
   */
  static getBoundingBox = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    return box;
  };

  /**
   * 场景无用模型过滤
   * @param {string[]} nameList 模型name列表
   * @param {string[]} castNameList 过滤name列表
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
   * @param {THREE.Object3D[]} objects mesh列表
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
   * @param {THREE.Vector3[]} points
   * @param {string} color
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

  /**
   * set mesh opacity
   * @param {number} [aOpacity=0.5] opacity  range:[0,1]
   * @param {Array<string>} meshNames material names defaut all
   * @param {THREE.Object3D[]} targetObject3Ds target object
   */
  static setOpacity = (aOpacity, targetObject3Ds, meshNames = []) => {
    let opacity = aOpacity;
    if (opacity === undefined || opacity === null) {
      opacity = 0.5;
    }
    const setMeshTransparent = (aMesh) => {
      if (aMesh instanceof THREE.Mesh) {
        let materialChildren = aMesh.material;
        if (materialChildren instanceof THREE.Material) {
          materialChildren = [materialChildren];
        }
        for (let index = 0; index < materialChildren.length; index++) {
          const material = materialChildren[index];
          if (material instanceof THREE.Material) {
            material.transparent = opacity !== 1;
            material.opacity = opacity;
          }
        }
      }
    };
    if (meshNames.length === 0) {
      targetObject3Ds.forEach((targetObject3D) => {
        targetObject3D.traverse((e) => {
          setMeshTransparent(e);
        });
      });
    }
    //
    targetObject3Ds.forEach((targetObject3D) => {
      meshNames.forEach((mesh) => {
        const obj = targetObject3D.getObjectByName(mesh);
        obj.traverse((e) => {
          setMeshTransparent(e);
        });
      });
    });
  };

  /**
   * set mesh visible
   * @param {number} aVisible 可见  range:[0,1]
   * @param {Array<string} meshNames material names defaut all
   * @param {THREE.Object3D[]} targetObject3Ds 目标object3d
   */
  static setVisible = (aVisible = true, targetObject3Ds = null, meshNames = []) => {
    // set material transpant
    const setObjVisible = (aObj) => {
      if (aObj instanceof THREE.Object3D) {
        // current
        aObj.visible = aVisible;
        if (aVisible) {
          // visible true parent > parent true
          let { parent } = aObj;
          while (parent) {
            parent.visible = aVisible;
            parent = parent.parent;
          }
        }
        // visible false child false
        aObj.traverse((e) => {
          e.visible = aVisible;
        });
      }
    };
    // reset obj
    const resetAllObj = (resetVisible) => {
      targetObject3Ds.forEach((element) => {
        element.traverse((e) => {
          e.visible = resetVisible;
        });
      });
    };
    resetAllObj(meshNames.length > 0 ? !aVisible : aVisible);
    if (meshNames.length === 0) {
      return;
    }
    //

    targetObject3Ds.forEach((targetObject3D) => {
      meshNames.forEach((e) => {
        const obj = targetObject3D.getObjectByName(e);
        setObjVisible(obj);
      });
    });
  };

  /**
   * zoom
   * @param {number} aValue 放大缩小的倍数
   * @param {THREE.PerspectiveCamera} camera 目标相机
   */
  static zoom = (aValue, camera) => {
    const endPosition = camera.position.clone().multiplyScalar(aValue);
    this.useTweenAnimate(
      {
        position: camera.position.clone()
      },
      {
        position: endPosition
      },
      (e) => {
        camera.position.copy(e.position);
        camera.updateProjectionMatrix();
      },
      0.5
    );
  };

  /**
   * 模型爆炸效果 ，距离中心线等距离增加长度
   * @param {number} [aValue] 爆炸比例
   * @param {THREE.Object3D} [targetObject3D] 目标物体
   */
  static explode = (aValue, targetObject3D) => {
    const startPoint = {};
    const endPoint = {};
    const objs = {};
    targetObject3D.traverse((aObj) => {
      if (aObj instanceof THREE.Mesh) {
        const postion = aObj.position.clone();
        objs[aObj.name] = aObj;
        startPoint[`${aObj.name}_x`] = postion.x;
        startPoint[`${aObj.name}_y`] = postion.y;
        startPoint[`${aObj.name}_z`] = postion.z;
        postion.multiplyScalar(aValue);
        endPoint[`${aObj.name}_x`] = postion.x;
        endPoint[`${aObj.name}_y`] = postion.y;
        endPoint[`${aObj.name}_z`] = postion.z;
      }
    });
    const objNames = Object.keys(objs);
    this.useTweenAnimate(startPoint, endPoint, (e) => {
      objNames.forEach((objName) => {
        const obj = objs[objName];
        obj.position.set(e[`${objName}_x`], e[`${objName}_y`], e[`${objName}_z`]);
      });
    });
  };

  /**
   * 设置物体其他颜色
   * @param {Array<string} meshNames 材质物体
   * @param { string | number} materialColor color 物体颜色
   * @param {THREE.Object3D[]} targetObject3Ds object 目标物体
   * @returns
   */
  static setMeshColorByNames = (meshNames, materialColor, targetObject3Ds) => {
    if (meshNames?.length === 0) {
      return;
    }
    const changeMaterials = (aMaterials = []) =>
      aMaterials.map((e) => {
        const newMaterial = e.clone();
        newMaterial.color = new THREE.Color(materialColor || '#DDFF00');
        return newMaterial;
      });
    const setMesh = (mesh) => {
      if (mesh instanceof THREE.Mesh) {
        let list = [mesh.material];
        if (mesh.material instanceof Array) {
          list = mesh.material;
        }
        if (!mesh.userData?.changeMaterials) {
          const newMaterials = changeMaterials(list);
          mesh.userData = {
            originMaterials: list.length === 1 ? list[0] : list,
            changeMaterials: newMaterials.length === 1 ? newMaterials[0] : newMaterials
          };
        }
        mesh.material = mesh.userData.changeMaterials;
      }
    };
    targetObject3Ds.forEach((targetObject3D) => {
      for (let index = 0; index < meshNames.length; index++) {
        const meshName = meshNames[index];
        const obj3d = targetObject3D.getObjectByName(meshName);
        obj3d.traverse((e) => {
          setMesh(e);
        });
      }
    });
  };

  /**
   * 重置物体颜色
   * @param {Array<string} meshNames 一组meshname
   * @param {THREE.Object3D[]} targetObject3Ds 目标物体
   * @returns
   */
  static resetMeshNames = (meshNames, targetObject3Ds) => {
    if (meshNames?.length === 0) {
      return;
    }
    const setMesh = (mesh) => {
      if (mesh instanceof THREE.Mesh) {
        if (mesh.userData?.originMaterials) {
          mesh.material = mesh.userData.originMaterials;
        }
      }
    };
    targetObject3Ds.forEach((targetObject3D) => {
      for (let index = 0; index < meshNames.length; index++) {
        const meshName = meshNames[index];
        const obj3d = targetObject3D.getObjectByName(meshName);
        obj3d.traverse((e) => {
          setMesh(e);
        });
      }
    });
  };

  /**
   * 根据物体生成包围盒子
   * @param {THREE.Object3D} object
   * @param {THREE.MeshBasicMaterialParameters} materialParams 参数
   */
  static addBoundingBoxByObject = (object, materialParams) => {
    const box = new THREE.Box3().setFromObject(object);
    const v = {
      x: Math.abs(box.max.x - box.min.x),
      y: Math.abs(box.max.y - box.min.y),
      z: Math.abs(box.max.z - box.min.z)
    };
    const geometry = new THREE.BoxBufferGeometry(v.x + 0.01, v.y + 0.01, v.z + 0.01);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 1, 1),
      transparent: true,
      opacity: 0.2,
      ...materialParams
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(SSThreeTool.getObjectCenter(object));
    return cube;
  };
}
