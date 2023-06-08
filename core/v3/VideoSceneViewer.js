import { Group, TextureLoader } from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { DepthRender } from './DepthRender';
import { ColorRender } from './ColorRender';
import { BlendRender } from './BlendRender';
import { VideoCamera } from './VideoCamera';
import ThreeLoop from '../threeLoop';

/**
 * 视频融合
 *
 * @class VideoSceneViewer
 * @author Conor
 */
class VideoSceneViewer {
  static NORMAL = 0; // 正常渲染

  static FUSION = 1; // 视频融合

  destroy() {
    ThreeLoop.removeId('VideoSceneViewer render');
  }

  /**
     * @constructor
     * @param {HTMLDivElement} container
     * @param {Object} options
     */
  constructor({ scene, camera, renderer }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    // this.stats = stats;
    // this.clock = clock;
    // this.controls = controls;
    this.animation = -1;

    this.depthSteps = [];
    this.colorStep = null;
    this.blendStep = null;
    this.cameras = [];
    this.helpers = new Group();
    this._mode = VideoSceneViewer.FUSION;
    this.bgTexture = new TextureLoader().load(require('./VideoMask.png').default);

    this.animate();
    this.setupGUI();
  }

  // 过滤投射的物体列表
  castObjList = [];

  get mode() {
    return this._mode;
  }

  set mode(mode) {
    if (this._mode !== mode) {
      // this.renderer.resetState(); //重置其他的render渲染
      // this.renderer.setRenderTarget(null);
      this.helpers.visible = false;
      this._mode = mode;
    }
  }

  // 初始化视频融合
  initialize(cameraList) {
    // console.log('VideoSceneViewer.initialize...');
    // 清空
    if (this.cameras.length > 0) {
      for (let i = 0; i < this.cameras.length; i++) {
        const camera = this.cameras[i];
        this.helpers.remove(camera.helper);
      }
    }
    this.helpers = new Group();
    this.cameras = [];

    const data = {
      mixing: 1.0,
      cameras: cameraList
    };
    const n = data.cameras.length;
    // 初始化VideoCamera
    // 初始化VideoCamera
    for (let i = 0; i < n; i++) {
      const item = data.cameras[i];
      // VideoCamera
      const camera = new VideoCamera();
      // PerspectiveCamera
      camera.camera.name = item.camera.name;
      camera.camera.fov = item.camera.fov;
      camera.camera.aspect = item.camera.aspect;
      camera.camera.near = item.camera.near;
      camera.camera.far = item.camera.far;
      camera.camera.position.set(
        item.camera.position.x,
        item.camera.position.y,
        item.camera.position.z
      );
      camera.camera.rotation.set(
        item.camera.rotation.x,
        item.camera.rotation.y,
        item.camera.rotation.z
      );
      if (item.camera.target) {
        camera.camera.lookAt(
          item.camera.target.x,
          item.camera.target.y,
          item.camera.target.z
        );
      }
      camera.camera.updateProjectionMatrix();
      // HTMLVideoElement
      camera.texture = new TextureLoader().load(item.video.poster);
      // camera.video.src = item.video.stream;

      this.cameras.push(camera);
    }
    // DepthRender
    this.depthSteps = [];
    const projScreenMatrixArray = [];
    const depthTextureArray = [];
    const videoTextureArray = [];

    for (let i = 0; i < n; i++) {
      /**
             * @type {VideoCamera}
             */
      const camera = this.cameras[i];

      // CameraHelper
      camera.helper.update();
      this.helpers.add(camera.helper);

      // DepthRender
      const depthStep = new DepthRender(this.renderer, camera.camera, this.scene);
      depthStep.initialize();
      this.depthSteps.push(depthStep);

      projScreenMatrixArray.push(camera.calcProjScreenMatrix());
      depthTextureArray.push(depthStep.texture());
      videoTextureArray.push(camera.texture);
    }
    // 不添加helper
    // this.scene.add(this.helpers);

    // ColorRender
    this.colorStep = new ColorRender(this.renderer, this.camera, this.scene);
    this.colorStep.projScreenMatrixArray = projScreenMatrixArray;
    this.colorStep.depthTextureArray = depthTextureArray;
    this.colorStep.videoTextureArray = videoTextureArray;
    this.colorStep.bgTexture = this.bgTexture;

    this.colorStep.initialize();
    // }

    for (let i = 0; i < n; i++) {
      const camera = this.cameras[i];
      camera.addEventListener(VideoCamera.TEXTURE_UPDATED, (data) => {
        this.colorStep.videoTextureArray[i] = data.texture;
      });
    }

    // BlendRender
    this.blendStep = new BlendRender(this.renderer, this.camera, this.scene);
    this.blendStep.shadow = this.colorStep.texture();
    this.blendStep.mixing = data.mixing;
    // this.blendStep.diffuse = this.bgTexture;
    this.blendStep.initialize();
    // }
    // console.log('xxxx 初始化 ', this.cameras);
    return this.cameras;
  }

