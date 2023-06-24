import * as THREE from 'three';
import ThreeJs, { ThreeEvent } from '../index';
import ThreeTool from '../SSTool';

export default class WatchLook {
  //
  #threeJs = new ThreeJs();

  // event listener
  #eventListener = null;

  // all camera mesh
  #allCameraMeshs = [];

  destory() {
    this.#allCameraMeshs = null;
    this.#threeJs = null;
    this.#eventListener = null;
  }

  /**
   * bind threejs
   */
  bindThreeJs = (aThreeJs) => {
    // this.#threeJs.destroy(false);
    this.#threeJs = null;
    this.#threeJs = aThreeJs;
  };

  /**
   * add camera
   */
  addCamera = (aList = [], aModelPath = '', aModelType = 'gltf') => {
    let promise = null;
    switch (aModelType) {
      case 'gltf':
        promise = this.#threeJs.loadGltf(aModelPath, false).then((res) => res.scene);
        break;
      case 'fbx':
        promise = this.#threeJs.loadFbx(aModelPath, false);
        break;
      default:
        break;
    }
    return promise?.then((model) => {
      if (!(model instanceof THREE.Object3D)) return null;
      const sxt001 = model.getObjectByName('sxt001');
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
      // const cubegeo = new THREE.ConeGeometry(0.6, cubeheight, 20, 1, true);
      const cylidergeo = new THREE.CylinderGeometry(0.2, 1.5, cubeheight, 4, 1, false);
      const cubeposition = new THREE.Vector3(0, 0, cubeheight / 2);
      const cubemesh = new THREE.Mesh(cylidergeo, cubematerial);
      cubemesh.visible = false;
      cubemesh.name = '_视椎';
      cubemesh.position.copy(cubeposition);
      cubemesh.rotation.x = THREE.MathUtils.degToRad(-90);
      cubemesh.rotation.y = THREE.MathUtils.degToRad(-45);
      sxt001.add(cubemesh);

      const group = new THREE.Group();
      group.name = '指哪看哪摄像头分组';
      this.#threeJs.threeScene.add(group);
      //
      aList.forEach((e, index) => {
        const newModel = index === 0 ? model : model.clone(true);
        newModel.position.set(e.position.x, e.position.y, e.position.z);
        newModel.name = e.name;
        group.add(newModel);
        // roate
        if (e.rotation) {
          newModel.rotation.set(
            THREE.MathUtils.degToRad(e.rotation.x),
            THREE.MathUtils.degToRad(e.rotation.y),
            THREE.MathUtils.degToRad(e.rotation.z)
          );
        }
        if (['yuntai', 'ball'].some((type) => e.type === type)) {
          this.#allCameraMeshs.push(newModel);
        }
      });
      return this.#allCameraMeshs;
    });
  };

