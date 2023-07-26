import * as THREE from 'three';
import SSEvent from '../SSEvent';
import SSModuleInterface from './module.interface';
import SSLoader from '../SSLoader';
import SSThreeTool from '../SSTool';
import SSTransformControl from '../SSTool/TransformControl';
import EyePng from '../assets/textures/eye.png';

export default class SSWatchLookModule extends SSModuleInterface {
  title = '模块-指哪看哪';

  /**
   * @type {SSEvent} 指哪看哪事件
   */
  _event = null;

  /**
   * @type {Array<THREE.Object3D>}
   */
  _allCameraMeshs = null;

  /**
   * @type {THREE.Group} 指哪看哪 摄像头分组
   */
  _lookGroup = null;

  /**
   * @type {SSTransformControl} 操作组件
   */
  _sstransformControl = null;

  /**
   * 默认配置
   */
  _defaultConfig = {
    指哪看哪: false,
    // 模型路径 和 模型格式
    cameraModelPath: 'public/yuntai/sxt01.FBX',
    // 相机镜头 <可移动的镜头>
    cameraAnchorMeshName: 'sxt001',
    // 相机桩位
    cameraFixMeshName: 'Box001',
    // 全部相机的模式
    cameraListText: '[]',
    // 全部位置点位
    cameraList: [],
    //
    boxWidth: 0.2
  };

  destory() {
    this._sstransformControl?.destory();
    this._sstransformControl = null;
    this._defaultConfig = null;
    this._allCameraMeshs = null;
    this._event?.destory();
    this._event = null;
  }

  /**
   * add camera
   * @param {{ name: string, position: THREE.Vector3, rotation: THREE.Vector3, type: string, uuid: string }[]} aList 相机配置列表
   * @param {string} aModelPath 模型地址
   * @param {string} [anchorMeshName] 加载相机视椎的锚点 meshName
   * @returns
   */
  addCamera = (aList, aModelPath, anchorMeshName) =>
    this.addCameraModel(aModelPath, anchorMeshName).then((model) => {
      //
      aList.forEach((e, index) => {
        const newModel = index === 0 ? model : model.clone(true);
        newModel.position.set(e.position.x, e.position.y, e.position.z);
        newModel.name = e.name || '';
        newModel.userData = e;
        this._lookGroup.add(newModel);
        // roate
        if (e.rotation) {
          newModel.rotation.set(
            THREE.MathUtils.degToRad(e.rotation.x),
            THREE.MathUtils.degToRad(e.rotation.y),
            THREE.MathUtils.degToRad(e.rotation.z)
          );
        }
        if (['yuntai', 'ball'].some((type) => e.type === type)) {
          this._allCameraMeshs.push(newModel);
          // update
          this._defaultConfig.cameraList.push({
            ...e,
            uuid: newModel.uuid
          });
          this.moduleUpdateGuiValue(
            'cameraListText',
            JSON.stringify(this._defaultConfig.cameraList)
          );
        }
      });
      return this._allCameraMeshs;
    });