  animate() {
    // this.animation = requestAnimationFrame(() => this.animate());
    // if (this._mode === VideoSceneViewer.FUSION) {
    //   this.render();
    // }

    ThreeLoop.add(() => {
      if (this._mode === VideoSceneViewer.FUSION) {
        this.render();
      }
    }, 'VideoSceneViewer render');
  }

  beforRenderCB = (cb) => {
    cb?.();
  };

  afterRenderCB = (cb) => {
    cb?.();
  };

  render() {
    if (this.cameras && this.cameras.length > 0) {
      // console.log("VideoSceneViewer.render...depth");
      this.helpers.visible = false;
      this.beforRenderCB();
      for (let i = 0; i < this.castObjList.length; i++) {
        const obj = this.castObjList[i];
        obj.visible = false;
      }

      const n = this.cameras.length;
      for (let i = 0; i < n; i++) {
        this.depthSteps[i].render();
      }

      // console.log("VideoSceneViewer.render...color");
      this.colorStep.render();

      // console.log("VideoSceneViewer.render...blend");
      this.helpers.visible = true;
      this.afterRenderCB();
      for (let i = 0; i < this.castObjList.length; i++) {
        const obj = this.castObjList[i];
        obj.visible = true;
      }
      this.blendStep.render();

      // this.stats.update();

      // const delta = this.clock.getDelta();
      // this.controls.update(delta);
      // console.log('viewRender..');
    }
  }

  /**
     * 添加相机
     */
  addCamera(data) {
    // ------------------------------------
    const i = this.cameras.length;
    // VideoCamera
    const _camera = new VideoCamera();
    // PerspectiveCamera
    // --------------
    _camera.camera.name = data.camera.name;
    _camera.camera.fov = data.camera.fov;
    _camera.camera.aspect = 1;
    _camera.camera.near = data.camera.near;
    _camera.camera.far = data.camera.far;
    _camera.camera.position.set(
      data.camera.position.x,
      data.camera.position.y,
      data.camera.position.z
    );
    _camera.camera.rotation.set(
      data.camera.rotation.x,
      data.camera.rotation.y,
      data.camera.rotation.z
    );
    // _camera.camera.rotation.set(0, 90, 0);
    _camera.camera.lookAt(data.camera.target.x, data.camera.target.y, data.camera.target.z);
    _camera.camera.updateWorldMatrix(true);
    _camera.camera.updateProjectionMatrix();
    // HTMLVideoElement
    _camera.texture = new TextureLoader().load(data.video.poster);
    //   camera.video.src = item.video.stream;
    _camera.video.src = '';
    this.cameras.push(_camera);

    // CameraHelper
    _camera.helper.update();
    this.helpers.add(_camera.helper);
    // DepthRender
    const depthStep = new DepthRender(this.renderer, _camera.camera, this.scene);
    depthStep.initialize();
    this.depthSteps.push(depthStep);

    // ColorRender
    this.colorStep.projScreenMatrixArray.push(_camera.calcProjScreenMatrix());
    this.colorStep.depthTextureArray.push(depthStep.texture());
    this.colorStep.videoTextureArray.push(_camera.texture);
    this.colorStep.update();

    _camera.addEventListener(VideoCamera.TEXTURE_UPDATED, (data) => {
      this.colorStep.videoTextureArray[i] = data.texture;
    });

    // console.log('this.cameras', this.cameras);
  }