  /**
   * add eye
   */
  addEye = (targetPoint = new THREE.Vector3()) => {
    let targetMesh = this.#threeJs.threeScene.getObjectByName('指哪看哪_eye');
    if (!targetMesh) {
      const texture = new THREE.TextureLoader().load(require('../assets/material_eye.png').default);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        // color: 'red',
        depthTest: true,
        side: THREE.DoubleSide,
        transparent: true
      });
      // const geomertry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const geomertry = new THREE.PlaneGeometry(0.1, 0.1);
      const mesh = new THREE.Mesh(geomertry, material);
      mesh.name = '指哪看哪_eye';
      const group = this.#threeJs.threeScene.getObjectByName('指哪看哪摄像头分组');
      group.add(mesh);
      targetMesh = mesh;
    }
    targetMesh.position.copy(targetPoint);
  };

  /**
   * compute target and camera angle
   */
  computeCameraAngle = (targetVecor, cameraMesh, cameraGroup) => {
    if (!(cameraMesh instanceof THREE.Object3D)) {
      return null;
    }
    if (!(cameraGroup instanceof THREE.Object3D)) {
      return null;
    }
    if (!(targetVecor instanceof THREE.Vector3)) {
      return null;
    }
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
      console.log(' cameraPlane targetPlane', cameraPlane, targetPlane, aPlane);
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
   */
  computeCameraAngle2 = (targetVecor, cameraMesh, cameraGroup) => {
    // 计算夹角
    const newcamworldpos = new THREE.Vector3();
    cameraMesh.getWorldPosition(newcamworldpos);
    // //方向箭头辅助类
    // var arrowFront = new THREE.ArrowHelper(camobj.children[3].getWorldDirection(), camobj.children[3].position, 30, 0xFF0000);
    // this.scene.add(arrowFront)
    // 求角度新方法
    // dz
    // 获取初始z轴朝向
    const dirz = cameraGroup.getWorldDirection();
    // var ang = this.modelToolJs.getAngle(camworldpos.toArray(), castobj.point.toArray(), [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    // 新算法
    // 开始点
    const originArr = newcamworldpos.toArray();
    // 目标点
    const targetArr = targetVecor.toArray();
    // 水平角
    let h = this.#getAngle_hori(originArr, targetArr, [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    // 竖直角
    let v = this.#getAngle2_yz_vert(originArr, targetArr, [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    if (Math.abs(h) > 45) {
      v = this.#getAngle2_xy_vert(originArr, targetArr, [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
    }
    // console.log(camobj.name, '{h::' + h, ' v::' + v + '}');
    // var camItem = new this._cameraAngleItem(camobj.name, h, v);
    // camAngleList.push(camItem);
    // if (camobj.name === 'cameraself01') {
    //   back = true;
    // }

    h = -h;
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
  #getAngle2_yz_vert = (origin = [], target = [], dy = [], dz = []) => {
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
    const look_yz = lookdir.sub(lookdircopy.projectOnVector(dxV3));
    let angle_v = look_yz.angleTo(dzV3);
    const dirv = dyV3.dot(look_yz) > 0 ? 1 : -1;
    angle_v = -THREE.Math.radToDeg(angle_v) * dirv;
    // console.log('俯仰角::', angle_v);
    return angle_v;
  };

  /**
   * 求竖直俯仰度 ——xy投影
   * @param {*} origin
   * @param {*} target
   * @param {*} dy
   * @param {*} dz
   * @returns
   */
  #getAngle2_xy_vert = (origin = [], target = [], dy = [], dz = []) => {
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
    const look_xy = lookdir.sub(lookdircopy.projectOnVector(dzV3));
    let angle_v = look_xy.angleTo(dxV3);
    // var dirv = dzV3.dot(look_xy) > 0 ? 1 : -1;
    // angle_v = -THREE.Math.radToDeg(angle_v) * dirv;
    angle_v = -THREE.Math.radToDeg(angle_v);
    // console.log('俯仰角::', angle_v) //绝对值-90
    const an = 90 - Math.abs(Math.abs(angle_v) - 90);
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
  #getAngle_hori = (origin = [], target = [], dy = [], dz = []) => {
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
    const look_xz = lookdir.sub(lookdircopy.projectOnVector(dyV3));
    let angle_h = look_xz.angleTo(dzV3);
    const dir = dxV3.dot(look_xz) > 0 ? 1 : -1;
    angle_h = -THREE.Math.radToDeg(angle_h) * dir;
    // console.log('水平角::', angle_h);
    return angle_h;
  };

  /**
   * start watchlook
   */
  start = (filterModelFunc = () => [], eachWatchComplete = () => {}) => {
    // open camera region
    this.#allCameraMeshs.forEach((e) => {
      if (!(e instanceof THREE.Object3D)) {
        return;
      }
      const obj = e.getObjectByName('_视椎');
      obj.visible = true;
    });
    //
    this.#eventListener = this.#threeJs.threeEvent.addEventListener(
      ThreeEvent.EventType.CLICK,
      (e) => {
        const models = this.#threeJs.getModelsByPoint({ x: e.clientX, y: e.clientY });
        const finalModels = filterModelFunc?.(models, e);
        if (finalModels.length === 0) return;
        const [model] = finalModels;
        const targetPoint = model.point;
        // 指向的目标点位
        this.addEye(targetPoint);

        // const parentObj = this.#threeJs.getGltfParObj(model.object);
        const parentObj = ThreeJs.getOriginMesh(model.object);
        console.log(' 指哪看哪检索到的物体 ', e, model, parentObj);

        const list = [];
        this.#allCameraMeshs.forEach((e) => {
          if (!(e instanceof THREE.Object3D)) {
            return;
          }

          const cameraMesh = e.getObjectByName('sxt001');
          // 固定mesh
          const fixMesh = e.getObjectByName('Box001');
          const angelObj = this.computeCameraAngle(targetPoint, cameraMesh, fixMesh);
          const angelObj2 = this.computeCameraAngle2(targetPoint, cameraMesh, fixMesh);
          const centerPositon = ThreeTool.getObjectCenter(cameraMesh);
          list.push({
            cameraName: e.name,
            rotate: angelObj2,
            rotate1: angelObj,
            distance: centerPositon.distanceTo(targetPoint)
          });
          // 初始点位
          const initalCameraLookAt = cameraMesh
            .getWorldDirection()
            .add(cameraMesh.getWorldPosition());
          this.#threeJs.useTweenAnimate(initalCameraLookAt.clone(), targetPoint.clone(), (e) => {
            cameraMesh.lookAt(e);
          });
        });

        eachWatchComplete?.({
          meshName: parentObj?.name,
          obj: model,
          objp: parentObj,
          cameras: list.sort((a, b) => a.distance - b.distance)
        });
      }
    );
  };

  /**
   * close watchlook
   */
  close = () => {
    this.#allCameraMeshs.forEach((e) => {
      if (!(e instanceof THREE.Object3D)) {
        return;
      }
      const obj = e.getObjectByName('_视椎');
      obj.visible = false;
    });
    this.#threeJs.threeEvent.removeEventListener(ThreeEvent.EventType.CLICK, this.#eventListener);
  };

  /**
   * camera move
   */
  moveCameraToTarget = (aMeshName = '', aTargetPoint = new THREE.Vector3()) => {
    const { threeScene } = this.#threeJs;
    if (!(threeScene instanceof THREE.Scene)) {
      return;
    }
    this.#allCameraMeshs.forEach((e) => {
      if (!(e instanceof THREE.Object3D)) {
        return;
      }
      const obj = e.getObjectByName('_视椎');
      obj.visible = false;
    });

    const object3d = this.#allCameraMeshs.find((item) => item.name === aMeshName);
    const shizhuiobj = object3d.getObjectByName('_视椎');
    shizhuiobj.visible = true;
    // 初始点位
    const cameraMesh = object3d.getObjectByName('sxt001');
    const initalCameraLookAt = cameraMesh.getWorldDirection().add(cameraMesh.getWorldPosition());
    this.#threeJs.useTweenAnimate(initalCameraLookAt.clone(), aTargetPoint.clone(), (e) => {
      cameraMesh.lookAt(e);
    });
  };
}
