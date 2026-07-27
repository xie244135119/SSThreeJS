import * as THREE from 'three';
import GUI from 'lil-gui';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { DepthRender } from './DepthRender';
import { ColorRender } from './ColorRender';
import { BlendRender } from './BlendRender';
import { VideoCamera } from './VideoCamera';
import VideoMaskImg from './VideoMask.png';
/**
 * 视频融合
 *
 * @class VideoSceneViewer
 * @author Conor
 */
class VideoSceneViewer {
  static NORMAL = 0; // 正常渲染

  static FUSION = 1; // 视频融合

  // 过滤投射的物体列表
  ignoreObjectList = [];

  transformControl = null;

  // 当前选中的摄像头模型
  currSelectObj = null;

  // 当前的融合相机数据
  currCameraData = null;

  // /**
  //  *
  //  * @param {*} param0 { scene, camera, renderer, orbitControl, cameras = [] : [] nameList, openDebug = false :是否打开融合}
  //  * @returns
  //  */
  constructor({ scene, camera, renderer, orbitControl, camerasData = [], openDebug = false }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.orbitControl = orbitControl;
    this.openDebug = openDebug;
    this.animation = -1;

    this.depthSteps = [];
    this.colorStep = null;
    this.blendStep = null;
    this.cameras = [];
    this.helpers = new THREE.Group();
    this._mode = VideoSceneViewer.FUSION;
    // this.bgTexture = new THREE.TextureLoader().load('./VideoMask.png'); // 注意⚠️：加载不出来会导致视频融合画面没有反应
    // this.bgTexture = new THREE.TextureLoader().load('./public/threeTextures/VideoMask.png');
    this.bgTexture = new THREE.TextureLoader().load(
      VideoMaskImg || '../../core/assets/VideoMask.png'
    );

    this.animate();
    //----
    // if (!cameras) return;
    // if (openDebug && camerasData) {
    if (this.openDebug) {
      this.setupGUI(camerasData);
      this.setupTransformControl();
    } else {
      this.hideGui();
    }
  }

  get mode() {
    return this._mode;
  }

  set mode(mode) {
    if (this._mode !== mode) {
      this.renderer.resetState(); // 重置其他的render渲染
      // this.renderer.setRenderTarget(null);
      this.helpers.visible = false;
      this._mode = mode;
    }
  }

  /**
   * 取消融合自身的 requestAnimationFrame 循环
   * 修复【重复开启融合卡死】：原库每次 new VideoSceneViewer 都会 animate() 启动一个 rAF，
   * 且从不取消；反复 openVideoFusion 会叠加多个无限 rAF，帧数指数级增长导致卡死。
   */
  stopAnimate = () => {
    if (this.animation != null && this.animation !== -1) {
      cancelAnimationFrame(this.animation);
      this.animation = -1;
    }
  };

  /**
   * 销毁融合渲染资源：停止动画、释放 render step（composer/RT/material）、清相机、暂停视频、移除 helper。
   * 修复【重复开启卡死 + 内存泄漏】：closeVideoFusion 只 clear() 且不取消 rAF，
   * 反复开关会泄漏 EffectComposer 与 WebGLRenderTarget。
   */
  destroy = () => {
    this.stopAnimate();
    // 先清相机（内部访问 colorStep/depthSteps，需在 _disposeRenderSteps 置空之前完成）
    this.clear();
    // 释放 render step（composer/RT/material）
    this._disposeRenderSteps();
    this.scene.remove(this.helpers);
    // 销毁调试 GUI
    this.hideGui();
    // 释放背景遮罩纹理
    if (this.bgTexture) {
      this.bgTexture.dispose?.();
      this.bgTexture = null;
    }
  };

  /**
   * 释放当前一套 render step 的 WebGL 资源（供 initialize 重建前 / destroy 调用，避免泄漏叠加）。
   */
  _disposeRenderSteps = () => {
    if (this.depthSteps?.length) {
      this.depthSteps.forEach((step) => step.dispose?.());
      this.depthSteps = [];
    }
    this.colorStep?.dispose?.();
    this.colorStep = null;
    if (this.blendStep) {
      // 关闭融合渲染前恢复主渲染器的 toneMapping（BlendRender.initialize 曾临时改成 NoToneMapping）。
      if (this.blendStep._savedToneMapping !== undefined && this.renderer) {
        try {
          this.renderer.toneMapping = this.blendStep._savedToneMapping;
        } catch (e) {}
      }
      this.blendStep.dispose?.();
      this.blendStep = null;
    }
  };

