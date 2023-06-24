/*
 * Author  Kayson.Wan
 * Date  2022-09-11 10:53:14
 * LastEditors  xie244135119
 * LastEditTime  2022-10-19 16:39:43
 * Description
 */
/* eslint-disable camelcase */
import TWEEN from '@tweenjs/tween.js';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { THREE } from '../index';

import cameraViewImg from './tietu.png';
import ThreeLoop from '../SSThreeLoop';
// import threeCameraModelConfig from '@/static/threeCameraModelConfig';
// let cameraModelPath = './cameraModel/sxt01.FBX';
const cameraModelPath = '/public/models/gltf/yuntai/sxt01.FBX';

/**
 * 指哪看哪
 * 初始化功能需要的资源:
 * 1.相机模型文件路径 cameraModelPath
 * 2.cameraViewImg 可视域视锥贴图文件 cameraViewImg
 * 3.生成的相机属性配置文件 threeCameraModelConfig
 */
class WhichLook {
  _threeJs = null;

  constructor(threeJs) {
    this._threeJs = threeJs;
  }

  // 树形结构类
  // _threeJs = new ThreeJs();
  _frameHandle = null;

  /* 原始摄像头Obj */
  _oriModelCamera = null;

  /* 原始摄像头视锥 {cone1,axes} 包含两个几何体，视锥geo，axes轴向 */
  _oriCameraView = null;

  /* 相机对象列表 */
  _camerasList = [];

  // 相机飞行点
  mouseCircle = [];

  /**
   * 外-初始化实例化模型
   * @param {*} cameraModelList 模型相机配置列表 外传
   * @returns 相机模型对象列表
   */
  initCameraModels = (cameraModelList) => {
    this._camerasList = [];
    this.mouseCircle = [];

    /* 加载一个相机 */
    this._loadOneCamera((cam) => {
      // {cam,viewObj}
      cam.visible = false;
      this._oriModelCamera = cam;
      // 加载一个视锥对象{cone1,axes}
      this._initCameraIrradiation(
        this._oriModelCamera,
        '可视域视锥体',
        new THREE.Vector3(0, 0, 0),
        10,
        (viewObj) => {
          this._oriCameraView = viewObj; // {cone1,axes}
          /* 根据配置文件初始化生成所有的摄像头  （位置，旋转） */
          this._instanceCameraModel(cameraModelList);
          /* 初始化辅助图标 */
          // this.initFuZhuImg();
        }
      );
    });
    // 创建飞行点
    this._initCircle();
    return this._camerasList;
  };

