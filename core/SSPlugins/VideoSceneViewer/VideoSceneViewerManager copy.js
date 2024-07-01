/*
 * Author  Kayson.Wan
 * Date  2023-06-01 14:35:19
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-07 15:53:44
 * Description
 */
import SSThreeJs from '../SSCore';
import SSLoader from '../SSLoader';
import SSDispose from '../SSDispose';
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

  /**
   * 根据配置文件初始化视频融合
   * @param {*} ssThreeJs new SSThreeJs()
   * @param {*} cameraData 配置数据
   * @param {*} openDebug 打开gui
   */
  constructor(ssThreeJs = new SSThreeJs(), cameraData = [], openDebug = false) {
    this.ssThreeJs = ssThreeJs;
    this.cameraData = cameraData;
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

    this.ssThreeJs.ssThreeObject.cancelRender();
  };

  /**
   * 2.0打开视频融合
   * @param {*} videoDataList [] 视频融合数据
   */
  openVideoFusion = (videoDataList = []) => {
    this.closeVideoFusion();
    this.#initVideoSceneViewer();
    this.videoSceneView.initialize(videoDataList); // 打开视频融合
  };

  /**
   * 2.0关闭视频融合
   */
  closeVideoFusion = () => {
    this.videoSceneView.clear();
    if (this.videoSceneView) {
      this.videoSceneView._mode = VideoSceneViewer.NORMAL;

      if (this.ssThreeJs?.ssThreeObject) {
        this.ssThreeJs.ssThreeObject.render();
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
      // todo
      this.openVideoFusion([icon.userData.data]);
      // this.videoSceneView.initialize([icon.userData.data]);//
      // 镜头位置
      const findConfig = this.cameraData.find(
        (item) => `视频融合${item.camera.name}` === icon.name
      );
      console.log('findConfig', findConfig);
      if (findConfig.eye) {
        this.ssThreeJs.ssThreeObject.setEye(findConfig.eye.position, findConfig.eye.target);
      }
    }
  };
}