  // 初始化视频融合
  initialize(cameraList) {
    console.log('VideoSceneViewer.initialize...', cameraList);
    // 修复【重复开启融合卡死/泄漏】：每次 initialize 会新建一整套 DepthRender/ColorRender/
    // BlendRender（含 EffectComposer + 多个 WebGLRenderTarget）。原库仅清空 cameras，
    // 上一套 render step 全部泄漏，反复开启会让 GPU/WebGL 资源打满直至卡死。
    // 这里在重建前释放上一套 render step 的资源。
    this._disposeRenderSteps();
    // 清空
    if (this.cameras.length > 0) {
      for (let i = 0; i < this.cameras.length; i++) {
        const camera = this.cameras[i];
        this.helpers.remove(camera.helper);
        this.scene.remove(camera.camera);
        // 释放旧 VideoCamera 资源，避免反复 initialize 累积泄漏
        camera?.dispose?.();
      }
    }
    this.helpers = new THREE.Group();
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
      if (camera.camera.rotation) {
        camera.camera.rotation.set(
          item.camera.rotation.x,
          item.camera.rotation.y,
          item.camera.rotation.z
        );
      }
      if (item.camera.target) {
        camera.camera.lookAt(item.camera.target.x, item.camera.target.y, item.camera.target.z);
      }
      camera.camera.updateProjectionMatrix();
      // HTMLVideoElement
      camera.texture = new THREE.TextureLoader().load(item.video.poster);
      // 修复【视频不投射】：只设 video.src 不会触发加载流程，
      // 浏览器不会为已存在的 src 自动 fetch；必须显式调用 load() 才会触发
      // canplay/canplaythrough 事件链（VideoCamera 在此事件里才会建 VideoTexture 并派发
      // TEXTURE_UPDATED，否则融合用的始终是 poster 静态纹理，视频永远投不上去）。
      camera.video.src = item.video.stream;
      camera.video.load();
      // 部分浏览器要求在用户交互上下文里 play，这里兜底尝试播放。
      camera.video.play?.().catch?.(() => {});

      this.cameras.push(camera);
      this.scene.add(camera.camera);
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
    if (this.openDebug) {
      this.scene.add(this.helpers);
    }

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
    // console.log('11', this.renderer, this.camera, this.scene);
    this.blendStep.shadow = this.colorStep.texture();
    this.blendStep.mixing = data.mixing;
    this.blendStep.initialize();
    // }
  }

  animate() {
    // 守卫：已在排程则不再叠加新的 rAF，避免反复 openVideoFusion 累积多个无限 rAF 卡死
    if (this.animation != null && this.animation !== -1) return;
    this.animation = requestAnimationFrame(() => {
      this.animation = -1;
      this.animate();
    });
    if (this._mode === VideoSceneViewer.FUSION) {
      this.render();
    }
  }

  beforeRenderCB = (cb) => {
    cb?.();
  };

  afterRenderCB = (cb) => {
    cb?.();
  };