  /**
   * 外-指哪看哪
   * @param {点击的物体}} castobj
   * @param {是否飞行} isFlyTo
   * @param {boolean} back 是否反着计算
   */
  WhichLook = (castobj, back = false, isFlyTo = false) => {
    // //筛选掉可视域视锥体mesh
    // models = models.filter((item) => {
    //   return item.object.name != '可视域视锥体' && item.object.visible == true;
    // });
    // // 观测目标
    // let castobj = models[0];
    /* 相机角度对象数组 */
    let camAngleList = [];
    /* 能够移动的相机的iplist */
    const moveCamIpList = [];
    /* 移动的相机进行描边 */
    const outlineList = [];
    // 是否相机飞行
    if (isFlyTo) {
      this.flyTo(castobj.point);
    }
    this._camerasList.forEach((cam) => {
      // 筛选有用摄像头
      // if (cam.camName == 'sxt_192.168.1.38')
      const camobj = cam.camObj;
      if (cam.viewObj.children[3].visible) {
        cam.viewObj.children[3].visible = false; // 关闭所有可视域视锥体
      }
      // 观测点位置
      const campos = new THREE.Vector3(camobj.position.x, camobj.position.y, camobj.position.z);
      let objs = this._rayCastObjs(campos, castobj.point);
      // 辅助射线------
      // const points = [campos, castobj.point];
      // const material = new THREE.LineBasicMaterial({ color: 0x00c8be, linewidth: 10 });
      // const geometry = new THREE.BufferGeometry().setFromPoints(points);
      // const line = new THREE.Line(geometry, material);
      // this._threeJs.threeScene.add(line);
      // 筛选掉可视域视锥体mesh和自己
      objs = objs.filter(
        (item) =>
          item.object.name !== '可视域视锥体' &&
          item.object.name !== 'Box001' &&
          item.object.name !== 'Box002' &&
          item.object.name !== 'Object001' &&
          item.object.name !== 'Object002' &&
          item.object.name !== 'Object003' &&
          item.object.type !== 'CameraHelper' &&
          item.object.name !== camobj.name
      );
      // 第一个射线选中的物体
      // console.log('穿过点物体', camobj.name, objs);
      const firstObj = objs[0].object;
      // console.log('--', firstObj.name, castobj.object.name);
      if (firstObj.name === castobj.object.name) {
        moveCamIpList.push(cam.camName);
        // console.log('camobj', camobj)
        // 队形的相机看向指定位置
        // camobj.children[3].lookAt(castobj.point);
        outlineList.push(camobj);
        // --------摄像头缓动转向效果
        const camview = camobj.children[3];
        if (!cam.viewObj.children[3].visible) {
          cam.viewObj.children[3].visible = true; // 打开有用的可视域视锥体
        }
        // 相机和看向点的距离
        const camworldpos = new THREE.Vector3();
        camobj.getWorldPosition(camworldpos);
        const distance = camworldpos.distanceTo(castobj.point);
        // console.log(camobj.name, distance);
        const startRotation = new THREE.Euler().copy(camview.rotation);
        const startRotation1 = { x: startRotation.x, y: startRotation.y, z: startRotation.z };
        camview.lookAt(castobj.point);

        const endRotation = new THREE.Euler().copy(camview.rotation);
        const endRotation1 = { x: endRotation.x, y: endRotation.y, z: endRotation.z };
        // revert to original rotation
        camview.rotation.copy(startRotation);
        // 动画
        this._useTweenAnimate(
          startRotation1,
          endRotation1,
          (e) => {
            camview.rotation.x = e.x;
            camview.rotation.y = e.y;
            camview.rotation.z = e.z;
          },
          0.5,
          () => {
            // console.log('complate');
          }
        );

        // 计算夹角
        const newcamworldpos = new THREE.Vector3();
        camobj.children[3].getWorldPosition(newcamworldpos);
        // //方向箭头辅助类
        // var arrowFront = new THREE.ArrowHelper(camobj.children[3].getWorldDirection(), camobj.children[3].position, 30, 0xFF0000);
        // this.scene.add(arrowFront)
        // 求角度新方法
        // dz
        const dirz = cam.oriDirz;
        // var ang = this.modelToolJs.getAngle(camworldpos.toArray(), castobj.point.toArray(), [0, 1, 0], [dirz.x, dirz.y, dirz.z]);
        // 新算法
        // 开始点
        const originArr = newcamworldpos.toArray();
        // 目标点
        const targetArr = castobj.point.toArray();
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

        if (back || camobj.name === 'cameraself01') {
          v = -v;
          v = v < 0 ? 0 : v;
          // {
          camAngleList.push({
            nameEn: camobj.name,
            heading: h,
            pitch: v,
            distance
          });
          // }
        } else {
          h = -h;
          v = v < 0 ? 0 : v;
          camAngleList.push({
            nameEn: camobj.name,
            heading: h,
            pitch: v,
            distance
          });
        }
      }
    });
    // 根据距离排序
    camAngleList.sort((a, b) => a.distance - b.distance);
    // 删除距离属性
    camAngleList = camAngleList.map((e) => {
      delete e.distance;
      return e;
    });
    return camAngleList;
  };

  /**
   * 指哪看哪(简易版) -> 仅摄像机列表看向目标点
   * @param {相机模型列表} cameraObjList 相机模型列表
   * @param {target} target Vector3看向的目标点
   */
  WhichLook2 = (cameraObjList, target) => {
    for (let i = 0; i < cameraObjList.length; i++) {
      const cam = cameraObjList[i];
      const cameraObj = cam.children[3];
      if (!cameraObj.children[3].visible) {
        cameraObj.children[3].visible = true; // 打开有用的可视域视锥体
      }
      const startRotation = new THREE.Euler().copy(cameraObj.rotation);
      const startRotation1 = { x: startRotation.x, y: startRotation.y, z: startRotation.z };
      cameraObj.lookAt(target);
      const endRotation = new THREE.Euler().copy(cameraObj.rotation);
      const endRotation1 = { x: endRotation.x, y: endRotation.y, z: endRotation.z };
      cameraObj.rotation.copy(startRotation);
      this._useTweenAnimate(
        startRotation1,
        endRotation1,
        (e) => {
          cameraObj.rotation.x = e.x;
          cameraObj.rotation.y = e.y;
          cameraObj.rotation.z = e.z;
        },
        0.5
      );
    }
  };