  /**
   * add camera model
   * @param {string} aModelPath 模型加载地址(fbx 或 fltf)
   * @param {string} [anchorMeshName] 加载相机视椎的锚点 meshName
   * @param {number} [boxWidth] 加载相机视椎的锚点 meshName
   * @returns {Promise<THREE.Group>}
   */
  addCameraModel = (aModelPath = '', anchorMeshName = 'sxt001', boxWidth = 0.2) => {
    const aModelFileType = aModelPath.split('.').pop().toLowerCase();
    const normalcreate = new Promise((reslove) => {
      const box = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
      const material = new THREE.MeshBasicMaterial({
        color: '#FF0000'
      });
      const mesh = new THREE.Mesh(box, material);
      reslove(mesh);
    });
    let promise = normalcreate;
    switch (aModelFileType) {
      case 'gltf':
        promise = SSLoader.loadGltf(aModelPath).then((res) => {
          if (res) {
            return res.scene;
          }
          return normalcreate;
        });
        break;
      case 'fbx':
        promise = SSLoader.loadFbx(aModelPath).then((mesh) => {
          if (mesh) {
            return mesh;
          }
          return normalcreate;
        });
        break;
      default:
        break;
    }
    return promise?.then((model) => {
      // 视椎
      const cubematerial = new THREE.MeshBasicMaterial({
        // map: texture,
        color: '#13827e',
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
        opacity: 0.3
      });
      const cubeheight = 4;
      const cylidergeo = new THREE.CylinderGeometry(0.2, 1.5, cubeheight, 4, 1, false);
      const cubeposition = new THREE.Vector3(0, 0, cubeheight / 2);
      const cubemesh = new THREE.Mesh(cylidergeo, cubematerial);
      cubemesh.visible = false;
      cubemesh.name = '_视椎';
      cubemesh.position.copy(cubeposition);
      cubemesh.rotation.x = THREE.MathUtils.degToRad(-90);
      cubemesh.rotation.y = THREE.MathUtils.degToRad(-45);

      // 指定的目标位置放置区域椎体
      if (anchorMeshName) {
        const sxt001 = model.getObjectByName(anchorMeshName);
        sxt001?.add(cubemesh);
      } else {
        model.add(cubemesh);
      }
      return model;
    });
  };

