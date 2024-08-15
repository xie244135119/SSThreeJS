import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { BufferGeometry } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial, LineMaterialParameters } from 'three/examples/jsm/lines/LineMaterial';
import { SSThreeLoop, SSLoader } from '../index';
import LineStartPng from '../assets/line_start.png';

export default class SSThreeTool {
  /**
   * use tween animation
   * @param aStartPoint 开始的起点
   * @param aEndPoint 结束的起点
   * @param onUpdate 更新过程
   * @param speed 运行速度
   * @param onComplete 完成事件
   */
  static useTweenAnimate<T>(
    aStartPoint: T,
    aEndPoint: T,
    onUpdate: (T) => void,
    speed: number = 1,
    onComplete?: () => void
  ) {
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
    tweenAnimate.easing(TWEEN.Easing.Quadratic.InOut);
    tweenAnimate.start();

    _animateFrameRef = SSThreeLoop.add(() => {
      if (tweenAnimate.isPlaying()) {
        tweenAnimate.update();
      }
    });
  }

  /**
   * set model center
   * @param obj object3D
   */
  static setObjectCenter = (obj: THREE.Object3D) => {
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
   * @param obj object3D
   * @returns
   */
  static getObjectCenter = (obj: THREE.Object3D) => {
    if (obj instanceof THREE.Object3D) {
      return obj.getWorldPosition(new THREE.Vector3());
    }
    return new THREE.Vector3();
  };

  /**
   * 经过拆分后的模型数据，根据子物体获取拆分前 原始物体名称
   * @param obj3d object
   * @returns
   */
  static getOriginObject = (obj3d: THREE.Object3D) => {
    if (obj3d.name.indexOf('_') === -1) {
      return obj3d;
    }
    const nameArry = obj3d.name.split('_') || [];
    const lastText = nameArry[nameArry.length - 1];
    if (!lastText) {
      return obj3d;
    }
    if (Number.isNaN(Number(lastText))) {
      return obj3d;
    }
    nameArry.pop();
    return obj3d.parent;
  };

  /**
   * get obj box center
   * @param obj object3D
   */
  static getBoxCenter = (obj: THREE.Object3D) => {
    const box = new THREE.Box3();
    box.setFromObject(obj);
    const { max, min } = box;
    return new THREE.Vector3((max.x - min.x) / 2, (max.y - min.y) / 2, (max.z - min.z) / 2);
  };

  /**
   * get camera and scene  on object3D front (reslove 80% )
   * @param obj object3D
   * @param forwardFirection mesh direction x,y,z
   * @returns
   */
  static getCameraScenePositionByObject = (
    obj: THREE.Object3D,
    forwardFirection: 'x' | '-x' | 'y' | '-y' | 'z' | '-z' = 'z'
  ) => {
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
   * @param fn 虚函数
   * @param wait 防抖时间
   * @param immediate 立刻执行
   * @returns
   */
  static debounce = (fn: (e: any) => any, wait: number = 200, immediate: boolean = false) => {
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
   * @param fn 虚函数
   * @param wait 等待时间
   * @returns
   */
  static throttle = (fn: (e: any) => any, wait: number = 200) => {
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
   * @param worldVector
   * @param camera
   * @returns
   */
  static worldToScreen = (worldVector: THREE.Vector3, camera: THREE.Camera) => {
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
  static screenToWorld = (
    aPoint: THREE.Vector2,
    aContainer: HTMLElement,
    threeCamera: THREE.Camera,
    targetZ: number = 0
  ) => {
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
    return res;
  };

  /**
   * 根据物体生成包围盒子
   * @param object
   */
  static setBoundingBox = (object: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(object);
    return { max: box.max, min: box.min };
  };

  /**
   * 根据物体生成包围盒子
   * @param object
   */
  static getBoundingBox = (object: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(object);
    return box;
  };

  // /**
  //  * 场景无用模型过滤
  //  * @param nameList 模型name列表
  //  * @param castNameList 过滤name列表
  //  * @returns
  //  */
  // static _modelsFilter = (nameList: string[], castNameList: string[]) => {
  //   if (nameList?.length === 0) {
  //     return [];
  //   }
  //   // 筛选掉可视域视锥体mesh
  //   // eslint-disable-next-line no-param-reassign
  //   nameList =
  //     nameList?.length === 0
  //       ? []
  //       : nameList.filter(
  //           (item) => item.object.name !== '可视域视锥体' && item.object.visible === true
  //         );
  //   // 墙体过滤 , 不过滤地板
  //   const newarray = [];
  //   nameList.forEach((item) => {
  //     if (!castNameList.includes(item.object.name)) {
  //       newarray.push(item);
  //     }
  //   });
  //   // eslint-disable-next-line no-param-reassign
  //   nameList = newarray;
  //   return nameList;
  // };

  /**
   * 几何体合并
   * @param objects mesh列表
   * @returns
   */
  static mergeBufferGeometry = (meshs: THREE.Mesh[]) => {
    const modelGeometry = new THREE.BufferGeometry();
    const positions = [];
    meshs.forEach((e) => {
      const geo = e.geometry;
      positions.push(...geo.getAttribute('position').array);
    });
    modelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return modelGeometry;
  };

  /**
   * set mesh opacity
   * @param aOpacity opacity  range:[0,1]
   * @param meshNames material names defaut all
   * @param targetObject3Ds target object
   */
  static setOpacity = (
    aOpacity: number,
    targetObject3Ds: THREE.Object3D[],
    meshNames: string[]
  ) => {
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
        obj?.traverse((e) => {
          setMeshTransparent(e);
        });
      });
    });
  };

  /**
   * set mesh visible
   * @param aVisible 可见
   * @param meshNames material names defaut all
   * @param targetObject3Ds 目标object3d
   */
  static setVisible = (
    aVisible: boolean = true,
    targetObject3Ds: THREE.Object3D[] = null,
    meshNames: string[]
  ) => {
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
   * @param aValue 放大缩小的倍数
   * @param camera 目标相机
   */
  static zoom = (aValue: number, camera: THREE.PerspectiveCamera) => {
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
   * @param aValue 爆炸比例
   * @param targetObject3D 目标物体
   */
  static explode = (aValue: number, targetObject3D: THREE.Object3D) => {
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
   * @param meshNames 材质物体
   * @param materialColor color 物体颜色
   * @param targetObject3Ds object 目标物体
   * @returns
   */
  static setMeshColorByNames = (
    meshNames: string[],
    materialColor: string | number,
    targetObject3Ds: THREE.Object3D[]
  ) => {
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
        obj3d?.traverse((e) => {
          setMesh(e);
        });
      }
    });
  };

  /**
   * 重置物体颜色
   * @param meshNames 一组meshname
   * @param targetObject3Ds 目标物体
   * @returns
   */
  static resetMeshNames = (meshNames: string[], targetObject3Ds: THREE.Object3D[]) => {
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
        obj3d?.traverse((e) => {
          setMesh(e);
        });
      }
    });
  };

  /**
   * 根据物体生成包围盒子
   * @param object
   * @param materialParams 材质参数
   */
  static addBoundingBoxByObject = (
    object: THREE.Object3D,
    materialParams: THREE.MeshBasicMaterialParameters
  ) => {
    const box = new THREE.Box3().setFromObject(object);
    const v = {
      x: Math.abs(box.max.x - box.min.x),
      y: Math.abs(box.max.y - box.min.y),
      z: Math.abs(box.max.z - box.min.z)
    };
    const geometry = new THREE.BoxGeometry(v.x + 0.01, v.y + 0.01, v.z + 0.01);
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

  /**
   * 增加连线
   * @param startPoint 起点
   * @param endPoint 终点
   * @param lineOptions 线框效果
   * @param centerIcon 中心icon
   */
  static addLineByPoints = (
    points: THREE.Vector3[],
    lineOptions?: LineMaterialParameters,
    centerIcon: boolean = false
  ) => {
    if (points.length <= 1) {
      return null;
    }
    const material = new LineMaterial({
      color: 0x00ceff,
      linewidth: 0.001,
      depthTest: false,
      ...(lineOptions || {})
    });
    const positions = [];
    points.forEach((item) => {
      positions.push(item.x, item.y, item.z);
    });

    const geo = new LineGeometry();
    geo.setPositions(positions);

    const group = new THREE.Group();
    group.name = 'LineGroup';
    const line = new Line2(geo, material);
    group.add(line);
    if (centerIcon) {
      SSLoader.loadSprite(LineStartPng).then((obj) => {
        obj.position.copy(points[0]);
        obj.scale.set(0.2, 0.2, 0.2);
        group.attach(obj);
      });
    }
    return {
      line,
      group
    };
  };

  /**
   * auto compute position and create line
   * @param aObj obj model
   * @param meshTowards direction
   * @param lineOptions 线条效案
   * @returns
   */
  static addLineFromObject = (
    aObj: THREE.Object3D,
    meshTowards: 'x' | '-x' | 'y' | '-y' | 'z' | '-z' = 'z',
    lineMaterialOptions?: LineMaterialParameters
  ) => {
    const startVector = SSThreeTool.getObjectCenter(aObj);
    const endVector = startVector.clone();
    const { max, min } = SSThreeTool.setBoundingBox(aObj);
    const xWidth = max.x - min.x;
    const zWidth = max.z - min.z;
    const yHeight = max.y - min.y;

    const directionScale = meshTowards.indexOf('-') === -1 ? 1 : -1;
    const towardscale = 0.5;
    const sidescale = 0.5 + (0.5 * 1) / 20;
    const xdirection = meshTowards.indexOf('x') !== -1;
    const zdirection = meshTowards.indexOf('z') !== -1;
    // fix on right
    if (xdirection) {
      // x -z or  -x z
      endVector.x += xWidth * towardscale * directionScale;
      endVector.z += zWidth * sidescale * directionScale * -1;
    } else if (zdirection) {
      // -z -x  or  z x
      endVector.z += zWidth * towardscale * directionScale;
      endVector.x += xWidth * sidescale * directionScale;
    }
    endVector.y += (yHeight * 0.5 * 4) / 5;
    const { group, line } = this.addLineByPoints(
      [startVector, endVector],
      lineMaterialOptions,
      true
    );
    return {
      group,
      line,
      startVector,
      endVector
    };
  };

  /**
   * 获取物体z轴朝向且距离半径的坐标位置(z + radius)
   * @param object
   */
  static getObjectWorldDirection = (object: THREE.Object3D, offset: number = 0) => {
    const box = new THREE.Box3().setFromObject(object);
    const center = this.getBoundingBox(object).getCenter(new THREE.Vector3());
    box.applyMatrix4(object.matrix);
    // 获取边界框的尺寸
    const size = new THREE.Vector3();
    box.getSize(size);
    const offSetZ = size.z / 2 + offset;
    // 获取物体的局部坐标系
    const localMatrix = new THREE.Matrix4().copy(object.matrixWorld).invert();
    // 将边界框的中心点转换为物体的局部坐标系
    center.applyMatrix4(localMatrix);
    // 在 z 轴上移动到半径位置
    center.z += offSetZ;
    // 将半径位置转换回世界坐标系
    center.applyMatrix4(object.matrixWorld);
    return center;
  };

  /**
   * 获取物体本地朝向(跟随父物体逆矩阵) 返回局部坐标系中的 X、Y、Z 轴朝向
   * @param object 目标物体
   */
  static getLocalDirection2 = (object: THREE.Object3D) => {
    // 获取物体的局部变换矩阵
    const localMatrix = new THREE.Matrix4();
    localMatrix.extractRotation(object.matrix); // 从物体的变换矩阵中提取旋转部分

    // 重要： 获取物体的局部变换矩阵的逆矩阵，解决物体旋转时错乱问题
    const localMatrixInverse = localMatrix.clone().invert();

    // 获取局部坐标系中的 Z 轴和 X 轴朝向
    const LocalXDirection = new THREE.Vector3(1, 0, 0)
      .applyMatrix4(localMatrix)
      .applyMatrix4(localMatrixInverse)
      .normalize(); // X 轴
    const LocalYDirection = new THREE.Vector3(0, 1, 0)
      .applyMatrix4(localMatrix)
      .applyMatrix4(localMatrixInverse)
      .normalize(); // Y 轴
    const LocalZDirection = new THREE.Vector3(0, 0, 1)
      .applyMatrix4(localMatrix)
      .applyMatrix4(localMatrixInverse)
      .normalize(); // Z 轴
    return { LocalXDirection, LocalYDirection, LocalZDirection }; // 返回局部坐标系中的 X、Y、Z 轴朝向
  };
}
