/*
 * Author  Kayson.Wan
 * Date  2023-06-01 14:35:19
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-07 15:53:44
 * Description
 */
import SSLoader from '../SSLoader';
import SSDispose from '../SSDispose';
import { VideoSceneViewer } from './VideoSceneViewer';
import SSModuleInterface from '../SSModule/module.interface';
// import SSThreeJs from '../SSCore';

export default class VideoSceneViewerManager extends SSModuleInterface {
  title = '视频融合';

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
      video: { poster: '../../../core/assets/default_ground1.png', stream: '' },
      eye: {
        position: { x: -22.26714020755176, y: 96.87804310841558, z: -144.87257420359424 },
        target: { x: -21.692831852230174, y: 96.54080558055747, z: -93.53923082919695 }
      }
    }
  ];

  // /**
  //  * 根据配置文件初始化视频融合
  //  * @param {*} ssThreeJs new SSThreeJs()
  //  * @param {*} cameraData 配置数据
  //  * @param {*} openDebug 打开gui
  //  */
  // constructor(ssThreeJs = new SSThreeJs(), cameraData = [], openDebug = false) {
  //   this.ssThreeJs = ssThreeJs;
  //   this.cameraData = cameraData;
  //   this.videoSceneView = new VideoSceneViewer({
  //     scene: this.ssthreeObject.threeScene,
  //     camera: this.ssthreeObject.threeCamera,
  //     renderer: this.ssthreeObject.threeRenderer,
  //     orbitControl: this.ssthreeObject.threeOrbitControl,
  //     camerasData: cameraData,
  //     openDebug
  //   });
  //   // this.createIcons(cameraData);
  // }

  // 2.0初始化视频融合
  #initVideoSceneViewer = () => {
    if (!this.videoSceneView) {
      this.videoSceneView = new VideoSceneViewer({
        scene: this.ssthreeObject.threeScene,
        camera: this.ssthreeObject.threeCamera,
        renderer: this.ssthreeObject.threeRenderer,
        orbitControl: this.ssthreeObject.threeOrbitControl,
        openDebug: false
      });
    }
    this.videoSceneView._mode = VideoSceneViewer.FUSION;
    // this.videoSceneView.initialize([camdata]); // 打开视频融合
    this.videoSceneView.ignoreObjectList = this.ignoreObjectList;

    console.log(' this.ssthreeObject', this.ssthreeObject);
    // this.ssthreeObject.cancelRender();
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
    if (!this.videoSceneView) return;
    this.videoSceneView.clear();
    if (this.videoSceneView) {
      this.videoSceneView._mode = VideoSceneViewer.NORMAL;

      if (this.ssthreeObject) {
        this.ssthreeObject.render();
      }
    }
    // 关闭按钮
    if (this._videoViewerCameraIconList.length > 0) {
      this._videoViewerCameraIconList.forEach((icon) => {
        this.ssthreeObject.threeScene.remove(icon);
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
        this.ssthreeObject.threeScene.add(icon);
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

  // /**
  //  * 射线检测，鼠标点击icon，触发视频融合
  //  * @param {*} models
  //  */
  // onClickIcons = (models) => {
  //   const clickIconData = models.filter(
  //     (item) => item.object.type === 'Sprite' && item.object.userData.type === 'viewCamera'
  //   );
  //   // 点击了icon
  //   if (clickIconData?.length > 0) {
  //     const icon = clickIconData[0].object;
  //     console.log('icon', icon);
  //     // todo
  //     this.openVideoFusion([icon.userData.data]);
  //     // this.videoSceneView.initialize([icon.userData.data]);//
  //     // 镜头位置
  //     const findConfig = this.cameraData.find(
  //       (item) => `视频融合${item.camera.name}` === icon.name
  //     );
  //     console.log('findConfig', findConfig);
  //     if (findConfig.eye) {
  //       this.ssThreeJs.setModelPosition(findConfig.eye.position, findConfig.eye.target, true);
  //     }
  //   }
  // };

  _setConfigValue = () => {
    if (!this.videoSceneView) {
      this.videoSceneView = new VideoSceneViewer({
        scene: this.ssthreeObject.threeScene,
        camera: this.ssthreeObject.threeCamera,
        renderer: this.ssthreeObject.threeRenderer,
        orbitControl: this.ssthreeObject.threeOrbitControl,
        camerasData: this.defaultConfig,
        openDebug: true
      });
      this.openVideoFusion(this.defaultConfig);
    }
    // console.log('this.videoSceneView.currCameraData', this.videoSceneView.currCameraData);
    if (this.videoSceneView.currCameraData) {
      this.videoSceneView.currCameraData.aspect = this.defaultConfig.camera.aspect;
      this.videoSceneView.currCameraData.camera.fov = this.defaultConfig.camera.fov;
      this.videoSceneView.currCameraData.camera.near = this.defaultConfig.camera.near;
      this.videoSceneView.currCameraData.camera.far = this.defaultConfig.camera.far;
      this.videoSceneView.updateCameraData();
    }
  };

  moduleMount() {
    // console.log(' 开发模块注册 ', this.defaultConfig);
    // 初始化赋值
    this._setConfigValue();
  }

  moduleUnmount() {
    // console.log(' 开发模块解除注册 ');
    if (!this.ssthreeObject || !this.water) {
      return;
    }
    this.closeVideoFusion();
  }

  moduleImport(e = {}) {
    // console.log(' 导入的文件配置 import ', e);
    this.defaultConfig = e;
    this._setConfigValue();
  }

  moduleExport() {
    // console.log(' 处理完戯后的文件配置 export ', this.defaultConfig);
    return this.defaultConfig;
  }

  getModuleConfig() {
    return this.defaultConfig;
  }

  moduleGuiChange(e) {
    console.log(' develop change ', e);
    this.defaultConfig = e.target;
    //
    this._setConfigValue();
  }
}