  /**
   * 关闭指哪看哪
   */
  close = () => {
    if (this._camerasList.length > 0) {
      // console.log('this._camerasList', this._camerasList);
      this._camerasList.forEach((cam) => {
        if (cam.viewObj) {
          if (cam.viewObj.children[3]) {
            if (cam.viewObj.children[3].visible) {
              cam.viewObj.children[3].visible = false; // 关闭所有可视域视锥体
            }
          }
        }
      });
    }
  };

  /**
    * 相机model item 对象
    * @param {相机名称} camName sxt_ip
    * @param {总的相机obj} camObj 总的相机obj
    // * @param {相机图标} icon 相机图标
    * @param {可视域视锥体} viewObj 子摄像头 obj.children[3]:可视域视锥体
    * @param {初始矩阵} orimatrix 初始矩阵
    * @param {初始z轴朝向} oriDirz 初始z轴朝向 object.matrix
    */
  _cameraItemCtrl(camName, camObj, viewObj, orimatrix, oriDirz) {
    this.camName = camName;
    this.camObj = camObj;
    // this.icon = icon;
    this.viewObj = viewObj;
    this.orimatrix = orimatrix;
    this.oriDirz = oriDirz;
  }

  /* 加载原生相机模型，后续复制 */
  _loadOneCamera = (cb) => {
    // 加载一个相机
    // this._loadFBX('/public/models/patrolPoint/cameraModel/sxt01.FBX', 'camName', (cam) => {
    this._loadFBX(cameraModelPath, 'camName', (cam) => {
      // cb?.(cam);
      this._threeJs.threeScene.add(cam);
      cb?.(cam);
    });
    // this.modelToolJs._loadFBX(this, '/public/three/models/fbx/fbx/sxt01.FBX', 'camName', new Vector3(0, 0, 0),
    //   new Vector3(0, 0, 0), 1, function (cam) {
    //     cb?.(cam);
    //   });
  };
  /**
   * 初始化相机子物体云台的照射区域 （父相机，旋转角度，视野绘制长度（一经创建不能修改））
   * @param {相机} par
   * @param {相机名称} camName '可视域视锥体'
   * @param {旋转} rota
   * @param {区域长度} length
   * @param {回调} cb { cone1, axes }
   */

  _AnimOffset = null;

