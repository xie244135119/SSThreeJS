import * as THREE from 'three';
import Stats from 'stats.js';
import WEBGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import SSThreeLoop from './SSThreeLoop';
import SSDispose from './SSDispose';
import SSEvent from './SSEvent';
import SSThreeObject from './SSThreeObject';
import SSLoader from './SSLoader';
import SSModuleCenter from './SSModule';
import SSMessageQueue from './SSTool/MessageQueue';
import SSTransformControl from './SSTool/TransformControl';
import SSPostProcessModule from './SSModule/basepostprocess.module';
import SSLoadingManager from './SSTool/LoadingManager';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { SSModelQueueItem } from './types';

export default class SSThreeJs {
  /**
   * @description 场景存储类
   */
  ssThreeObject: SSThreeObject = null;

  /**
   * @description 模块中心
   */
  ssModuleCenter: SSModuleCenter = null;

  /**
   *@description  消息队列
   */
  ssMessageQueue: SSMessageQueue = null;

  /**
   * @description 位置调试工具
   */
  ssTransformControl: SSTransformControl = null;

  /**
   * @description 基础后处理
   */
  ssPostProcessModule: SSPostProcessModule = null;

  /**
   * @description 基础场景
   */
  threeScene: THREE.Scene = null;

  /**
   * @description 默认相机
   */
  threeCamera: THREE.PerspectiveCamera = null;

  /**
   * @description 环境光
   */
  threeAmbientLight: THREE.AmbientLight = null;

  /**
   * @description webgl渲染器
   */
  threeRenderer: THREE.WebGLRenderer = null;

  /**
   * @description 事件系统
   */
  threeEvent: SSEvent = null;

  /**
   * @description ssthreejs 加载器
   */
  ssLoadingManager: SSLoadingManager = null;

  /**
   * @description 坐标系辅助线
   */
  _axisControlHelper = null;

  /**
   * @description 统计器
   */
  _statsJs: Stats = null;

  /**
   * 销毁机制
   */
  destroy(loop: boolean = true) {
    this.ssTransformControl?.destory();
    this.ssTransformControl = null;
    this.ssThreeObject?.destory();
    this.ssMessageQueue?.destory();
    this.ssMessageQueue = null;
    this.ssLoadingManager?.destory();
    this.ssLoadingManager = null;
    if (loop) {
      SSThreeLoop.destory();
    }

    this.ssModuleCenter?.destroy();
    this.ssModuleCenter = null;

    this._removeOrbitControl();

    this.threeEvent.destory();
    this.threeEvent = null;

    if (this.threeScene !== null) {
      SSDispose.dispose(this.threeScene);
      if (this.threeRenderer.info.programs.length !== 0) {
        console.log('scene material has not released', this.threeRenderer.info);
      } else if (this.threeRenderer.info.memory.geometries) {
        console.log('scene geometries has not released', this.threeRenderer.info);
      } else if (this.threeRenderer.info.memory.textures) {
        console.log('scene textures has not released', this.threeRenderer.info);
      }
    }
    if (this.threeRenderer !== null) {
      this.threeRenderer.dispose();
      this.threeRenderer.forceContextLoss();
      this.ssThreeObject.threeContainer.removeChild(this.threeRenderer.domElement);
    }
  }

  /**
   * 场景初始化
   * @param aCanvasElement canvasid 或 element
   */
  setup = (aCanvasElement: string | HTMLElement) => {
    let container = null;
    if (typeof aCanvasElement === 'string') {
      const element = document.getElementById(aCanvasElement);
      container = element;
    } else if (aCanvasElement instanceof HTMLElement) {
      container = aCanvasElement;
    }
    if (!(container instanceof HTMLElement)) {
      return null;
    }

    if (!WEBGL.isWebGLAvailable()) {
      const warning = WEBGL.getWebGLErrorMessage();
      container.appendChild(warning);
      return null;
    }

    // scene
    const scene = new THREE.Scene();
    this.threeScene = scene;
    const aspect = container.offsetWidth / container.offsetHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 20000);
    camera.position.set(10, 10, 10);
    this.threeCamera = camera;
    // webgl render
    const render = this._addRender();
    container.append(render.domElement);
    this.threeRenderer = render;