  /**
     * 移除相机
     */
  removeCamera(cameraName) {
    // const i = 0;
    /**
         * @type {VideoCamera}
         */

    for (let i = 0; i < this.cameras.length; i++) {
      const camera = this.cameras[i];
      if (camera.camera.name === cameraName) {
        // console.log('this.cameras', camera.camera);

        camera.video.pause();
        this.cameras.splice(i, 1);
        // CameraHelper
        this.helpers.remove(camera.helper);
        // ColorRender
        this.colorStep.projScreenMatrixArray.splice(i, 1);
        this.colorStep.depthTextureArray.splice(i, 1);
        this.colorStep.videoTextureArray.splice(i, 1);
        this.colorStep.update();
        // DepthRender
        this.depthSteps.splice(i, 1);
        // console.log('this.cameras', this.cameras);
      }
    }

    // // let camera = this.cameras[i];
    // camera.video.pause();

    // this.cameras.splice(i, 1);

    // // CameraHelper
    // this.helpers.remove(camera.helper);

    // // ColorRender
    // this.colorStep.projScreenMatrixArray.splice(i, 1);
    // this.colorStep.depthTextureArray.splice(i, 1);
    // this.colorStep.videoTextureArray.splice(i, 1);
    // this.colorStep.update();

    // // DepthRender
    // this.depthSteps.splice(i, 1);
    // console.log('this.cameras', this.cameras);
  }

  clear = () => {
    for (let i = 0; i < this.cameras.length; i++) {
      const camera = this.cameras[i];
      // CameraHelper
      this.helpers.remove(camera.helper);
      // // ColorRender
      // this.colorStep.projScreenMatrixArray.splice(i, 1);
      // this.colorStep.depthTextureArray.splice(i, 1);
      // this.colorStep.videoTextureArray.splice(i, 1);
      // this.colorStep.update();
      // // DepthRender
      // this.depthSteps.splice(i, 1);
      // console.log('this.cameras', this.cameras);
    }
    // ColorRender
    this.colorStep.projScreenMatrixArray.splice(0);
    this.colorStep.depthTextureArray.splice(0);
    this.colorStep.videoTextureArray.splice(0);
    this.colorStep.update();
    // DepthRender
    this.depthSteps.splice(1);
    this.cameras = [];
  };

  /**
     * 更新相机
     */
  updateCamera() {
    const i = 0;

    /**
         * @type {VideoCamera}
         */
    const camera = this.cameras[i];
    // PerspectiveCamera
    camera.camera.fov = 50;
    camera.camera.position.set(-10.37, 2.2113, -12.358);
    camera.camera.rotation.set(0, 90, 0);
    camera.camera.lookAt(-9.5324, 2.434, -9.0906);
    camera.camera.updateProjectionMatrix();
    // CameraHelper
    camera.helper.update();

    // ColorRender
    this.colorStep.projScreenMatrixArray[i] = camera.calcProjScreenMatrix();
    this.colorStep.update();
  }

  /**
     * 更新相机 GUI
     */
  updateCamera2 = ({
    fov,
    aspect,
    near,
    far,
    translateX,
    translateY,
    translateZ,
    rotateX,
    rotateY,
    rotateZ,
    helperVisible
  }) => {
    const i = 0;
    /**
         * @type {VideoCamera}
         */
    const camera = this.cameras[i];
    // PerspectiveCamera
    camera.camera.fov = fov || camera.camera.fov;
    camera.camera.aspect = aspect || camera.camera.aspect;
    camera.camera.near = near || camera.camera.near;
    camera.camera.far = far || camera.camera.far;
    // camera.camera.position.set(-10.37, 2.2113, -12.358);
    // camera.camera.rotation.set(0, 90, 0);
    camera.camera.translateX((translateX * Math.PI) / 180 || 0);
    camera.camera.translateY((translateY * Math.PI) / 180 || 0);
    camera.camera.translateZ((translateZ * Math.PI) / 180 || 0);

    camera.camera.rotateX((rotateX * Math.PI) / 180 || 0);
    camera.camera.rotateY((rotateY * Math.PI) / 180 || 0);
    camera.camera.rotateZ((rotateZ * Math.PI) / 180 || 0);

    // camera.camera.lookAt(-9.5324, 2.434, -9.0906);
    camera.camera.updateProjectionMatrix();
    // CameraHelper
    camera.helper.update();
    camera.helper.visible = helperVisible;
    // ColorRender
    this.colorStep.projScreenMatrixArray[i] = camera.calcProjScreenMatrix();
    this.colorStep.update();

    // console.log(JSON.stringify(camera.camera.position));
    this.params.info = `{camera:{name:'',fov:${camera.camera.fov},aspect:${
      camera.camera.aspect
    },near:${camera.camera.near},far:${camera.camera.far},position:${JSON.stringify(
      camera.camera.position
    )},rotation:{ x:${camera.camera.rotation.x}, y:${camera.camera.rotation.y},z: ${
      camera.camera.rotation.z
    } }}`;

    this.params.info += ",video: { poster: '', stream: ''} }";
    this.gui.updateDisplay();
  };