  render() {
    if (this.cameras && this.cameras.length > 0) {
      // console.log("VideoSceneViewer.render...depth");
      this.helpers.visible = false;
      this.beforeRenderCB();
      for (let i = 0; i < this.ignoreObjectList.length; i++) {
        const obj = this.ignoreObjectList[i];
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
      for (let i = 0; i < this.ignoreObjectList.length; i++) {
        const obj = this.ignoreObjectList[i];
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
    _camera.texture = new THREE.TextureLoader().load(data.video.poster);
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
    // 倒序遍历：避免 splice 后 i++ 跳过下一元素（原正序实现的漏删 bug）
    for (let i = this.cameras.length - 1; i >= 0; i--) {
      const camera = this.cameras[i];
      if (camera.camera.name === cameraName) {
        camera.video?.pause();
        this.cameras.splice(i, 1);
        // CameraHelper
        this.helpers.remove(camera.helper);
        // 释放被移除 VideoCamera 的资源
        camera?.dispose?.();
        // ColorRender
        this.colorStep.projScreenMatrixArray.splice(i, 1);
        this.colorStep.depthTextureArray.splice(i, 1);
        this.colorStep.videoTextureArray.splice(i, 1);
        this.colorStep.update();
        // DepthRender
        const depthStep = this.depthSteps.splice(i, 1)[0];
        depthStep?.dispose?.();
      }
    }
  }

  clear = () => {
    // 修复【clear 漏删 bug】：原实现 for 循环里对同一数组 splice(i,1) 后 i++，
    // 会跳过下一个元素导致漏删/越界。改为倒序遍历或一次性置空。
    for (let i = this.cameras.length - 1; i >= 0; i--) {
      const camera = this.cameras[i];
      // CameraHelper
      this.helpers.remove(camera.helper);
      this.scene.remove(camera.camera);
      // 释放 VideoCamera 资源（texture/helper/video）
      camera?.dispose?.();
      // ColorRender
      this.colorStep.projScreenMatrixArray.splice(i, 1);
      this.colorStep.depthTextureArray.splice(i, 1);
      this.colorStep.videoTextureArray.splice(i, 1);
      // DepthRender
      this.depthSteps.splice(i, 1);
    }
    this.colorStep?.update();
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

  /**
   *
   * @param {*} cameras cameraData
   */
  setupGUI = (cameras = []) => {
    console.log('cameras', cameras);
    const names = [];
    // eslint-disable-next-line array-callback-return
    cameras.map((data) => {
      names.push(data.camera.name);
    });
    // eslint-disable-next-line no-param-reassign
    cameras = ['Null', ...names];
    this.gui = new GUI();
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '1.5rem';
    this.gui.domElement.style.left = '6.2rem';
    this.gui.name = '视频融合';
    this.gui.width = 200;
    this.gui.closed = false;
    const dgacElement = this.gui.domElement.parentElement;
    dgacElement.style.zIndex = 1000;
    this._addGui(cameras);
  };

  hideGui = () => {
    if (this.gui) {
      this.gui.hide();
      this.gui.destroy();
      this.gui = null;
    }
  };

  // 相机属性
  params = {
    cameras: ['Null'], // 列表
    name: '', // 名称
    position: '', // 位置
    rotation: '', // 旋转
    scale: '', // 缩放
    fov: 23,
    aspect: 1,
    near: 1,
    far: 1000,
    mixing: 0.85,
    helperVisible: false,
    info: ''
  };

  /**
   * 添加调试GUI
   */
  _addGui = (cameras) => {
    // const gui = new GUI();
    const foldergui = this.gui.addFolder('视频融合');
    foldergui
      .add(this.params, 'cameras', cameras)
      .onChange((value) => {
        console.log('value', value);
        if (value === 'Null') {
          this.transformControl.detach(this.currSelectObj);
          this._changeGUIMsg();
          this.currSelectObj = null;
          this._mode = VideoSceneViewer.NORMAL;
          return;
        }
        this._mode = VideoSceneViewer.FUSION;

        const cameraData = this.cameras.find((item) => item.camera.name === value);
        let selectCamera = null;
        if (cameraData) {
          selectCamera = cameraData.camera;
        }
        this.currCameraData = cameraData;
        if (!this.currCameraData) {
          console.log('视频融合未开启，先调用openVideoFusion');
          return;
        }
        this.select(selectCamera);
      })
      .listen();
    foldergui
      .add(this.params, 'name')
      .onChange((value) => {})
      .listen();
    foldergui
      .add(this.params, 'position')
      .onChange((value) => {})
      .listen();
    foldergui
      .add(this.params, 'rotation')
      .onChange((value) => {
        this.currSelectObj.rotation = value;
      })
      .listen();
    foldergui
      .add(this.params, 'scale')
      .onChange((value) => {})
      .listen();
    //-------------
    foldergui
      .add(this.params, 'fov', 0.0, 180, 1)
      .onChange((value) => {
        this.updateCamera2({ fov: value });
      })
      .listen();
    foldergui
      .add(this.params, 'aspect', -10, 10, 0.1)
      .onChange((value) => {
        this.updateCamera2({ aspect: value });
      })
      .listen();
    foldergui
      .add(this.params, 'near', 0.0, 10, 0.1)
      .onChange((value) => {
        this.updateCamera2({ near: value });
      })
      .listen();
    foldergui
      .add(this.params, 'far', 0.0, 2000, 1)
      .onChange((value) => {
        this.updateCamera2({ far: value });
      })
      .listen();
    foldergui
      .add(this.params, 'helperVisible')
      .onChange((value) => {
        this.updateCamera2({ helperVisible: value });
      })
      .listen();
    foldergui
      .add(this.params, 'mixing', 0, 1, 0.01)
      .onChange((value) => {
        this.updateMixing({ mixing: value });
      })
      .listen();
    foldergui
      .add(this.params, 'info', '')
      .onChange((value) => {
        // this.params.info = value;
      })
      .listen();
    // this.gui.open();
    foldergui.open();

    // foldergui.close();
  };

  setupTransformControl = () => {
    this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControl.addEventListener('dragging-changed', (event) => {
      // this.orbit.enabled = !event.value;
      this.orbitControl.enabled = !event.value;
      this._changeGUIMsg();
    });
    // 拖拽过程中每帧对象变化时触发(平移/旋转/缩放进行中)，实时更新投影矩阵，
    // 让视频融合投影跟随 transform 拖拽实时生效(否则只在拖拽结束 dragging-changed 才更新)。
    this.transformControl.addEventListener('objectChange', () => {
      this.updateCameraData();
    });
    // this.scene.add(this.transformControl);
    const gizmo = this.transformControl.getHelper();
    this.scene.add(gizmo);

    window.addEventListener('keydown', (event) => {
      // eslint-disable-next-line default-case
      switch (event.keyCode) {
        case 81: // Q
          this.transformControl.setSpace(
            this.transformControl.space === 'local' ? 'world' : 'local'
          );
          break;

        case 16: // Shift
          this.transformControl.setTranslationSnap(100);
          this.transformControl.setRotationSnap(THREE.MathUtils.degToRad(15));
          this.transformControl.setScaleSnap(0.25);
          break;

        case 87: // W
          console.log('this.transformContro', this.transformControl);
          this.transformControl.setMode('translate');
          break;

        case 69: // E
          this.transformControl.setMode('rotate');
          break;

        case 82: // R
          this.transformControl.setMode('scale');
          break;

        case 187:
        case 107: // +, =, num+
          this.transformControl.setSize(this.transformControl.size + 0.1);
          break;

        case 189:
        case 109: // -, _, num-
          this.transformControl.setSize(Math.max(this.transformControl.size - 0.1, 0.1));
          break;

        case 88: // X
          this.transformControl.showX = !this.transformControl.showX;
          break;

        case 89: // Y
          this.transformControl.showY = !this.transformControl.showY;
          break;

        case 90: // Z
          this.transformControl.showZ = !this.transformControl.showZ;
          break;

        case 32: // Spacebar
          this.transformControl.enabled = !this.transformControl.enabled;
          break;

        case 27: // Esc
          this.transformControl.reset();
          break;
      }

      this._changeGUIMsg();
    });
    window.addEventListener('keyup', (event) => {
      // eslint-disable-next-line default-case
      switch (event.keyCode) {
        case 16: // Shift
          this.transformControl.setTranslationSnap(null);
          this.transformControl.setRotationSnap(null);
          this.transformControl.setScaleSnap(null);
          break;
      }
    });
  };

  /**
   * 选中物体
   * @param {*} obj
   */
  select = (obj) => {
    console.log('setinfo', obj);
    this.currSelectObj = obj;
    this.transformControl.attach(obj);
    this._changeGUIMsg();
    window.currSelectObj = obj;
  };

  /**
   * 更新相机 GUI
   */
  updateCamera2 = ({ fov, aspect, near, far, helperVisible }) => {
    const camera = this.currCameraData;
    camera.camera.fov = fov || camera.camera.fov;
    camera.camera.aspect = aspect || camera.camera.aspect;
    camera.camera.near = near || camera.camera.near;
    camera.camera.far = far || camera.camera.far;
    this.updateCameraData();
  };

  _changeGUIMsg = () => {
    if (!this.currSelectObj) return;
    this.params.name = this.currSelectObj.name;
    this.params.position = JSON.stringify(this.currSelectObj.position);
    this.params.rotation = JSON.stringify({
      x: this.currSelectObj.rotation.x,
      y: this.currSelectObj.rotation.y,
      z: this.currSelectObj.rotation.z
    });
    this.params.fov = this.currCameraData.camera.fov;
    this.params.near = this.currCameraData.camera.near;
    this.params.far = this.currCameraData.camera.far;
    this.updateCameraData();
  };

  // 更新场景相机
  updateCameraData = () => {
    // 更新场景相机内容
    // eslint-disable-next-line array-callback-return
    this.cameras.map((item, index) => {
      /**
       * @type {VideoCamera}
       */
      const cameraData = this.cameras[index];
      cameraData.camera.updateProjectionMatrix();
      // CameraHelper
      cameraData.helper.update();
      // ColorRender
      this.colorStep.projScreenMatrixArray[index] = cameraData.calcProjScreenMatrix();
      this.colorStep.update();
    });

    this.params.info = ` {camera: {
      name: '视频融合_test',
      fov: ${this.params.fov},
      aspect: ${this.params.aspect},
      near: ${this.params.near},
      far: ${this.params.far},
      position: ${this.params.position},
      rotation: ${this.params.rotation},
      // target: {x:0 ,y:0 ,z:0}
    },
    video: {
      poster: '',
      stream: ''
    }}`;
    console.log('this.params.rotation', this.params.rotation);
    // this.gui.updateDisplay();
  };
}

export { VideoSceneViewer };
