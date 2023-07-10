import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Stats from 'stats.js';
import WEBGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
// import { DebugEnvironment } from 'three/examples/jsm/environments/DebugEnvironment';
import ThreeLoop from './SSThreeLoop';
import SSDispose from './SSDispose';
import SSEvent from './SSEvent';
import ThreeControls from './Controls';
import ThreeGUI from './Gui/index';
import SSThreeTool from './SSTool';
import LoadingManager from './plugin/loadingmanager';
import SSThreeObject from './SSThreeObject';
import SSLoader from './SSLoader';
import PostProcessManager from './PostProcessManager';

export default class SSThreeJs {
  /**
   * @description 存储类
   * @type ssthreeObject
   */
  ssthreeObject = new SSThreeObject();

  /**
   * @type THREE.DirectionalLight direction light
   */
  threeDirectionLight = null;

  /**
   * @type THREE.AmbientLight  ambient light
   */
  threeAmbientLight = null;

  /**
   * @type ThreeControls three custom control
   */
  threeControls = null;

  // gui
  threeGUI = new ThreeGUI();

  // postProcessing
  postProcessManager = null;

  /**
   * @type SSEvent
   */
  threeEvent = null;

  // stats js
  #statsJs = new Stats();

  // observer
  #resizeObserver = null;

  // axis helper
  #axisControlHelper = null;

  // camera helper
  #cameraHelper = null;

  // direct helper
  #directLightHelper = null;

  // has released
  #threeJsDestoryed = false;

  /**
   * 销毁机制
   */
  destroy(loop = true) {
    this.#threeJsDestoryed = true;
    if (loop) {
      this.closeWebglRender();
      ThreeLoop.destory();
    }

    this.#removeResizeOBserver();
    this.#removeOrbitControl();

    this.threeEvent.destory();
    this.threeEvent = null;

    if (this.ssthreeObject.threeScene !== null) {
      SSDispose.dispose(this.ssthreeObject.threeScene);
      if (this.ssthreeObject.threeRenderer.info.programs.length !== 0) {
        console.log('scene material has not released', this.ssthreeObject.threeRenderer.info);
      } else if (this.ssthreeObject.threeRenderer.info.memory.geometries) {
        console.log('scene geometries has not released', this.ssthreeObject.threeRenderer.info);
      } else if (this.ssthreeObject.threeRenderer.info.memory.textures) {
        console.log('scene textures has not released', this.ssthreeObject.threeRenderer.info);
      }
    }

    if (this.ssthreeObject.threeRenderer !== null) {
      this.ssthreeObject.threeRenderer.dispose();
      this.ssthreeObject.threeRenderer.forceContextLoss();
      this.ssthreeObject.threeContainer.removeChild(this.ssthreeObject.threeRenderer.domElement);
    }
  }