  /**
     * 更新融合混合度
     */
  updateMixing({ mixing }) {
    // const data = {
    //   mixing: 0.1
    // };
    // this.blendStep.mixing = data.mixing;
    this.blendStep.mixing = mixing;
    this.blendStep.update();
  }

  mute() {
    const i = 0;

    /**
         * @type {VideoCamera}
         */
    const camera = this.cameras[i];
    camera.video.muted = !camera.video.muted;
  }

  pause() {
    const i = 0;

    /**
         * @type {VideoCamera}
         */
    const camera = this.cameras[i];
    camera.video.pause();
  }

  resume() {
    const i = 0;

    /**
         * @type {VideoCamera}
         */
    const camera = this.cameras[i];
    if (camera.video.paused) {
      camera.video.play().then().catch();
    }
  }

  // 相机属性
  params = {
    fov: 23,
    aspect: 1,
    near: 1,
    far: 1000,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    mixing: 0.85,
    helperVisible: false,
    info: ''
  };

  setupGUI = () => {
    this.gui = new GUI();
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '1.5rem';
    this.gui.domElement.style.right = '6.2rem';
    this.gui.name = 'three调试配置';
    this.gui.width = 200;
    this.gui.closed = false;
    this._addGui();
  };

  hideGui = () => {
    if (this.gui) {
      this.gui.hide();
      this.gui.destroy();
      this.gui = null;
    }
  };

  /**
     * 添加调试GUI
     */
  _addGui = () => {
    // const gui = new GUI();
    const foldergui = this.gui.addFolder('视频融合');
    foldergui.add(this.params, 'fov', 0.0, 180, 1).onChange((value) => {
      this.updateCamera2({ fov: value });
    });
    foldergui.add(this.params, 'aspect', -10, 10, 0.1).onChange((value) => {
      this.updateCamera2({ aspect: value });
    });
    foldergui.add(this.params, 'near', 0.0, 10, 0.1).onChange((value) => {
      this.updateCamera2({ near: value });
    });
    foldergui.add(this.params, 'far', 0.0, 2000, 1).onChange((value) => {
      this.updateCamera2({ far: value });
    });
    // 平移
    foldergui.add(this.params, 'translateX', -0.5, 0.5, 0.5).onChange((value) => {
      this.updateCamera2({ translateX: value });
    });
    foldergui.add(this.params, 'translateY', -0.5, 0.5, 0.5).onChange((value) => {
      this.updateCamera2({ translateY: value });
    });
    foldergui.add(this.params, 'translateZ', -0.5, 0.5, 0.5).onChange((value) => {
      this.updateCamera2({ translateZ: value });
    });
    // 旋转
    foldergui.add(this.params, 'rotateX', -0.5, 0.5, 0.5).onChange((value) => {
      this.updateCamera2({ rotateX: value });
    });
    foldergui.add(this.params, 'rotateY', -0.5, 0.5, 0.5).onChange((value) => {
      this.updateCamera2({ rotateY: value });
    });
    foldergui.add(this.params, 'rotateZ', -0.5, 0.5, 0.5).onChange((value) => {
      this.updateCamera2({ rotateZ: value });
    });

    // this.updateCamera2({helperVisible:this.params.helperVisible})
    foldergui.add(this.params, 'helperVisible').onChange((value) => {
      this.updateCamera2({ helperVisible: value });
    });
    foldergui.add(this.params, 'mixing', 0, 1, 0.01).onChange((value) => {
      this.updateMixing({ mixing: value });
    });
    foldergui.add(this.params, 'info', '').onChange((value) => {
      // this.params.info = value;
    });
    // this.gui.open();
    // foldergui.open();
    foldergui.close();
  };
}

export { VideoSceneViewer };
