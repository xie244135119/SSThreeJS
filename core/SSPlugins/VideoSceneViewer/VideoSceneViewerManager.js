/*
 * Author  Kayson.Wan
 * Date  2023-06-01 14:35:19
 * LastEditors  Kayson.Wan
 * LastEditTime  2026-07-30 17:36:50
 * Description
 */
import * as THREE from 'three';
import SSThreeJs from '../../SSCore';
import SSLoader from '../../SSLoader';
import SSDispose from '../../SSDispose';
import SSThreeLoop from '../../SSThreeLoop.ts';
import { VideoSceneViewer } from './VideoSceneViewer';

export default class VideoSceneViewerManager {
  /**
   * @type VideoSceneViewer
   */
  videoSceneView = null;

  /**
   * 融合投射过滤的物体列表
   */
  ignoreObjectList = [];

  cameraData = [];

  // 视频融合相机列表
  _videoViewerCameraDataList = [];

  // 视频融合icon列表
  _videoViewerCameraIconList = [];

  // 视频融合icon
  _cameraViewIcon = null;

  /**
   * @type SSThreeJs
   */
  ssThreeJs = null;

  defaultConfig = [
    {
      visible: true,
      camera: {
        name: '视频融合_test',
        fov: 27,
        aspect: 1,
        near: 0.1,
        far: 164,
        position: { x: 0.7180480205018174, y: 1.2705360638579253, z: 2.052677400678885 },
        rotation: { x: -0.6313513526773442, y: 0.20934010887576412, z: 0.1507975959985109 },
        target: { x: 0, y: 0, z: 0 }
      },
      // video: { poster: '', stream: '' },
      video: { poster: '../../assets/default_ground1.png', stream: '' },
      eye: {
        position: { x: -22.26714020755176, y: 96.87804310841558, z: -144.87257420359424 },
        target: { x: -21.692831852230174, y: 96.54080558055747, z: -93.53923082919695 }
      }
    }
  ];

  /**
   * 根据配置文件初始化视频融合
   * @param {*} ssThreeJs new SSThreeJs()
   * @param {*} cameraData 配置数据
   * @param {*} openDebug 打开gui
   */
  constructor(ssThreeJs = new SSThreeJs(), cameraData = [], openDebug = false) {
    this.ssThreeJs = ssThreeJs;
    this.cameraData = cameraData || this.defaultConfig;
    this.videoSceneView = new VideoSceneViewer({
      scene: this.ssThreeJs.ssThreeObject.threeScene,
      camera: this.ssThreeJs.ssThreeObject.threeCamera,
      renderer: this.ssThreeJs.ssThreeObject.threeRenderer,
      orbitControl: this.ssThreeJs.ssThreeObject.threeOrbitControl,
      camerasData: cameraData,
      openDebug
    });
    // this.createIcons(cameraData);
  }

  // 2.0初始化视频融合
  #initVideoSceneViewer = () => {
    if (!this.videoSceneView) {
      this.videoSceneView = new VideoSceneViewer({
        scene: this.ssThreeJs.ssThreeObject.threeScene,
        camera: this.ssThreeJs.ssThreeObject.threeCamera,
        renderer: this.ssThreeJs.ssThreeObject.threeRenderer,
        orbitControl: this.ssThreeJs.ssThreeObject.threeOrbitControl,
        openDebug: false
      });
    }
    this.videoSceneView._mode = VideoSceneViewer.FUSION;
    // this.videoSceneView.initialize([camdata]); // 打开视频融合
    this.videoSceneView.ignoreObjectList = this.ignoreObjectList;