  _initCameraIrradiation = (par, camName, rota, length = 10, cb = () => {}) => {
    let cone1 = null;

    // 创建摄像头照射绘制区域
    const ylj = cameraViewImg;

    const loader = new THREE.TextureLoader();
    loader.load(ylj, (texture) => {
      // var geometry = new THREE.ConeBufferGeometry(8, 40, 7);  "#99CCFF"
      const geometry = new THREE.ConeBufferGeometry(3, length, 7, 1, true); // openEnded — 一个Boolean值，指明该圆锥的底面是开放的还是封顶的
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: '#99CCFF',
        opacity: 1,
        transparent: true,
        depthTest: false
      });
      material.map.wrapS = THREE.RepeatWrapping;
      material.map.wrapT = THREE.RepeatWrapping;
      // 照射区域
      cone1 = new THREE.Mesh(geometry, material);

      cone1.wrapT = THREE.RepeatWrapping;
      cone1.wrapS = cone1.wrapT;
      cone1.needsUpdate = true;

      //  cone1.material.map.repeat.y =10;
      cone1.name = camName;
      // console.log('cone1', cone1);
      // cone1.name = '可视域视锥体';
      cone1.position.set(par.position.x, par.position.y, par.position.z);
      const axes = new THREE.AxesHelper(0); // 坐标轴辅助类
      axes.name = camName;
      axes.position.set(cone1.position.x, cone1.position.y + length / 2, cone1.position.z);
      axes.attach(cone1);
      axes.position.set(par.position.x, par.position.y, par.position.z);
      axes.rotateX(((-90 + rota.x) * Math.PI) / 180); // 绕x轴旋转
      axes.rotateZ(((-90 + rota.y) * Math.PI) / 180);
      axes.rotateY((rota.y * Math.PI) / 180);
      this._threeJs?.threeScene?.add(axes);
      par.children[3].attach(axes);
      axes.visible = false; // 默认隐藏可视域视锥体==
      cb?.({ cone1, axes });

      // 测试辅助类
      const axeshelper = new THREE.AxesHelper(0); // 坐标轴辅助类
      axeshelper.position.set(par.position.x, par.position.y, par.position.z);
      axeshelper.rotation.set(par.rotation.x, par.rotation.y, par.rotation.z);
      this._threeJs.threeScene.add(axeshelper);
    });
  };

  /**
   * 动画移除
   */
  removeAnimObj = () => {
    window.cancelAnimationFrame(this._AnimOffset);
    console.log('动画移除');
  };

  /**
   *  从配置文件获取实例化相机model 的ip，位置，旋转，是否显示
   * */
  _instanceCameraModel = (cameraModelList = []) => {
    /* 从配置文件获取实例化相机model 的ip，位置，旋转，是否显示 */
    // for (let i = 0; i < threeCameraModelConfig.cameraModelMsgMap.length; i++) {
    //   const camModel = threeCameraModelConfig.cameraModelMsgMap[i];
    for (let i = 0; i < cameraModelList.length; i++) {
      const camModel = cameraModelList[i];
      const camName = camModel.name; // 相机名称
      const pos = camModel.position; // 相机位置
      const rota = camModel.rotation; // 相机旋转
      // var _visible = camModel.visible;

      // new 一个相机
      const newCam = this._oriModelCamera.clone();
      newCam.visible = true;
      newCam.name = camName;
      newCam.position.set(pos.x, pos.y, pos.z);
      newCam.rotation.set(
        (rota.x * Math.PI) / 180,
        (rota.y * Math.PI) / 180,
        (rota.z * Math.PI) / 180
      );
      newCam.scale.x = 1;
      newCam.scale.y = 1;
      newCam.scale.z = 1;
      /* 初始化摄像机图标 */
      // var img = _this.modelToolJs.loadImg(_this, '/public/three/img/摄像头.png', camName, new Vector3(pos.x, 8, pos.z), 0.15)
      // new 一个可视域视锥体
      // var newViewObj = this._oriCameraView.clone();
      const cone1 = this._oriCameraView.cone1.clone();
      const axes = this._oriCameraView.axes.clone();
      cone1.name = camName;
      cone1.position.set(newCam.position.x, newCam.position.y, newCam.position.z);
      axes.name = camName;
      axes.position.set(newCam.position.x, newCam.position.y, newCam.position.z);
      axes.rotateX(((-90 + rota.x) * Math.PI) / 180); // 绕x轴旋转
      axes.rotateZ(((-90 + rota.y) * Math.PI) / 180);
      axes.rotateY((rota.y * Math.PI) / 180);
      //---------------
      /* 初始化相机的照射区域 */
      // par._initCameraIrradiation(newCam, camName, rota);
      newCam.visible = true;
      // 获取初始z轴朝向
      const dirz = new THREE.Vector3();
      newCam.children[3].getWorldDirection(dirz);
      /* 单个相机对象 */
      const camItem = new this._cameraItemCtrl(
        camName,
        newCam,
        newCam.children[3],
        newCam.children[3].matrix,
        dirz.normalize()
      );
      this._camerasList.push(camItem);
      this._threeJs.threeScene.add(newCam);
    }
  };

  _loadFBX = (path = '', name = 'fbxModel', cb = () => {}) => {
    // 加载fbx 摄像机model
    // this.scene = _this.scene;
    const loader = new FBXLoader();
    loader.load(path, (obj) => {
      obj.name = name;
      cb?.(obj);
    });
  };

  /**
   * 相机飞行
   * @param {点击的物体} castobj
   */
  // flyTo = (castobj) => {
  flyTo = (castPos) => {
    this.mouseCircle.position.set(castPos.x, castPos.y, castPos.z);
    const curpos = this.mouseCircle.position;
    const startPos = {
      camera_x: this._threeJs.threeCamera.position.x,
      camera_y: this._threeJs.threeCamera.position.y,
      camera_z: this._threeJs.threeCamera.position.z,
      orbitControl_x: this._threeJs.threeOrbitControl.target.x,
      orbitControl_y: this._threeJs.threeOrbitControl.target.y,
      orbitControl_z: this._threeJs.threeOrbitControl.target.z
    };
    const endPos = {
      camera_x: curpos.x + 2,
      camera_y: curpos.y + 2,
      camera_z: curpos.z,
      orbitControl_x: curpos.x,
      orbitControl_y: curpos.y,
      orbitControl_z: curpos.z
    };
    this._threeJs._useTweenAnimate(
      startPos,
      endPos,
      (e) => {
        this._threeJs.threeCamera.position.set(e.camera_x, e.camera_y, e.camera_z);
        this._threeJs.threeOrbitControl.target.set(
          e.orbitControl_x,
          e.orbitControl_y,
          e.orbitControl_z
        );
        this._threeJs.threeOrbitControl.update();
      },
      0.5
    );
  };

  /**
   * 获取射线穿过的所有物体
   * @param {this} _this
   * @param {摄像机model模型位置} campos
   * @param {点击位置} clickpos
   * @returns 返回看中的第一个物体
   */
  _rayCastObjs = (campos, clickpos) => {
    const dir = new THREE.Vector3(
      clickpos.x - campos.x,
      clickpos.y - campos.y,
      clickpos.z - campos.z
    );
    const rayCaster = new THREE.Raycaster(campos, dir.normalize(), 0, 1000);
    rayCaster.camera = this._threeJs.threeCamera; /* 很重要，加上 */
    const objs = rayCaster.intersectObjects(this._threeJs.threeScene.children, true);
    return objs;
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
    const look_xz = lookdir.sub(lookdircopy.projectOnVector(dyV3));
    let angle_h = look_xz.angleTo(dzV3);
    const dir = dxV3.dot(look_xz) > 0 ? 1 : -1;
    angle_h = -THREE.Math.radToDeg(angle_h) * dir;
    // console.log('水平角::', angle_h);
    return angle_h;
  };

  /* 相机角度Item */
  _cameraAngleItem = (ip, heading, pitch) => {
    this.ip = ip;
    this.heading = heading;
    this.pitch = pitch;
  };

  // 相机飞行
  _initCircle = () => {
    this.mouseCircle = new THREE.AxesHelper(0);
    this.mouseCircle.name = '可视域视锥体';
    this._threeJs.threeScene.add(this.mouseCircle);
  };

  /**
   * 使用tween动画 制作爆炸效果
   */
  _useTweenAnimate = (
    aStartPoint = {},
    aEndPoint = {},
    onUpdate = () => {},
    speed = 1,
    onComplete = () => {}
  ) => {
    const tweenAnimate = new TWEEN.Tween(aStartPoint);
    tweenAnimate.to(aEndPoint, speed * 1000);
    tweenAnimate.onUpdate(onUpdate);
    tweenAnimate.onStop(() => {
      // tweenAnimate.stop();
      // TWEEN.remove(tweenAnimate);
      // window.cancelAnimationFrame(this._tweenAnimateFrame);
      ThreeLoop.removeId(this._tweenAnimateFrame);
    });
    tweenAnimate.onComplete(() => {
      // tweenAnimate.stop();
      // TWEEN.remove(tweenAnimate);
      // window.cancelAnimationFrame(this._tweenAnimateFrame);
      ThreeLoop.removeId(this._tweenAnimateFrame);
      onComplete();
    });
    tweenAnimate.easing(TWEEN.Easing.Linear.None);
    tweenAnimate.start();

    this._tweenAnimateFrame = ThreeLoop.add(() => {
      // if (tweenAnimate.isPlaying()) {
      TWEEN.update();
      // }
    }, 'whicklook render');
  };
}
export default WhichLook;