  /**
   * add eye
   * @param {THREE.Vector3} targetPoint 目标点位
   */
  addEye = (targetPoint = new THREE.Vector3()) => {
    let targetMesh = this._lookGroup.getObjectByName('指哪看哪_eye');
    if (!targetMesh) {
      const texture = new THREE.TextureLoader().load(EyePng);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        // color: 'red',
        depthTest: true,
        side: THREE.DoubleSide,
        transparent: true
      });
      const geomertry = new THREE.PlaneGeometry(0.1, 0.1);
      const mesh = new THREE.Mesh(geomertry, material);
      mesh.name = '指哪看哪_eye';
      this._lookGroup.add(mesh);
      targetMesh = mesh;
    }
    targetMesh.position.copy(targetPoint);
  };

  /**
   * compute target and camera angle
   * @param {THREE.Vector3} targetVecor 目标点位
   * @param {THREE.Object3D} cameraMesh 相机Mesh
   * @param {THREE.Object3D} cameraGroup 相机组
   * @returns {{ heading: number, pitch1: number, pitch2: number, roll: number }
   */
  computeCameraAngle = (targetVecor, cameraMesh, cameraGroup) => {
    // 相机的z方向 <向量>
    const cameraMeshDirection = cameraGroup.getWorldDirection(new THREE.Vector3());
    // 目标 > 相机 方向
    const targetDirection = targetVecor
      .clone()
      .sub(cameraMesh.getWorldPosition(new THREE.Vector3()));

    // 计算投影
    const getAngle = (aPlane = new THREE.Vector3()) => {
      const cameraPlane = cameraMeshDirection.clone().projectOnPlane(aPlane.clone());
      const targetPlane = targetDirection.clone().projectOnPlane(aPlane.clone());
      const radious = cameraPlane.angleTo(targetPlane);
      // console.log(' cameraPlane targetPlane', cameraPlane, targetPlane, aPlane);
      // direction
      const crosss = cameraPlane.clone().cross(targetPlane.clone());
      // if (crosss.z > 0) {
      //     console.log(' 逆时针旋转 ');
      // } else {
      //     console.log(' 顺时针旋转 ');
      // }
      return THREE.MathUtils.radToDeg(radious) * (crosss.z > 0 ? -1 : 1);
    };

    // x 0 z 投影
    const heading = getAngle(new THREE.Vector3(0, 1, 0));

    // y 0 x 投影
    const pitch1 = getAngle(new THREE.Vector3(0, 0, 1));

    // y 0 z 投影
    const pitch2 = getAngle(new THREE.Vector3(1, 0, 0));

    return {
      heading,
      pitch1,
      pitch2,
      roll: 0
    };
  };

  /**
   * compute target and camera angle
   * @param {THREE.Vector3} targetVecor 目标点位
   * @param {THREE.Object3D} cameraMesh 相机Mesh
   * @param {THREE.Object3D} cameraGroup 相机组
   * @param {string} cameraType 相机类型 yuntai ball
   * @returns {{ heading: number, pitch: number, roll: number }
   */
  computeCameraAngle2 = (targetVecor, cameraMesh, cameraGroup, cameraType) => {
    // 计算夹角
    const newcamworldpos = new THREE.Vector3();
    cameraMesh.getWorldPosition(newcamworldpos);
    // //方向箭头辅助类
    // var arrowFront = new THREE.ArrowHelper(camobj.children[3].getWorldDirection(), camobj.children[3].position, 30, 0xFF0000);
    // this.scene.add(arrowFront)
    // 求角度新方法
    // dz
    // 获取初始z轴朝向
    const dirz = cameraGroup.getWorldDirection(new THREE.Vector3());
    // var ang = this.modelToolJs.getAngle(camworldpos.toArray(), castobj.point.toArray(), [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    // 新算法
    // 开始点
    const originArr = newcamworldpos.toArray();
    // 目标点
    const targetArr = targetVecor.toArray();
    // 水平角
    let h = this._getAngle_hori(originArr, targetArr, [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    // 竖直角
    let v = this._getAngle2_yz_vert(originArr, targetArr, [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    if (Math.abs(h) > 45) {
      v = this._getAngle2_xy_vert(originArr, targetArr, [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    }
    // console.log(camobj.name, '{h::' + h, ' v::' + v + '}');
    // var camItem = new this._cameraAngleItem(camobj.name, h, v);
    // camAngleList.push(camItem);
    // if (camobj.name === 'cameraself01') {
    //   back = true;
    // }

    if (cameraType === 'yuntai') {
      // 球机向下为正，向左为正 俯角: -180-180, 0~360 水平角: 0~360  -180~180
      h = -h;
    } else if (cameraType === 'ball') {
      // 球机向下为正 向右为正 俯角: 0-180 水平角: 0~360  -180~180
      v = v < 0 ? 0 : v;
    }

    // h = -h;
    // v = v < 0 ? 0 : v;
    return {
      heading: h,
      pitch: v,
      roll: 0
    };
  };

  /**
   * 求竖直俯仰角 ——yz投影
   * @param {*} origin
   * @param {*} target
   * @param {*} dy
   * @param {*} dz
   * @returns
   */
  _getAngle2_yz_vert = (origin = [], target = [], dy = [], dz = []) => {
    const dx = [
      dy[1] * dz[2] - dy[2] * dz[1], // 0
      dy[2] * dz[0] - dy[0] * dz[2], // 1
      dy[0] * dz[1] - dy[1] * dz[0]
    ]; // 2
    const originV3 = new THREE.Vector3(origin[0], origin[1], origin[2]);
    const targetV3 = new THREE.Vector3(target[0], target[1], target[2]);
    const dyV3 = new THREE.Vector3(dy[0], dy[1], dy[2]);
    const dzV3 = new THREE.Vector3(dz[0], dz[1], dz[2]);
    const dxV3 = new THREE.Vector3(dx[0], dx[1], dx[2]);
    // 看向的向量
    const lookdir = targetV3.sub(originV3);
    const lookdircopy = new THREE.Vector3(0, 0, 0);
    lookdircopy.copy(lookdir);
    // 俯仰角计算*** 对x
    // x轴分量投影 yz面一个向量
    const lookyz = lookdir.sub(lookdircopy.projectOnVector(dxV3));
    let anglev = lookyz.angleTo(dzV3);
    const dirv = dyV3.dot(lookyz) > 0 ? 1 : -1;
    anglev = -THREE.MathUtils.radToDeg(anglev) * dirv;
    // console.log('俯仰角::', angle_v);
    return anglev;
  };

  /**
   * 求竖直俯仰度 ——xy投影
   * @param {*} origin
   * @param {*} target
   * @param {*} dy
   * @param {*} dz
   * @returns
   */
  _getAngle2_xy_vert = (origin = [], target = [], dy = [], dz = []) => {
    const dx = [
      dy[1] * dz[2] - dy[2] * dz[1], // 0
      dy[2] * dz[0] - dy[0] * dz[2], // 1
      dy[0] * dz[1] - dy[1] * dz[0]
    ]; // 2
    // var rs = [0, 0];
    const originV3 = new THREE.Vector3(origin[0], origin[1], origin[2]);
    const targetV3 = new THREE.Vector3(target[0], target[1], target[2]);
    // var dyV3 = new THREE.Vector3(dy[0], dy[1], dy[2]);
    const dzV3 = new THREE.Vector3(dz[0], dz[1], dz[2]);
    const dxV3 = new THREE.Vector3(dx[0], dx[1], dx[2]);
    // 看向的向量
    const lookdir = targetV3.sub(originV3);
    const lookdircopy = new THREE.Vector3(0, 0, 0);
    lookdircopy.copy(lookdir);
    // 俯仰角计算*** 对z
    // x轴分量投影 xy面一个向量
    const lookxy = lookdir.sub(lookdircopy.projectOnVector(dzV3));
    let anglev = lookxy.angleTo(dxV3);
    // var dirv = dzV3.dot(look_xy) > 0 ? 1 : -1;
    // angle_v = -THREE.Math.radToDeg(angle_v) * dirv;
    anglev = -THREE.MathUtils.radToDeg(anglev);
    // console.log('俯仰角::', angle_v) //绝对值-90
    const an = 90 - Math.abs(Math.abs(anglev) - 90);
    // console.log('俯仰角::', an); //绝对值-90
    // var an = angle_v - 90
    // an = an * dirv
    // console.log('俯仰角::', an ) //绝对值-90
    return an;
  };

  /**
   * 求水平角
   * @param {*} origin
   * @param {*} target
   * @param {*} dy
   * @param {*} dz
   * @returns
   */
  _getAngle_hori = (origin = [], target = [], dy = [], dz = []) => {
    const dx = [
      dy[1] * dz[2] - dy[2] * dz[1], // 0
      dy[2] * dz[0] - dy[0] * dz[2], // 1
      dy[0] * dz[1] - dy[1] * dz[0]
    ]; // 2
    // var rs = [0, 0];
    const originV3 = new THREE.Vector3(origin[0], origin[1], origin[2]);
    const targetV3 = new THREE.Vector3(target[0], target[1], target[2]);
    const dyV3 = new THREE.Vector3(dy[0], dy[1], dy[2]);
    const dzV3 = new THREE.Vector3(dz[0], dz[1], dz[2]);
    const dxV3 = new THREE.Vector3(dx[0], dx[1], dx[2]);
    // 看向的向量
    const lookdir = targetV3.sub(originV3);
    const lookdircopy = new THREE.Vector3(0, 0, 0);
    lookdircopy.copy(lookdir);
    // 水平角计算**** 对y
    // y轴分量投影 xz面一个向量
    const lookXz = lookdir.sub(lookdircopy.projectOnVector(dyV3));
    let angleh = lookXz.angleTo(dzV3);
    const dir = dxV3.dot(lookXz) > 0 ? 1 : -1;
    angleh = -THREE.MathUtils.radToDeg(angleh) * dir;
    // console.log('水平角::', angle_h);
    return angleh;
  };

  /**
   * start watchlook
   * @param {function({ meshName: string, obj: THREE.Object3D, objp: THREE.Object3D, cameras:{ cameraName: string, rotate: {heading: number, pitch: number, roll: number},distance: number} }): void} eachWatchComplete 每次指哪看哪完成调用后回调
   * @param {function(THREE.Object3D[]):THREE.Object3D[]} [filterModelFunc] 原始数据过滤
   */
  start = (eachWatchComplete, filterModelFunc) => {
    // open camera region
    this._allCameraMeshs.forEach((e) => {
      if (!(e instanceof THREE.Object3D)) {
        return;
      }
      const obj = e.getObjectByName('_视椎');
      if (obj) {
        obj.visible = true;
      }
    });
    //
    this._event.skipEvent(SSEvent.SSEventType.CLICK, this._eventAddMeshHandle);
    this._eventLookHandler = this._event.addEventListener(SSEvent.SSEventType.CLICK, (e) => {
      const scenechildren = this.ssthreeObject.threeScene.children.filter(
        (item) => item.uuid !== this._lookGroup.uuid
      );
      const models = this.ssthreeObject.getModelsByPoint(e, scenechildren);
      const finalModels = filterModelFunc?.(models, e) || models;
      if (finalModels.length === 0) return;
      const [model] = finalModels;
      const targetPoint = model.point;
      // 指向的目标点位
      this.addEye(targetPoint);

      const parentObj = SSThreeTool.getOriginMesh(model.object);
      // console.log(' 指哪看哪检索到的物体 ', e, model, parentObj);

      const list = [];
      this._allCameraMeshs.forEach((e) => {
        // 需要移动的相机视角
        const cameraMesh = e.getObjectByName('sxt001');
        // 固定mesh
        const fixMesh = e.getObjectByName('Box001');
        const angelObj = this.computeCameraAngle(targetPoint, cameraMesh, fixMesh);
        const angelObj2 = this.computeCameraAngle2(
          targetPoint,
          cameraMesh,
          fixMesh,
          e.userData.type || 'ball'
        );
        const centerPositon = SSThreeTool.getObjectCenter(cameraMesh);
        list.push({
          cameraName: e.name,
          cameraType: e.userData.type,
          rotate: angelObj2,
          rotate1: angelObj,
          distance: centerPositon.distanceTo(targetPoint)
        });
        // 初始点位
        const initalCameraLookAt = cameraMesh
          .getWorldDirection(new THREE.Vector3())
          .add(cameraMesh.getWorldPosition(new THREE.Vector3()));
        SSThreeTool.useTweenAnimate(initalCameraLookAt.clone(), targetPoint.clone(), (e) => {
          cameraMesh.lookAt(e);
        });
      });

      eachWatchComplete?.({
        meshName: parentObj?.name,
        obj: model,
        objp: parentObj,
        cameras: list.sort((a, b) => a.distance - b.distance)
      });
    });
  };

  /**
   * close watchlook
   */
  close = () => {
    this._allCameraMeshs.forEach((e) => {
      if (!(e instanceof THREE.Object3D)) {
        return;
      }
      const obj = e.getObjectByName('_视椎');
      obj.visible = false;
    });
    this._event.cancelSkipEvent(SSEvent.SSEventType.CLICK, this._eventAddMeshHandle);
    this._event.removeEventListener(SSEvent.SSEventType.CLICK, this._eventLookHandler);
  };

  /**
   * 相机移动到指定目的地
   * @param {string} aMeshName mesh name
   * @param {THREE.Vector3} aTargetPoint 目标点位
   */
  moveCameraToTarget = (aMeshName, aTargetPoint) => {
    this._allCameraMeshs.forEach((e) => {
      if (!(e instanceof THREE.Object3D)) {
        return;
      }
      const obj = e.getObjectByName('_视椎');
      obj.visible = false;
    });

    const object3d = this._allCameraMeshs.find((item) => item.name === aMeshName);
    const shizhuiobj = object3d.getObjectByName('_视椎');
    shizhuiobj.visible = true;
    // 初始点位
    const cameraMesh = object3d.getObjectByName('sxt001');
    const initalCameraLookAt = cameraMesh
      .getWorldDirection(new THREE.Vector3())
      .add(cameraMesh.getWorldPosition(new THREE.Vector3()));
    SSThreeTool.useTweenAnimate(initalCameraLookAt.clone(), aTargetPoint.clone(), (e) => {
      cameraMesh.lookAt(e);
    });
  };

  /**
   * 模块挂载
   */
  moduleMount() {
    const group = new THREE.Group();
    group.name = '指哪看哪';
    this._lookGroup = group;
    this.ssthreeObject.threeScene.add(group);
    //
    this._allCameraMeshs = [];
    //
    this._event = new SSEvent(this.ssthreeObject.threeContainer);
  }

  /**
   * 模块卸载
   */
  moduleUnmount() {
    this.destory();
  }

  getModuleConfig() {
    return this._defaultConfig;
  }

  getModuleConfigSource() {
    return {
      type: ['add', 'transform']
    };
  }

  moduleExport() {
    return {
      cameraModelPath: this._defaultConfig.cameraModelPath,
      cameraAnchorMeshName: this._defaultConfig.cameraAnchorMeshName,
      cameraList: this._defaultConfig.cameraList
    };
  }

  moduleImport(e) {
    const { cameraModelPath = '', cameraList = [], cameraAnchorMeshName } = e;
    this.addCamera(cameraList, cameraModelPath, cameraAnchorMeshName);
  }

  /**
   * Gui改变的时候
   * @param {*} params
   */
  moduleGuiChange(params) {
    // console.log(' 数据改变的时候 ', params);
    this._defaultConfig = params.target;
    //
    if (params.key === '指哪看哪') {
      if (params.value) {
        this.start((e) => {
          console.log(' 指哪看哪此次结束 ', e);
        });
      } else {
        this.close();
      }
    }
  }

  moduleOpenDebug() {
    // 添加镜头调试事件
    this._eventAddMeshHandle = this._event.addEventListener(SSEvent.SSEventType.CLICK, (e) => {
      const models = this.ssthreeObject.getModelsByPoint(e);
      if (models.length === 0) {
        return;
      }
      // 如果第一个物体为存在的相机 判断是否存在操作模型分组中
      let isExistModel = false;
      let targetModel = models[0].object;
      this._lookGroup.children.forEach((e) => {
        e.traverse((child) => {
          if (child.uuid === models[0].object.uuid) {
            isExistModel = true;
            targetModel = e;
          }
        });
      });
      // 添加转换
      if (this._sstransformControl === null) {
        this._sstransformControl = new SSTransformControl(this.ssthreeObject, (e) => {
          const findMeshIndex = this._defaultConfig.cameraList.findIndex(
            (item) => item.uuid === e.uuid
          );
          if (!e.delete) {
            this._defaultConfig.cameraList.splice(findMeshIndex, 1, {
              ...this._defaultConfig.cameraList[findMeshIndex],
              ...e
            });
          } else {
            // 删除
            this._defaultConfig.cameraList.splice(findMeshIndex, 1);
          }
          // console.log(' 转变过程中物体发生变化 ', e, this._defaultConfig.cameraList);
          this.moduleUpdateGuiValue(
            'cameraListText',
            JSON.stringify(this._defaultConfig.cameraList)
          );
        });
      }

      // 存在 进行修改操作，不存在做新增操作
      if (!isExistModel) {
        // 新增新的物体
        const { boxWidth, cameraModelPath, cameraAnchorMeshName } = this._defaultConfig;
        this.addCameraModel(cameraModelPath, cameraAnchorMeshName, boxWidth).then((mesh) => {
          mesh.position.copy(models[0].point);
          mesh.userData = { type: 'ball' };
          this._lookGroup.add(mesh);
          this._allCameraMeshs.push(mesh);
          // update Gui
          this._defaultConfig.cameraList.push({
            uuid: mesh.uuid,
            type: 'ball',
            position: mesh.position,
            rotation: {
              x: THREE.MathUtils.radToDeg(mesh.rotation.x),
              y: THREE.MathUtils.radToDeg(mesh.rotation.y),
              z: THREE.MathUtils.radToDeg(mesh.rotation.z)
            },
            scale: mesh.scale
          });
          this.moduleUpdateGuiValue(
            'cameraListText',
            JSON.stringify(this._defaultConfig.cameraList)
          );
          this._sstransformControl.attach(mesh);
        });
      } else {
        this._sstransformControl.attach(targetModel);
      }
    });
  }

  moduleCloseDebug() {
    this._event.removeEventListener(SSEvent.SSEventType.CLICK, this._eventAddMeshHandle);
    this._sstransformControl?.destory();
    this._sstransformControl = null;
  }
}