  // Container初始化
  #getContainerDom = (aContainer) => {
    if (typeof aContainer === 'string') {
      const element = document.getElementById(aContainer);
      this.ssthreeObject.threeContainer = element;
      return element;
    }
    if (aContainer instanceof HTMLElement) {
      this.ssthreeObject.threeContainer = aContainer;
      return aContainer;
    }
    return document.body;
  };

  setup = (aContainer) => {
    const container = this.#getContainerDom(aContainer);
    if (!WEBGL.isWebGLAvailable()) {
      const warning = WEBGL.getWebGLErrorMessage();
      container.appendChild(warning);
      return null;
    }

    // scene
    const scene = new THREE.Scene();
    this.ssthreeObject.threeScene = scene;
    const aspect = container.offsetWidth / container.offsetHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 20000);
    camera.position.set(10, 10, 10);
    this.ssthreeObject.threeCamera = camera;
    // webgl render
    this.#addRender();
    // ambient light
    const light = new THREE.AmbientLight(new THREE.Color(0xffffff), 1);
    scene.add(light);
    this.threeAmbientLight = light;
    // direct light
    const directLight = new THREE.DirectionalLight(new THREE.Color('#FFFFE0'), 1);
    directLight.position.set(0, 1, 0);
    scene.add(directLight);
    this.threeDirectionLight = directLight;

    // control
    this.threeControls = new ThreeControls();
    this.threeControls.bindThreeJs(this);
    this.threeControls.bindCamera(
      this.ssthreeObject.threeCamera,
      this.ssthreeObject.threeRenderer,
      this.ssthreeObject.threeScene
    );
    // keyboard orbitcontrol
    this.#addOrbitControl(camera, container);
    // page resize
    this.#addResizeOBserver(container, this.ssthreeObject.threeRenderer, camera);
    // add event
    this.threeEvent = new SSEvent(container);
    // loading manager
    LoadingManager.shareInstance.addProgressView(container);
    //
    ThreeLoop.setup();

    // add webgl render
    this.startWebglRender();

    this.postProcessManager = new PostProcessManager(this.ssthreeObject, false);

    ThreeLoop.add(() => {
      if (this.ssthreeObject.threeOrbitControl.autoRotate) {
        this.ssthreeObject.threeOrbitControl.update();
      }
    }, 'control update');

    return scene;
  };

  /**
   * get camera eye
   */
  getEye = () => ({
    camera: this.ssthreeObject.threeCamera.position,
    control: this.ssthreeObject.threeOrbitControl.target
  });

  /**
   * sky box
   * @param {*} hdrs
   * @returns
   */
  addSky = (skys = []) => {
    const pmremGenerator = new THREE.PMREMGenerator(this.ssthreeObject.threeRenderer);
    const hdrLoader = new THREE.CubeTextureLoader(LoadingManager.shareInstance.threeLoadingManager);
    return new Promise((reslove, reject) => {
      hdrLoader.load(
        skys,
        (texture) => {
          const cubetexure = pmremGenerator.fromCubemap(texture).texture;
          this.ssthreeObject.threeScene.environment = cubetexure;
          this.ssthreeObject.threeScene.background = cubetexure;
          pmremGenerator.dispose();
          reslove(texture);
        },
        null,
        (e) => {
          pmremGenerator.dispose();
          reject(e);
        }
      );
    });
  };

  /**
   * addHdr
   */
  addHDR = (hdrs = []) => {
    const pmremGenerator = new THREE.PMREMGenerator(this.ssthreeObject.threeRenderer);
    if (hdrs.length === 1) {
      return new Promise((reslove, reject) => {
        const rgbeLoader = new RGBELoader(LoadingManager.shareInstance.threeLoadingManager);
        rgbeLoader.load(
          hdrs,
          (texture) => {
            const cubetexure = pmremGenerator.fromCubemap(texture).texture;
            this.ssthreeObject.threeScene.background = cubetexure;
            this.ssthreeObject.threeScene.environment = cubetexure;
            pmremGenerator.dispose();
            reslove(texture);
          },
          null,
          (e) => {
            pmremGenerator.dispose();
            reject(e);
          }
        );
      });
    }
    //
    const hdrLoader = new HDRCubeTextureLoader(LoadingManager.shareInstance.threeLoadingManager);
    return new Promise((reslove, reject) => {
      hdrLoader.load(
        hdrs,
        (texture) => {
          const cubetexure = pmremGenerator.fromCubemap(texture).texture;
          this.ssthreeObject.threeScene.environment = cubetexure;
          this.ssthreeObject.threeScene.background = cubetexure;
          pmremGenerator.dispose();
          reslove(texture);
        },
        null,
        (e) => {
          pmremGenerator.dispose();
          reject(e);
        }
      );
    });
  };

  // render
  #addRender = () => {
    this.ssthreeObject.threeRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    this.ssthreeObject.threeRenderer.shadowMap.enabled = true;
    this.ssthreeObject.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.ssthreeObject.threeRenderer.setSize(
      this.ssthreeObject.threeContainer.clientWidth,
      this.ssthreeObject.threeContainer.clientHeight
    );
    this.ssthreeObject.threeRenderer.setPixelRatio(window.devicePixelRatio);
    this.ssthreeObject.threeRenderer.setClearColor('white', 0);
    this.ssthreeObject.threeContainer.appendChild(this.ssthreeObject.threeRenderer.domElement);
    this.ssthreeObject.threeRenderer.autoClear = true;
    this.ssthreeObject.threeRenderer.toneMapping = THREE.ACESFilmicToneMapping; // 模拟、逼近高动态范围（HDR）效果 LinearToneMapping 为默认值，线性色调映射。
    this.ssthreeObject.threeRenderer.toneMappingExposure = 1;
    // this.ssthreeObject.threeRenderer.textureEncoding = THREE.sRGBEncoding; // LinearEncoding
    // this.ssthreeObject.threeRenderer.outputEncoding = THREE.sRGBEncoding; // sRGBEncoding
  };

  /**
   * start webgl render
   */
  startWebglRender = () => {
    ThreeLoop.add(() => {
      this.ssthreeObject.threeRenderer.render(
        this.ssthreeObject.threeScene,
        this.ssthreeObject.threeCamera
      );
    }, 'webglrender update');
  };

  /**
   * close webgl render
   */
  closeWebglRender = () => {
    ThreeLoop.removeId('webglrender update');
  };

  /**
   * 缓动设置模型中心位置信息
   * @param {*} aCameraPosition 镜头位置
   * @param {*} aCenterPosition 模型中心点坐标
   * @param {*} animate 是否动画
   * @param {*} speed 速度
   * @param {*} cb 回调
   */
  setModelPosition = (
    aCameraPosition = { x: 0, y: 0, z: 0 },
    aCenterPosition = { x: 0, y: 0, z: 0 },
    animate = false,
    speed = 0.5,
    cb = null
  ) => {
    if (!this.ssthreeObject.threeCamera) {
      return;
    }
    if (!animate) {
      if (this.ssthreeObject.threeCamera instanceof THREE.Camera) {
        this.ssthreeObject.threeCamera.position.set(
          aCameraPosition.x,
          aCameraPosition.y,
          aCameraPosition.z
        );
      }
      if (this.ssthreeObject.threeOrbitControl instanceof OrbitControls) {
        const center = new THREE.Vector3(aCenterPosition.x, aCenterPosition.y, aCenterPosition.z);
        this.ssthreeObject.threeOrbitControl.target.set(center.x, center.y, center.z);
        this.ssthreeObject.threeOrbitControl.update();
      }
    } else {
      //
      const startPoint = {
        camera_x: this.ssthreeObject.threeCamera.position.x,
        camera_y: this.ssthreeObject.threeCamera.position.y,
        camera_z: this.ssthreeObject.threeCamera.position.z,
        orbitControl_x: this.ssthreeObject.threeOrbitControl.target.x,
        orbitControl_y: this.ssthreeObject.threeOrbitControl.target.y,
        orbitControl_z: this.ssthreeObject.threeOrbitControl.target.z
      };
      const endPoint = {
        camera_x: aCameraPosition.x,
        camera_y: aCameraPosition.y,
        camera_z: aCameraPosition.z,
        orbitControl_x: aCenterPosition.x,
        orbitControl_y: aCenterPosition.y,
        orbitControl_z: aCenterPosition.z
      };
      this.useTweenAnimate(
        startPoint,
        endPoint,
        (e) => {
          this.ssthreeObject.threeCamera.position.set(e.camera_x, e.camera_y, e.camera_z);
          this.ssthreeObject.threeOrbitControl.target.set(
            e.orbitControl_x,
            e.orbitControl_y,
            e.orbitControl_z
          );
          this.ssthreeObject.threeOrbitControl.update();
        },
        speed,
        cb?.()
      );
    }
  };

  /**
   * gui debug
   * @param {*} aCamera
   */
  #addGui = () => {
    this.threeGUI.bindThreeJs(this);
    this.threeGUI.setup();
  };

  /**
   * dynamic debug
   */
  addDymaicDebug = () => {
    this.#addAxisControl(this.ssthreeObject.threeScene, this.ssthreeObject.threeCamera);
    this.#addStatAnalyse();
    this.#addGui();
    window.ssthreeJs = this;
    window.ssthreeObject = this.ssthreeObject;
    window.THREE = THREE;
    // window.ssthreeObject.threeCamera.setFov = (aValue) => {
    //   aCamera.fov = aValue;
    //   aCamera.updateProjectionMatrix();
    // };
    // window.ssthreeObject.threeCamera.setFocus = (aValue) => {
    //   aCamera.focus = aValue;
    //   aCamera.updateProjectionMatrix();
    // };
  };

  /**
   * remove debug
   */
  removeDymaicDebug = () => {
    this.#removeStatAnalyse();
    this.#removeAxisControl();
    if (this.threeGUI) {
      this.threeGUI.destroy();
      this.threeGUI = null;
    }
    window.ssthreeJs = null;
    window.THREE = null;
    window.ssthreeObject = null;
  };

  /**
   * v1.0方案 根据配置文件加载模型
   * @param {*} aStep 加载步骤条
   * @param {*} aCallBack 回调调用方法 param1：当前类型，item：
   * @returns
   */
  // loadModelByJson = (aStep, aCallBack = () => {}) => {
  //   if (aStep === undefined) {
  //     return;
  //   }
  //   const promiseall = [];
  //   for (let index = 0; index < aStep.models.length; index++) {
  //     const model = aStep.models[index];
  //     switch (model.type) {
  //       case 'obj': // obj文件
  //         promiseall.push(this.loadObj(model.obj, model.mtl, false));
  //         break;
  //       case 'fbx': // fbx文件
  //         promiseall.push(this.loadFbx(model.fbx, false));
  //         break;
  //       case 'gltf': // 不压缩gltf文件
  //         promiseall.push(this.loadGltf(model.gltf, false));
  //         break;
  //       case 'draco': // draco 压缩gltf文件
  //         promiseall.push(this.loadGltfDraco(model.draco, false));
  //         break;
  //       case 'opt': // opt ktx 压缩gltf文件
  //         promiseall.push(this.loadGltfOptKTX(model.opt, false));
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  //   Promise.all(promiseall)
  //     .then((objs) => {
  //       objs.forEach((e) => {
  //         this.ssthreeObject.threeScene.add(e);
  //       });
  //       aCallBack?.(aStep, objs);
  //       if (aStep.nextStep) {
  //         this.loadModelByJson(aStep.nextStep, aCallBack);
  //       }
  //     })
  //     .catch((e) => console.error(e));
  // };

  /**
   * v2.0方案 根据配置文件加载模型
   * @param {Array<{type: string, obj: string, mtl: string, gltf: string, draco:string}>} list 模型配置
   * @param {func} complete 页面熏染完成 参数：全部模型
   * @param {func} beforeRender 场景添加前 参数：(对象条目, 模型)
   * @param {func} afterRender 场景添加后 参数：(对象条目, 模型)
   * @param {number} maxQueueCount min>1 , default = 3
   * @returns
   */
  loadModelQueue = (
    list = [],
    onComplete = () => {},
    onBeforeRender = () => {},
    onAfterRender = () => {},
    maxQueueCount = 3
  ) => {
    if (list.length === 0) {
      return;
    }
    let queueIndex = 0;
    const modelqueue = {};
    const objList = [];
    const resuseBlock = () => {
      // has destoryed
      if (this.#threeJsDestoryed) {
        return;
      }
      //
      if (queueIndex !== 0 && Object.getOwnPropertyNames(modelqueue).length === 0) {
        onComplete?.(objList);
        return;
      }
      if (queueIndex >= list.length) {
        return;
      }
      const model = list[queueIndex];
      let promise = Promise.resolve();
      switch (model.type) {
        case 'obj':
          // promise = this.loadObj(model.obj, model.mtl, false);
          promise = SSLoader.loadObj(
            model.obj,
            model.mtl,
            null,
            LoadingManager.shareInstance.threeLoadingManager
          );
          break;
        case 'fbx':
          promise = this.loadFbx(model.fbx);
          break;
        case 'gltf':
          promise = this.loadGltf(model.gltf);
          break;
        case 'draco':
          promise = this.loadGltfDraco(model.draco);
          break;
        case 'opt':
          promise = this.loadGltfOptKTX(model.opt);
          break;
        default:
          break;
      }
      const symbol = `${queueIndex} model`;
      modelqueue[symbol] = promise;
      promise
        .then((obj) => {
          onBeforeRender?.(model, obj);
          if (obj instanceof THREE.Object3D) {
            this.ssthreeObject.threeScene.add(obj);
          } else if (obj.scene instanceof THREE.Object3D) {
            this.ssthreeObject.threeScene.add(obj.scene);
          }

          onAfterRender?.(model, obj);
          objList.push(obj);
          delete modelqueue[symbol];
          if (Object.getOwnPropertyNames(modelqueue).length < maxQueueCount) {
            queueIndex += 1;
            resuseBlock();
          }
        })
        .catch((e) => {
          console.error('load model error', e);
          delete modelqueue[symbol];
          if (Object.getOwnPropertyNames(modelqueue).length < maxQueueCount) {
            queueIndex += 1;
            resuseBlock();
          }
        });
      if (
        Object.getOwnPropertyNames(modelqueue).length < maxQueueCount &&
        list.length > queueIndex + 1
      ) {
        queueIndex += 1;
        resuseBlock();
      }
    };
    resuseBlock();
  };

  // /**
  //  * load obj
  //  * @param {string} aObjPath obj path
  //  * @param {string} aMaterialPath material path
  //  * @param {boolean} addToScene shadow shadow
  //  * @returns {Promise<THREE.Group>}
  //  */
  // loadObj = (aObjPath = '', aMaterialPath = '', addToScene = true) => {
  //   const getDirectoryText = (aPath = '') => {
  //     const baseDirectoryArry = aPath.split('/');
  //     baseDirectoryArry.pop();
  //     return `${baseDirectoryArry.join('/')}/`;
  //   };
  //   return LoadingManager.shareInstance.getModelDataByUrl(aMaterialPath).then((materialdata) => {
  //     const mtlloader = new MTLLoader(LoadingManager.shareInstance.threeLoadingManager);
  //     const mtltext = String.fromCharCode.apply(null, new Uint8Array(materialdata));
  //     const materials = mtlloader.parse(mtltext, getDirectoryText(aMaterialPath));
  //     return LoadingManager.shareInstance.getModelDataByUrl(aObjPath).then((objdata) => {
  //       const objloader = new OBJLoader(LoadingManager.shareInstance.threeLoadingManager);
  //       objloader.setMaterials(materials);
  //       const group = objloader.parse(objdata);
  //       if (addToScene) {
  //         this.ssthreeObject.threeScene.add(group);
  //       }
  //       return group;
  //     });
  //   });
  // };

  /**
   * 获取模型路径目录
   * @returns
   */
  getModelDirectory = (aPath = '') => {
    const baseDirectory = aPath.split('/');
    baseDirectory.pop();
    const directory = `${baseDirectory.join('/')}/`;
    return directory;
  };

  /**
   * load fbx
   * @param {string} aFbxpath fbx path
   * @param {string} addToScene add to scene
   * @returns {Promise<THREE.Group>}
   */
  loadFbx = (aFbxpath = '') =>
    LoadingManager.shareInstance
      .getModelDataByUrl(aFbxpath)
      .then((data) =>
        SSLoader.loadFbxBuffer(
          data,
          this.getModelDirectory(aFbxpath),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param {string} path model path
   * @param {THREE.LoadingManager} manager loading manager
   * @returns {Promise<GLTF>}
   */
  loadGltf = (path) =>
    LoadingManager.shareInstance
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfBuffer(
          data,
          this.getModelDirectory(path),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param {*} path
   * @returns
   */
  loadGltfDraco = (path) =>
    LoadingManager.shareInstance
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfDracoBuffer(
          data,
          this.getModelDirectory(path),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param {*} path
   * @returns
   */
  loadGltfOptKTX = (path) =>
    LoadingManager.shareInstance
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfOptKTXBuffer(
          data,
          this.getModelDirectory(path),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );

  /**
   * add orbitControl
   * @param {*} aContainer
   * @returns
   */
  #addOrbitControl = (aCamera = new THREE.Camera(), aDomElement = document.getElementById()) => {
    const control = new OrbitControls(aCamera, aDomElement);
    this.ssthreeObject.threeOrbitControl = control;
    control.enablePan = true;
    control.autoRotate = false;
  };

  /**
   * remove orbitControl
   */
  #removeOrbitControl = () => {
    if (this.ssthreeObject.threeOrbitControl !== null) {
      this.ssthreeObject.threeOrbitControl.dispose();
      this.ssthreeObject.threeOrbitControl = null;
    }
  };

  /**
   * create axis helper
   * @param {*} aContainer
   * @returns
   */
  #addAxisControl = (
    aScene = this.ssthreeObject.threeScene,
    aCamera = this.ssthreeObject.threeCamera
  ) => {
    const axis = new THREE.AxesHelper(100);
    aScene.add(axis);
    this.#axisControlHelper = axis;

    const cameraaxishelper = new THREE.CameraHelper(aCamera);
    aScene.add(cameraaxishelper);
    this.#cameraHelper = cameraaxishelper;

    const directlighthelper = new THREE.DirectionalLightHelper(
      this.threeDirectionLight,
      5,
      '#FF6A6A'
    );
    aScene.add(directlighthelper);
    this.#directLightHelper = directlighthelper;
  };

  /**
   * remove axis helper
   */
  #removeAxisControl = () => {
    if (this.#axisControlHelper !== null) {
      this.#axisControlHelper.dispose();
      this.#axisControlHelper = null;
    }
    if (this.#cameraHelper !== null) {
      this.#cameraHelper.dispose();
      this.#cameraHelper = null;
    }
    if (this.#directLightHelper !== null) {
      this.#directLightHelper.dispose();
      this.#directLightHelper = null;
    }
  };

  /**
   * add observer
   */
  #addResizeOBserver = (
    aContainer = document.body,
    aGlRender = new THREE.WebGLRenderer(),
    aCamera = new THREE.Camera()
  ) => {
    const observer = new window.ResizeObserver(() => {
      const ascale = aContainer.offsetWidth / aContainer.offsetHeight;
      if (aCamera.isPerspectiveCamera) {
        aCamera.aspect = ascale;
      } else {
        const s = 100;
        aCamera.left = -ascale * s;
        aCamera.right = ascale * s;
        aCamera.top = s;
        aCamera.bottom = -s;
      }
      aCamera.updateProjectionMatrix(); // 手动更新相机的投影矩阵
      // 调整画布
      aGlRender.setSize(aContainer.offsetWidth, aContainer.offsetHeight);
    });
    observer.observe(aContainer);
    this.#resizeObserver = observer;
  };

  /**
   * remove observer
   * @param {*} aContainer
   * @returns
   */
  #removeResizeOBserver = () => {
    if (this.#resizeObserver !== null) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  };

  /**
   * add stats
   */
  #addStatAnalyse = (aContainer = this.ssthreeObject.threeContainer) => {
    const stats = new Stats();
    this.#statsJs = stats;
    stats.showPanel(0);
    aContainer.appendChild(stats.domElement);
    stats.domElement.style.top = '';
    stats.domElement.style.bottom = '0px';
    this._fpsFrame = ThreeLoop.add(() => {
      stats.update();
    }, 'fps render');
  };

  /**
   * remove stats
   */
  #removeStatAnalyse = () => {
    if (this.#statsJs !== null) {
      this.#statsJs.domElement.remove();
      this.#statsJs.end();
      this.#statsJs = null;
      ThreeLoop.removeId(this._fpsFrame);
    }
  };

  /**
   * 根据二维坐标 拾取模型数据
   * @param {{x: number, y:number}} aPoint 点位信息
   * @param {Array<string>} ignoreMeshNames 忽略的材质名称
   * @param {Array<THREE.Object3D>} targetObject3Ds 目标模型
   * @param {HTMLElement} domElement 画布
   * @param {THREE.Camera} sceneCamera 场景相机
   * @returns
   */
  getModelsByPoint = (
    aPoint = { x: 0, y: 0 },
    ignoreMeshNames = [],
    targetObject3Ds = this.ssthreeObject.threeScene.children
  ) => {
    if (!this.ssthreeObject.threeContainer || !this.ssthreeObject.threeCamera) {
      return [];
    }
    if (!targetObject3Ds) {
      return [];
    }
    const x =
      ((aPoint.x - this.ssthreeObject.threeContainer.getBoundingClientRect().left) /
        this.ssthreeObject.threeContainer.offsetWidth) *
        2 -
      1; // 规范设施横坐标
    const y =
      -(
        (aPoint.y - this.ssthreeObject.threeContainer.getBoundingClientRect().top) /
        this.ssthreeObject.threeContainer.offsetHeight
      ) *
        2 +
      1; // 规范设施纵坐标
    const standardVector = new THREE.Vector3(x, y, 1); // 规范设施坐标
    const worldVector = standardVector.unproject(this.ssthreeObject.threeCamera);
    const ray = worldVector.sub(this.ssthreeObject.threeCamera.position).normalize();
    const raycaster = new THREE.Raycaster(this.ssthreeObject.threeCamera.position, ray);
    raycaster.camera = this.ssthreeObject.threeCamera;
    let models = raycaster.intersectObjects(targetObject3Ds, true);
    //
    const commonMeshTypes = [
      'CameraHelper',
      'AxesHelper',
      'Line',
      'Line2',
      'Line3',
      'TransformControls',
      'DirectionalLightHelper'
    ];
    const commonMeshNames = ['可视域视锥体'];
    const checkMeshNameFunc = (aMesh) => {
      if (commonMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      if (ignoreMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      if (ignoreMeshNames.indexOf(SSThreeTool.getOriginMesh(aMesh)?.name) !== -1) {
        return false;
      }
      return true;
    };
    models = models.filter(
      (item) =>
        commonMeshTypes.indexOf(item.object.type) === -1 &&
        item.object.visible === true &&
        checkMeshNameFunc(item.object)
    );
    return models;
  };

  /**
   * 根据二维坐标 拾取模型数据
   * @param {{x: number, y:number}} aPoint 点位信息
   * @param {Array<string>} ignoreMeshNames 忽略的材质名称
   * @param {Array<THREE.Object3D>} targetObject3Ds 目标模型
   * @param {HTMLElement} domElement 画布
   * @param {THREE.Camera} sceneCamera 场景相机
   * @returns
   */
  static getModelsByPoint = (
    aPoint = { x: 0, y: 0 },
    ignoreMeshNames = [],
    targetObject3Ds = this.ssthreeObject.threeScene.children,
    domElement = this.ssthreeObject.threeContainer,
    sceneCamera = this.ssthreeObject.threeCamera
  ) => {
    if (!domElement || !sceneCamera) {
      return [];
    }
    if (!targetObject3Ds) {
      return [];
    }
    const x =
      ((aPoint.x - domElement.getBoundingClientRect().left) / domElement.offsetWidth) * 2 - 1; // 规范设施横坐标
    const y =
      -((aPoint.y - domElement.getBoundingClientRect().top) / domElement.offsetHeight) * 2 + 1; // 规范设施纵坐标
    const standardVector = new THREE.Vector3(x, y, 1); // 规范设施坐标
    const worldVector = standardVector.unproject(sceneCamera);
    const ray = worldVector.sub(sceneCamera.position).normalize();
    const raycaster = new THREE.Raycaster(sceneCamera.position, ray);
    raycaster.camera = sceneCamera;
    let models = raycaster.intersectObjects(targetObject3Ds, true);
    //
    const commonMeshTypes = [
      'CameraHelper',
      'AxesHelper',
      'Line',
      'Line2',
      'Line3',
      'TransformControls',
      'DirectionalLightHelper'
    ];
    const commonMeshNames = ['可视域视锥体'];
    const checkMeshNameFunc = (aMesh) => {
      if (commonMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      if (ignoreMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      if (ignoreMeshNames.indexOf(SSThreeTool.getOriginMesh(aMesh)?.name) !== -1) {
        return false;
      }
      return true;
    };
    models = models.filter(
      (item) =>
        commonMeshTypes.indexOf(item.object.type) === -1 &&
        item.object.visible === true &&
        checkMeshNameFunc(item.object)
    );
    return models;
  };

  /**
   * set mesh opacity
   * @param {number} aOpacity opacity  range:[0,1]
   * @param {Array<string>} meshNames material names defaut all
   * @param {THREE.Object3D} targetObject3D target object
   */
  setOpacity = (aOpacity = 0.5, meshNames = [], targetObject3D = this.ssthreeObject.threeScene) => {
    const setMeshTransparent = (aMesh) => {
      if (aMesh instanceof THREE.Mesh) {
        let materialChildren = aMesh.material;
        if (materialChildren instanceof THREE.Material) {
          materialChildren = [materialChildren];
        }
        for (let index = 0; index < materialChildren.length; index++) {
          const material = materialChildren[index];
          if (material instanceof THREE.Material) {
            material.transparent = aOpacity !== 1;
            material.opacity = aOpacity;
          }
        }
      }
    };
    if (meshNames.length === 0) {
      targetObject3D.traverse((e) => {
        setMeshTransparent(e);
      });
    }
    //
    meshNames.forEach((mesh) => {
      const obj = targetObject3D.getObjectByName(mesh);
      obj.traverse((e) => {
        setMeshTransparent(e);
      });
    });
  };

  /**
   * set mesh visible
   * @param {number} aVisible 可见  range:[0,1]
   * @param {Array<string} meshNames material names defaut all
   * @param {THREE.Object3D} targetObject3D 目标object3d
   */
  setVisible = (
    aVisible = true,
    meshNames = [],
    targetObject3D = this.ssthreeObject.threeScene
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
      targetObject3D.traverse((e) => {
        e.visible = resetVisible;
      });
    };
    resetAllObj(meshNames.length > 0 ? !aVisible : aVisible);
    if (meshNames.length === 0) {
      return;
    }
    //
    meshNames.forEach((e) => {
      const obj = targetObject3D.getObjectByName(e);
      setObjVisible(obj);
    });
  };

  /**
   * zoom
   * @param {number} aValue 放大缩小的倍数
   */
  zoom = (aValue = 1) => {
    if (this.ssthreeObject.threeCamera instanceof THREE.PerspectiveCamera) {
      this.useTweenAnimate(
        {
          zoom: this.ssthreeObject.threeCamera.zoom
        },
        {
          zoom: this.ssthreeObject.threeCamera.zoom * aValue
        },
        (e) => {
          this.ssthreeObject.threeCamera.zoom = e.zoom;
          this.ssthreeObject.threeCamera.updateProjectionMatrix();
        },
        0.5
      );
    }
  };

  /**
   * zoom reset
   * @returns
   */
  zoomReset = () => {
    if (this.ssthreeObject.threeCamera instanceof THREE.PerspectiveCamera) {
      if (this.ssthreeObject.threeCamera.zoom === 1) {
        return;
      }
      this.useTweenAnimate(
        {
          zoom: this.ssthreeObject.threeCamera.zoom
        },
        {
          zoom: 1
        },
        (e) => {
          this.ssthreeObject.threeCamera.zoom = e.zoom;
          this.ssthreeObject.threeCamera.updateProjectionMatrix();
        }
      );
    }
  };

  /**
   * 模型爆炸效果 ，距离中心线等距离增加长度
   * @param {number} aNumber 爆炸比例
   * @param {boolean} aReset 是否复位
   */
  splitModel = (aNumber = 0.5, aReset = false) => {
    if (this.ssthreeObject.threeScene instanceof THREE.Scene) {
      const startPoint = {};
      const endPoint = {};
      const objs = {};
      this.ssthreeObject.threeScene.traverse((aObj) => {
        if (aObj instanceof THREE.Mesh) {
          const postion = aObj.position.clone();
          objs[aObj.name] = aObj;
          startPoint[`${aObj.name}_x`] = postion.x;
          startPoint[`${aObj.name}_y`] = postion.y;
          startPoint[`${aObj.name}_z`] = postion.z;
          postion.multiplyScalar(aReset ? 1 / aNumber : aNumber);
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
    }
  };

  /**
   * tween animate
   */
  useTweenAnimate = (
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
      // tweenAnimate.stop();
      TWEEN.remove(tweenAnimate);
      ThreeLoop.removeId(_animateFrameRef);
    });
    tweenAnimate.onComplete(() => {
      // tweenAnimate.stop();
      // TWEEN.remove(tweenAnimate);
      ThreeLoop.removeId(_animateFrameRef);
      onComplete();
    });
    tweenAnimate.easing(TWEEN.Easing.Linear.None);
    tweenAnimate.start();

    _animateFrameRef = ThreeLoop.add(() => {
      if (tweenAnimate.isPlaying()) {
        TWEEN.update();
      }
    }, '标准 tweeen render');
  };

  /**
   * 将屏幕坐标转化为世界坐标 <目前不是很准确>
   */
  transformPositionToVector3 = (aPoint = { x: 0, y: 0 }) => {
    const canvas = this.ssthreeObject.threeContainer;
    const mousex = ((aPoint.x - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1;
    const mousey = -((aPoint.y - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1;
    const sdvector = new THREE.Vector3(mousex, mousey, 0.5);
    const worldVector = sdvector.unproject(this.ssthreeObject.threeCamera);
    return worldVector;
  };

  /**
   * 设置物体其他颜色
   * @param {Array<string} meshNames 材质物体
   * @param { string | number} materialColor color
   * @param {THREE.Object3D} targetObject3D object
   * @returns
   */
  setMeshColorByNames = (
    meshNames = [],
    materialColor = '#DDFF00',
    targetObject3D = this.ssthreeObject.threeScene
  ) => {
    if (meshNames.length === 0) {
      return;
    }
    const changeMaterials = (aMaterials = []) =>
      aMaterials.map((e) => {
        const newMaterial = e.clone();
        newMaterial.color = new THREE.Color(materialColor);
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
    for (let index = 0; index < meshNames.length; index++) {
      const meshName = meshNames[index];
      const obj3d = targetObject3D.getObjectByName(meshName);
      obj3d.traverse((e) => {
        setMesh(e);
      });
    }
  };

  /**
   * 重置物体颜色
   * @param {Array<string} meshNames 一组meshname
   * @param {THREE.Object3D} targetObject3D
   * @returns
   */
  resetMeshNames = (meshNames = [], targetObject3D = this.ssthreeObject.threeScene) => {
    if (meshNames.length === 0) {
      return;
    }
    const setMesh = (mesh) => {
      if (mesh instanceof THREE.Mesh) {
        if (mesh.userData?.originMaterials) {
          mesh.material = mesh.userData.originMaterials;
        }
      }
    };
    if (!(targetObject3D instanceof THREE.Object3D)) {
      return;
    }
    for (let index = 0; index < meshNames.length; index++) {
      const meshName = meshNames[index];
      const obj3d = targetObject3D.getObjectByName(meshName);
      obj3d.traverse((e) => {
        setMesh(e);
      });
    }
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

  // /**
  //  * 判断obj是否是gltf拆分的子物体并返回原模型obj
  //  * @param {点击的obj} castObj
  //  * @returns
  //  */
  // getGltfParObj = (castObj) => {
  //   const s = castObj.name;
  //   // 后缀
  //   const ext = s.substr(s.lastIndexOf('_') + 1);
  //   // 判断后缀是否是数字,如果是,
  //   const isNumber = !Number.isNaN(Number(ext));
  //   if (isNumber) {
  //     // 获取模型拆分物体的原模型
  //     if (castObj.parent === null) {
  //       return castObj;
  //     }
  //     return castObj.parent;
  //   }
  //   return castObj;
  // };

  // createOptions = (points = []) => {
  //   // const points = [
  //   //   new THREE.Vector3(0, 50, 0),
  //   //   new THREE.Vector3(50, 50, 0),
  //   //   new THREE.Vector3(80, 40, 0),
  //   //   new THREE.Vector3(80, 40, -20)
  //   //   // new Vector3(0, 40, 0),
  //   //   // new Vector3(-40, 40, 50),
  //   // ];
  //   const curvePath = new THREE.CurvePath();
  //   for (let i = 0; i < points.length - 1; i++) {
  //     curvePath.add(new THREE.LineCurve3(points[i], points[i + 1]));
  //   }

  //   const options = {
  //     steps: 1000,
  //     bevelEnabled: false,
  //     bevelThickness: 1,
  //     extrudePath: curvePath
  //   };
  //   return { options, curvePath };
  // };

  // createShapes = () => {
  //   const points = [];
  //   // points.push(new THREE.Vector2(+0.5, -0.5));
  //   // points.push(new THREE.Vector2(+0.5, +0.5));
  //   points.push(new THREE.Vector2(+0.5, +0.5));
  //   points.push(new THREE.Vector2(-0.5, +0.5));
  //   const shapes = new THREE.Shape(points);
  //   return shapes;
  // };

  // 创建管道
  createOptionss = (points, material) => {
    let curvePath = null;
    let options = null;
    const pro = this.createOptions(points);
    curvePath = pro.curvePath;
    options = pro.options;
    const geometry1 = new THREE.ExtrudeBufferGeometry(this.createShapes(), options);

    // // ExtrudeBufferGeometry转换BufferGeometry
    const geometry = new THREE.BufferGeometry();
    const verticesByThree = geometry1.attributes.position.array;
    // 4. 设置position
    geometry.setAttribute('position', new THREE.BufferAttribute(verticesByThree, 3));
    // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]
    // 5.1 以18个顶点为单位分组
    const pointsGroupBy18 = new Array(verticesByThree.length / 3 / 6)
      .fill(0)
      .map((_, i) => verticesByThree.slice(i * 3 * 6, (i + 1) * 3 * 6));
    // 5.2 按uv周期分组
    const pointsGroupBy63 = pointsGroupBy18.map((item) =>
      new Array(item.length / 3).fill(0).map((_, i) => item.slice(i * 3, (i + 1) * 3))
    );
    // 5.3根据BoundingBox确定uv平铺范围
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    const rangeX = max.x - min.x;
    const uvs = [].concat(
      ...pointsGroupBy63.map((item) => {
        const point0 = item[0];
        const point5 = item[5];
        const distance =
          new THREE.Vector3(...point0).distanceTo(new THREE.Vector3(...point5)) / (rangeX / 10);
        return [0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1];
      })
    );
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    // const meshMat =
    //   material ||
    //   new THREE.MeshBasicMaterial({
    //     color: 0x00ffff,
    //     side: THREE.DoubleSide
    //   });

    // this.assignUVs(geometry);
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0x00ff00,
    //   wireframe: false
    // });
    const mesh = new THREE.Mesh(geometry, material);
    // const mesh = new THREE.Mesh(geometry, material);
    // this.ssthreeObject.threeScene.add(mesh);
    return { mesh, curvePath };
  };
}