    this.ssThreeJs.ssThreeObject.cancelRenderLoop();
  };

  /**
   * 2.0打开视频融合
   * @param {*} videoDataList [] 视频融合数据
   */
  openVideoFusion = (videoDataList = []) => {
    // 先做轻量关闭（停动画、清相机、复位渲染器），再重建。
    // 不在此释放 render step——initialize() 内部会先 _disposeRenderSteps 再重建，避免与 animate 的排程冲突。
    this.closeVideoFusion();
    this.#initVideoSceneViewer();
    this.videoSceneView.initialize(videoDataList); // 打开视频融合
    // 修复【开启后画面不动 / 无视频投射】：closeVideoFusion 里 stopAnimate 取消了融合的 rAF，
    // 这里重建后必须重新启动 animate()，否则融合渲染循环已停，画面不刷新、鼠标拖动也无响应。
    this.videoSceneView.animate();
  };

  /**
   * 设置某路视频可见性（实时切换，不重建 shader）。
   * @param cameraName 相机名
   * @param visible true=显示，false=隐藏
   */
  setCameraVisible = (cameraName, visible) => {
    const vsv = this.videoSceneView;
    if (!vsv) return;
    const cam = vsv.cameras.find((c) => c?.camera?.name === cameraName);
    if (!cam) return;
    cam.visible = visible;
    vsv.updateCameraData?.();
  };

  /**
   * "只看此路"：隐藏其它所有路，只显示指定相机；传 null 则全部显示。
   * @param cameraName 相机名，null/undefined 取消隔离（全部显示）
   */
  isolateCamera = (cameraName) => {
    const vsv = this.videoSceneView;
    if (!vsv) return;
    vsv.cameras.forEach((c) => {
      c.visible = cameraName ? c.camera?.name === cameraName : true;
    });
    vsv.updateCameraData?.();
  };

  /**
   * 2.0关闭视频融合
   */
  closeVideoFusion = () => {
    if (!this.videoSceneView) return;
    const vsv = this.videoSceneView;
    // 先停动画，确保没有 rAF 排程在访问 render step，之后才能安全 dispose
    vsv.clear();
    vsv.stopAnimate?.();
    vsv._mode = VideoSceneViewer.NORMAL;
    // 释放当前一套 render step（composer/RT/material）：close 时停了 rAF，可安全 dispose，
    // 不再等到下次 open 的 initialize 才释放——避免关闭后 render step 仍占显存直至再次开启。
    vsv._disposeRenderSteps?.();

    if (this.ssThreeJs?.ssThreeObject) {
      // 复位渲染器：融合期间 EffectComposer 把当前 render target / 状态改到了离屏缓冲，
      // 关闭后若不 setRenderTarget(null) + resetState()，恢复渲染时可能残留在
      // 已释放/错误的 target 上，表现为关闭后画面卡住不刷新。
      try {
        const renderer = this.ssThreeJs.ssThreeObject.threeRenderer;
        renderer.setRenderTarget(null);
        renderer.resetState();
      } catch (e) {}
      // 恢复渲染循环：openVideoFusion/#initVideoSceneViewer 里 cancelRenderLoop() 停掉了
      // 'webglrender update'，关闭后须恢复一个驱动画面的循环，否则画面定格、鼠标拖拽
      // (OrbitControl.update 在循环里)无响应 -> 表现为卡死。
      // 但若已启用 PostProcessPlugin，它用 'SSPostProcessPlugin Render'(effectComposer.render)
      // 接管上屏，此时不能再 renderLoop()(renderer.render 直渲屏幕)，否则两个 render 抢屏闪烁。
      const hasPostProcessLoop = SSThreeLoop.renderLoopList?.some(
        (item) => item.uuid === 'SSPostProcessPlugin Render'
      );
      if (hasPostProcessLoop) {
        // PostProcess 在用：它的循环本就在跑，无需另起主循环，只渲染一帧立即生效
        this.ssThreeJs.ssThreeObject.renderOnce();
      } else {
        // 无 PostProcess：恢复主渲染循环 renderer.render
        this.ssThreeJs.ssThreeObject.renderLoop();
      }
    }
    // 关闭按钮
    if (this._videoViewerCameraIconList.length > 0) {
      this._videoViewerCameraIconList.forEach((icon) => {
        this.ssThreeJs.ssThreeObject.threeScene.remove(icon);
        // SSDispose.dispose(icon);
      });
      this._videoViewerCameraIconList = [];
    }
  };

  /**
   * 销毁管理器：随 OverViewModel.destroy 调用，彻底释放融合渲染资源。
   */
  destroy = () => {
    this.closeVideoFusion();
    this.videoSceneView?.destroy?.();
    this.videoSceneView = null;
  };

  /**
   * 根据数据创建icons
   * @param {*} cameraData []视频融合数据
   * @param {*} imgPath icon图片跟径
   */
  createIcons = (cameraData, imgPath = './public/threeTextures/cameraIcon.png') => {
    this._videoViewerCameraIconList = [];
    // icon
    const addIcon = () => {
      cameraData.forEach((camera) => {
        const icon = this._cameraViewIcon.clone();
        icon.userData.data = camera;
        icon.name = `视频融合${camera.camera.name}`;
        console.log(icon.name);
        icon.position.copy(camera.camera.position);
        icon.position.y += 1;
        this.ssThreeJs.ssThreeObject.threeScene.add(icon);
        this._videoViewerCameraIconList.push(icon);
      });
      this._videoViewerCameraDataList = cameraData;
    };
    if (!this._cameraViewIcon) {
      SSLoader.loadSprite(imgPath).then((sprite) => {
        sprite.userData = { type: 'viewCamera', data: {} };
        this._cameraViewIcon = sprite;
        addIcon();
      });
    } else {
      addIcon();
    }
  };

  /**
   * 射线检测，鼠标点击icon，触发视频融合
   * @param {*} models
   */
  onClickIcons = (models) => {
    const clickIconData = models.filter(
      (item) => item.object.type === 'Sprite' && item.object.userData.type === 'viewCamera'
    );
    // 点击了icon
    if (clickIconData?.length > 0) {
      const icon = clickIconData[0].object;
      console.log('icon', icon);
      const data = icon.userData.data;
      // todo
      this.openVideoFusion([data]);
      // 镜头位置：根据相机 position+rotation 自动算正前方注视点，不再依赖配置里的 eye
      if (data?.camera?.name) {
        this.focusCamera(data.camera.name);
      }
    }
  };

  /**
   * 根据融合相机的 position + rotation 计算其正前方注视点。
   * 相机默认朝 -Z，用欧拉角把 (0,0,-1) 旋转到相机朝向，乘以距离加到 position 即得 target。
   * 不再依赖配置里的 eye.target，避免占位/错误的 eye.target 把视角带偏。
   * @param camItem { camera: { position, rotation } }
   * @param distance 注视点距相机的距离，默认 20
   * @returns {{position:THREE.Vector3, target:THREE.Vector3}}
   */
  _calcEyeFromCamera = (camItem, distance = 20) => {
    const c = camItem.camera;
    const pos = new THREE.Vector3(c.position.x, c.position.y, c.position.z);
    const euler = new THREE.Euler(
      c.rotation?.x || 0,
      c.rotation?.y || 0,
      c.rotation?.z || 0,
      c.rotation?.order || 'XYZ'
    );
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    const target = pos.clone().add(forward.multiplyScalar(distance));
    return { position: pos, target };
  };

  /**
   * 将视角飞到指定名称的融合相机观测视角。
   * 始终根据 camera.position + camera.rotation 自动计算正前方注视点（不依赖配置里的 eye.target）。
   * 若配置了 eye.position 则用它作起点覆盖相机位置，否则用相机自身 position。
   * @param cameraName 融合相机名称（videoDataList[].camera.name）
   * @param distance 自动计算 target 时距相机的距离，默认 20
   */
  focusCamera = (cameraName, distance = 20) => {
    const ssObj = this.ssThreeJs?.ssThreeObject;
    if (!ssObj) return;
    // 优先从当前实际开启的融合相机里找（openVideoFusion 可能只传了部分路），
    // 找不到再回退到构造时的完整 cameraData。这样"只开此路"场景下也能命中。
    const openedVC = this.videoSceneView?.cameras?.find((vc) => vc?.camera?.name === cameraName);
    const camData = this.cameraData.find((item) => item.camera?.name === cameraName);
    if (!openedVC && !camData) {
      console.warn(`【视角】未找到相机 ${cameraName}`);
      return;
    }
    // 实际开启的 VideoCamera 优先（position/rotation 是当前真实值，含 GUI 拖拽后的状态）
    const pos =
      openedVC?.camera?.position || camData?.camera?.position || new THREE.Vector3(0, 0, 0);
    const rot = openedVC?.camera?.rotation || camData?.camera?.rotation || { x: 0, y: 0, z: 0 };
    const eyePos = camData?.eye?.position;
    // 用四元数从 (0,0,-1) 求朝向，兼容 rot 是 Euler（VideoCamera）或 {x,y,z}（config 数据）
    const euler = new THREE.Euler(rot.x || 0, rot.y || 0, rot.z || 0, (rot && rot.order) || 'XYZ');
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    const posVec = eyePos
      ? new THREE.Vector3(eyePos.x, eyePos.y, eyePos.z)
      : new THREE.Vector3(pos.x, pos.y, pos.z);
    const target = posVec.clone().add(forward.multiplyScalar(distance));
    ssObj.setEye(posVec, target, true, 0.8);
  };
}