    // ambient light
    const ambientlight = new THREE.AmbientLight(new THREE.Color(0xffffff), 1);
    scene.add(ambientlight);
    this.threeAmbientLight = ambientlight;

    // keyboard orbitcontrol
    const control = this._addOrbitControl(camera, container);
    // add event
    this.threeEvent = new SSEvent(container);
    // loading manager
    this.ssLoadingManager = new SSLoadingManager(container);
    //
    SSThreeLoop.setup();
    //
    this.ssThreeObject = new SSThreeObject({
      container,
      scene,
      camera,
      control,
      renderer: render
    });
    // window resize
    this.ssThreeObject.autoWindowResize();
    // add webgl render
    this.ssThreeObject.renderLoop();
    // module center
    this.ssModuleCenter = new SSModuleCenter(this.ssThreeObject);
    // postprocess module
    this.ssPostProcessModule = new SSPostProcessModule(this.ssThreeObject);
    // 物体变换控制器
    this.ssTransformControl = new SSTransformControl(this.ssThreeObject);
    //
    SSThreeLoop.add(() => {
      if (this.ssThreeObject.threeOrbitControl) {
        this.ssThreeObject.threeOrbitControl.update();
      }
    }, 'control update');

    return scene;
  };

  /**
   * old sky box
   * @param {*} hdrs
   * @returns
   */
  addSkyOld = (skys = []) => {
    const pmremGenerator = new THREE.PMREMGenerator(this.threeRenderer);
    const hdrLoader = new THREE.CubeTextureLoader(this.ssLoadingManager.threeLoadingManager);
    return new Promise((reslove, reject) => {
      hdrLoader.load(
        skys,
        (texture) => {
          const cubetexure = pmremGenerator.fromCubemap(texture).texture;
          this.threeScene.environment = cubetexure;
          this.threeScene.background = cubetexure;
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
   *  new Sky
   */
  addSun = () => {
    // Skybox
    const sun = new THREE.Vector3();
    const sky = new Sky();
    sky.name = 'Sky';
    sky.scale.setScalar(10000);
    this.threeScene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = 10;
    skyUniforms.rayleigh.value = 2;
    skyUniforms.mieCoefficient.value = 0.005;
    skyUniforms.mieDirectionalG.value = 0.8;
    const parameters = {
      elevation: 10,
      azimuth: 76,
      turbidity: 0,
      rayleigh: 0.1,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8
    };

    const updateSun = () => {
      sky.material.uniforms.turbidity.value = parameters.turbidity;
      sky.material.uniforms.rayleigh.value = parameters.rayleigh;
      sky.material.uniforms.mieCoefficient.value = parameters.mieCoefficient;
      sky.material.uniforms.mieDirectionalG.value = parameters.mieDirectionalG;
      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);
      sun.setFromSphericalCoords(1, phi, theta);
      sky.material.uniforms.sunPosition.value.copy(sun);
      // water.material.uniforms['sunDirection'].value.copy(sun).normalize();
      // uniforms[ 'sunPosition' ].value.copy( sun );
      // renderer.toneMappingExposure = effectController.exposure;
      // renderer.render( scene, camera );
    };

    updateSun();
    return sky;
  };

  /**
   * addHdr
   * @param hdrs hdr材质
   */
  addHDR = (hdrs: string[]) => {
    const pmremGenerator = new THREE.PMREMGenerator(this.threeRenderer);
    if (hdrs.length === 1) {
      return new Promise((reslove, reject) => {
        const rgbeLoader = new RGBELoader(this.ssLoadingManager.threeLoadingManager);
        rgbeLoader.load(
          hdrs[0],
          (texture) => {
            const cubetexure = pmremGenerator.fromEquirectangular(texture).texture;
            this.threeScene.background = cubetexure;
            this.threeScene.environment = cubetexure;
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
    const hdrLoader = new HDRCubeTextureLoader(this.ssLoadingManager.threeLoadingManager);
    return new Promise((reslove, reject) => {
      hdrLoader.load(
        hdrs,
        (texture) => {
          const cubetexure = pmremGenerator.fromCubemap(texture).texture;
          this.threeScene.environment = cubetexure;
          this.threeScene.background = cubetexure;
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
  _addRender = () => {
    const render = new THREE.WebGLRenderer({
      antialias: true
      // alpha: true,
      // logarithmicDepthBuffer: true
    });
    render.shadowMap.enabled = true;
    render.shadowMap.type = THREE.PCFSoftShadowMap;
    render.setPixelRatio(window.devicePixelRatio);
    render.setClearColor('white', 0);
    render.autoClear = true;
    // 模拟、逼近高动态范围（HDR）效果 LinearToneMapping 为默认值，线性色调映射。
    // render.toneMapping = THREE.ACESFilmicToneMapping;
    // render.toneMappingExposure = 1;
    return render;
  };

  /**
   * dynamic debug
   */
  addDymaicDebug = () => {
    this._addAxisControl(this.threeScene);
    this._addStatAnalyse();
  };

  /**
   * remove debug
   */
  removeDymaicDebug = () => {
    this._removeAxisControl();
    this._removeStatAnalyse();
  };

  /**
   * v3.0方案 根据配置文件加载模型
   * @param list 模型配置
   * @param onComplete 页面熏染完成 参数：全部模型
   * @param onBeforeRender 场景添加前 参数：(对象条目, 模型)
   * @param onAfterRender 场景添加后 参数：(对象条目, 模型)
   * @returns
   */
  loadModelQueue = (
    list: SSModelQueueItem[],
    onComplete: (e: (THREE.Object3D | GLTF)[]) => void,
    onBeforeRender: (option: SSModelQueueItem, e: THREE.Object3D | GLTF) => void,
    onAfterRender: (option: SSModelQueueItem, e: THREE.Object3D | GLTF) => void
  ) => {
    if (list.length === 0) {
      onComplete?.([]);
      return;
    }
    if (this.ssMessageQueue === null) {
      this.ssMessageQueue = new SSMessageQueue();
    }
    const objList = [];
    list.forEach((config) => {
      let promise: Promise<any> = Promise.resolve();
      switch (config.type) {
        case 'obj':
          promise = SSLoader.loadObj(
            config.obj,
            config.mtl,
            null,
            this.ssLoadingManager.threeLoadingManager
          );
          break;
        case 'fbx':
          promise = this.loadFbx(config.fbx);
          break;
        case 'gltf':
          promise = this.loadGltf(config.gltf);
          break;
        case 'draco':
          promise = this.loadGltfDraco(config.draco);
          break;
        case 'opt':
          promise = this.loadGltfOptKTX(config.opt);
          break;
        default:
          break;
      }
      this.ssMessageQueue.add(() => {
        promise
          .then((obj) => {
            onBeforeRender?.(config, obj);
            if (obj instanceof THREE.Object3D) {
              obj.traverse((e) => {
                e.receiveShadow = true;
                e.castShadow = true;
              });
            } else if (obj.scene instanceof THREE.Object3D) {
              obj.scene.traverse((e) => {
                e.receiveShadow = true;
                e.castShadow = true;
              });
            }
            objList.push(obj);
            onAfterRender?.(config, obj);
            //
            this.ssMessageQueue?.remove();
          })
          .catch((e) => {
            console.log(' 模型渲染失败 ', config, e);
            this.ssMessageQueue?.remove();
          });
      });
    });
    this.ssMessageQueue.add(() => {
      onComplete?.(objList);
      this.ssMessageQueue.remove();
    });
  };

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
   * @param aFbxpath fbx path
   * @returns {Promise<THREE.Group>}
   */
  loadFbx = (aFbxpath: string) =>
    this.ssLoadingManager
      .getModelDataByUrl(aFbxpath)
      .then((data) =>
        SSLoader.loadFbxBuffer(
          data,
          this.getModelDirectory(aFbxpath),
          this.ssLoadingManager.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param path 路径
   */
  loadGltf: (path: string) => Promise<GLTF> = (path) =>
    this.ssLoadingManager
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfBuffer(
          data,
          this.getModelDirectory(path),
          this.ssLoadingManager.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param path 路径
   * @returns
   */
  loadGltfDraco = (path: string) =>
    this.ssLoadingManager
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfDracoBuffer(
          data,
          this.getModelDirectory(path),
          this.ssLoadingManager.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param path 路径
   * @returns
   */
  loadGltfOptKTX = (path: string) =>
    this.ssLoadingManager
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfOptKTXBuffer(
          data,
          this.getModelDirectory(path),
          this.ssLoadingManager.threeLoadingManager
        )
      );

  /**
   * add orbitControl
   * @param aCamera 摄像头
   * @param aDomElement dom元素
   * @returns
   */
  _addOrbitControl = (aCamera: THREE.Camera, aDomElement: HTMLElement) => {
    const control = new OrbitControls(
      aCamera || this.threeCamera,
      aDomElement || this.ssThreeObject.threeContainer
    );
    control.enableDamping = true;
    control.dampingFactor = 0.25;
    control.enableZoom = true;
    control.autoRotate = false;
    control.autoRotateSpeed = 2;
    control.minDistance = 2;
    control.maxDistance = 1000;
    control.enablePan = true;
    return control;
  };

  /**
   * remove orbitControl
   */
  _removeOrbitControl = () => {
    if (this.ssThreeObject.threeOrbitControl !== null) {
      this.ssThreeObject.threeOrbitControl.dispose();
      this.ssThreeObject.threeOrbitControl = null;
    }
  };

  /**
   * create axis helper
   * @returns
   */
  _addAxisControl = (aScene: THREE.Scene = this.threeScene) => {
    const axis = new THREE.AxesHelper(100);
    aScene.add(axis);
    this._axisControlHelper = axis;
  };

  /**
   * remove axis helper
   */
  _removeAxisControl = () => {
    if (this._axisControlHelper !== null) {
      this._axisControlHelper.dispose();
      this._axisControlHelper = null;
    }
  };

  /**
   * add stats
   */
  _addStatAnalyse = (aContainer: HTMLElement = this.ssThreeObject.threeContainer) => {
    const stats = new Stats();
    this._statsJs = stats;
    stats.showPanel(0);
    aContainer.appendChild(stats.dom);
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = 'unset';
    stats.dom.style.bottom = '0px';
    SSThreeLoop.add(() => {
      stats.update();
    }, 'fps render');
  };

  /**
   * remove stats
   */
  _removeStatAnalyse = () => {
    if (this._statsJs !== null) {
      this._statsJs.dom.remove();
      this._statsJs.end();
      this._statsJs = null;
      SSThreeLoop.removeId('fps render');
    }
  };

  /**
   * 射线检测
   * @param pointEvent 点击事件
   * @param targetObject3Ds 目标物体
   * @param ignoreMeshNames 忽略的物体
   * @returns
   */
  getModelsByPoint = (
    pointEvent: Event,
    targetObject3Ds?: THREE.Object3D[],
    ignoreMeshNames?: string[]
  ) => {
    return this.ssThreeObject.getModelsByPoint(pointEvent, targetObject3Ds, ignoreMeshNames);
  };

  /**
   * 设置视角位置
   * @param cameraPosition 相机位置
   * @param controlPosition 场景位置
   * @param animate 开启动画
   * @param animateSpeed 动画速度
   * @param complete 结束事件
   */
  setEye(
    cameraPosition: THREE.Vector3,
    controlPosition: THREE.Vector3,
    animate: boolean = true,
    animateSpeed = 0.5,
    complete?: () => void
  ) {
    this.ssThreeObject.setEye(cameraPosition, controlPosition, animate, animateSpeed, complete);
  }

  /**
   * 选择视角位置
   */
  getEye() {
    return this.ssThreeObject.getEye();
  }
}
