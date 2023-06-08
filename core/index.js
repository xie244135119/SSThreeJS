/*
 * Author  Kayson.Wan
 * Date  2022-09-08 23:28:58
 * LastEditors  Murphy.xie
 * LastEditTime  2023-06-08 16:15:23
 * Description
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Stats from 'stats.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { WEBGL } from 'three/examples/jsm/WebGL';
// import { DebugEnvironment } from 'three/examples/jsm/environments/DebugEnvironment';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import ThreeLoop from './threeLoop';
import ThreeDisposeQueue from './Dispose';
import ThreeEvent from './Event';
import ThreeControls from './Controls';
import PostProcess from './postProcess';
import ThreeGUI from './Gui/index';
import ThreeTool from './tool';
import ThreeCss2D from './css2d';
import LoadingManager from './plugin/loadingmanager';

class ThreeJs {
  // idenitifer
  id = '';

  // if update frame
  // isRender = true;

  // html container
  threeContainer = null;

  // scene
  threeScene = null;

  // camera
  threeCamera = null;

  // render
  threeRenderer = null;

  // direction light
  threeDirectionLight = null;

  // ambient light
  threeAmbientLight = null;

  // camera control
  threeOrbitControl = null;

  // three custom control
  threeControls = new ThreeControls();

  // gui
  threeGUI = new ThreeGUI();

  // postprocess
  threePostProcess = new PostProcess(this);

  // threeCss2D thress3D
  threeCss2D = new ThreeCss2D(this);

  // despose queue
  threeDisposeQueue = new ThreeDisposeQueue();

  // three event
  threeEvent = new ThreeEvent();

  // loading
  // #loadingManager = LoadingManager.shareInstance;

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

  // effectComposer
  #effectComposer = null;

  // has released
  #threeJsDestoryed = false;

  constructor(id) {
    this.id = id;
  }

  /**
   * 销毁机制
   */
  destroy(loop = true) {
    this.#threeJsDestoryed = true;
    if (loop) {
      ThreeLoop.destory();
    }
    // if (window.ENV.DEBUG) {
    this.#removeDymaicDebug();
    // }
    this.#removeResizeOBserver();
    this.#removeOrbitControl();
    this.threePostProcess.destroy();

    this.threeEvent.destory();
    this.threeEvent = null;

    this.threeCss2D.destory();
    this.threeCss2D = null;

    if (this.threeScene !== null) {
      this.threeDisposeQueue.dispose(this.threeScene);
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
      this.threeContainer.removeChild(this.threeRenderer.domElement);
    }
  }

  /**
   * dispose obj
   * @param {obj} obj
   */
  destroyObj = (obj) => {
    this.threeDisposeQueue.dispose(obj);
  };

  // Container初始化
  #getContainerDom = (aContainer) => {
    if (typeof aContainer === 'string') {
      const element = document.getElementById(aContainer);
      this.threeContainer = element;
      return element;
    }
    if (aContainer instanceof HTMLElement) {
      this.threeContainer = aContainer;
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
    this.threeScene = scene;
    const aspect = container.offsetWidth / container.offsetHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 20000);
    camera.position.set(10, 10, 10);
    this.threeCamera = camera;
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
    this.threeControls.bindThreeJs(this);
    this.threeControls.bindCamera(this.threeCamera, this.threeRenderer, this.threeScene);
    // keyboard orbitcontrol
    this.#addOrbitControl(camera, container);
    // page resize
    this.#addResizeOBserver(container, this.threeRenderer, camera);
    // add event
    this.threeEvent = new ThreeEvent(container);
    // loading manager
    LoadingManager.shareInstance.addProgressView(container);
    // share
    this.#effectComposer = this.threePostProcess.getEffectComposer();
    //
    ThreeLoop.setup();

    // dynamic debug
    // if (window.ENV.DEBUG) {
    this.#addDymaicDebug(camera);
    // }

    ThreeLoop.add(() => {
      // if (this.isRender) {
      if (this.#effectComposer && this.#effectComposer.passes.length > 0) {
        this.#effectComposer.render();
      } else {
        this.threeRenderer.render(scene, camera);
      }
      // }

      if (this.threeOrbitControl.autoRotate) {
        this.threeOrbitControl.update();
      }
    }, 'scene render');

    return scene;
  };

  /**
   * get camera eye
   */
  getEye = () => ({
    cameraPosition: this.threeCamera.position,
    scenePosition: this.threeOrbitControl.target
  });

  /**
   * sky box
   * @param {*} hdrs
   * @returns
   */
  addSky = (skys = []) => {
    const pmremGenerator = new THREE.PMREMGenerator(this.threeRenderer);
    const hdrLoader = new THREE.CubeTextureLoader(LoadingManager.shareInstance.threeLoadingManager);
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
   * addHdr
   */
  addHDR = (hdrs = []) => {
    const pmremGenerator = new THREE.PMREMGenerator(this.threeRenderer);
    if (hdrs.length === 1) {
      return new Promise((reslove, reject) => {
        const rgbeLoader = new RGBELoader(LoadingManager.shareInstance.threeLoadingManager);
        rgbeLoader.load(
          hdrs,
          (texture) => {
            const cubetexure = pmremGenerator.fromCubemap(texture).texture;
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
    const hdrLoader = new HDRCubeTextureLoader(LoadingManager.shareInstance.threeLoadingManager);
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
  #addRender = () => {
    this.threeRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    this.threeRenderer.shadowMap.enabled = true;
    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threeRenderer.setSize(this.threeContainer.clientWidth, this.threeContainer.clientHeight);
    this.threeRenderer.setPixelRatio(window.devicePixelRatio);
    this.threeRenderer.setClearColor('white', 0);
    this.threeContainer.appendChild(this.threeRenderer.domElement);
    this.threeRenderer.autoClear = true;
    this.threeRenderer.toneMapping = THREE.ACESFilmicToneMapping; // 模拟、逼近高动态范围（HDR）效果 LinearToneMapping 为默认值，线性色调映射。
    this.threeRenderer.toneMappingExposure = 1;
    this.threeRenderer.textureEncoding = THREE.sRGBEncoding; // LinearEncoding
    this.threeRenderer.outputEncoding = THREE.sRGBEncoding; // sRGBEncoding
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
    if (!this.threeCamera) {
      return;
    }
    if (!animate) {
      if (this.threeCamera instanceof THREE.Camera) {
        this.threeCamera.position.set(aCameraPosition.x, aCameraPosition.y, aCameraPosition.z);
      }
      if (this.threeOrbitControl instanceof OrbitControls) {
        const center = new THREE.Vector3(aCenterPosition.x, aCenterPosition.y, aCenterPosition.z);
        this.threeOrbitControl.target.set(center.x, center.y, center.z);
        this.threeOrbitControl.update();
      }
    } else {
      //
      const startPoint = {
        camera_x: this.threeCamera.position.x,
        camera_y: this.threeCamera.position.y,
        camera_z: this.threeCamera.position.z,
        orbitControl_x: this.threeOrbitControl.target.x,
        orbitControl_y: this.threeOrbitControl.target.y,
        orbitControl_z: this.threeOrbitControl.target.z
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
          this.threeCamera.position.set(e.camera_x, e.camera_y, e.camera_z);
          this.threeOrbitControl.target.set(e.orbitControl_x, e.orbitControl_y, e.orbitControl_z);
          this.threeOrbitControl.update();
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
  addGui = () => {
    this.threeGUI.bindThreeJs(this);
    this.threeGUI.setup();
  };

  /**
   * remove gui
   * @param {*} aCamera
   */

  /**
   * dynamic debug
   */
  #addDymaicDebug = (aCamera = this.threeCamera) => {
    this.#addAxisControl(this.threeScene, this.threeCamera);
    this.#addStatAnalyse();
    window.threeJs = this;
    window.threeCamera = this.threeCamera;
    window.THREE = THREE;
    window.threeRenderer = this.threeRenderer;
    window.threeAmbientLight = this.threeAmbientLight;
    window.threeDirectLight = this.threeDirectionLight;
    window.threeOrbitControl = this.threeOrbitControl;
    window.threeScene = this.threeScene;
    window.threeCamera.setPosition = (aPositionX, aPositionY, aPositionZ) => {
      this.threeCamera.position.set(aPositionX, aPositionY, aPositionZ);
      this.threeCamera.lookAt(new THREE.Vector3(0, 0, 0));
    };
    window.threeCamera.setFov = (aValue) => {
      aCamera.fov = aValue;
      aCamera.updateProjectionMatrix();
    };
    window.threeCamera.setNear = (aValue) => {
      aCamera.near = aValue;
      aCamera.updateProjectionMatrix();
    };
    window.threeCamera.setFar = (aValue) => {
      aCamera.far = aValue;
      aCamera.updateProjectionMatrix();
    };
    window.threeCamera.setZoom = (aValue) => {
      aCamera.zoom = aValue;
      aCamera.updateProjectionMatrix();
    };
    window.threeCamera.setFocus = (aValue) => {
      aCamera.focus = aValue;
      aCamera.updateProjectionMatrix();
    };
  };

  /**
   * remove debug
   */
  #removeDymaicDebug = () => {
    this.#removeStatAnalyse();
    this.#removeAxisControl();
    if (this.threeGUI) {
      this.threeGUI.destroy();
      this.threeGUI = null;
    }
    window.threeJs = null;
    window.THREE = null;
    window.threeCamera = null;
    window.threeRenderer = null;
    window.threeDirectLight = null;
    window.threeOrbitControl = null;
    window.threeAmbientLight = null;
    window.threeScene = null;
  };

  /**
   * v1.0方案 根据配置文件加载模型
   * @param {*} aStep 加载步骤条
   * @param {*} aCallBack 回调调用方法 param1：当前类型，item：
   * @returns
   */
  loadModelByJson = (aStep, aCallBack = () => {}) => {
    if (aStep === undefined) {
      return;
    }
    const promiseall = [];
    for (let index = 0; index < aStep.models.length; index++) {
      const model = aStep.models[index];
      switch (model.type) {
        case 'obj': // obj文件
          promiseall.push(this.loadObj(model.obj, model.mtl, false));
          break;
        case 'fbx': // fbx文件
          promiseall.push(this.loadFbx(model.fbx, false));
          break;
        case 'gltf': // 不压缩gltf文件
          promiseall.push(this.loadGltf(model.gltf, false));
          break;
        case 'draco': // draco 压缩gltf文件
          promiseall.push(this.loadGltfDraco(model.draco, false));
          break;
        case 'opt': // opt ktx 压缩gltf文件
          promiseall.push(this.loadGltfOptKTX(model.opt, false));
          break;
        default:
          break;
      }
    }
    Promise.all(promiseall)
      .then((objs) => {
        objs.forEach((e) => {
          this.threeScene.add(e);
        });
        aCallBack?.(aStep, objs);
        if (aStep.nextStep) {
          this.loadModelByJson(aStep.nextStep, aCallBack);
        }
      })
      .catch((e) => console.error(e));
  };

  /**
   * v2.0方案 根据配置文件加载模型
   * @param {*} list 模型配置
   * * @param {*} complete 页面熏染完成 参数：全部模型
   * @param {*} beforeRender 场景添加前 参数：(对象条目, 模型)
   * @param {*} afterRender 场景添加后 参数：(对象条目, 模型)
   * @param {*} maxQueueCount
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
        case 'obj': // obj文件
          promise = this.loadObj(model.obj, model.mtl, false);
          break;
        case 'fbx': // fbx文件
          promise = this.loadFbx(model.fbx, false);
          break;
        case 'gltf': // gltf
          promise = this.loadGltf(model.gltf, false);
          break;
        case 'draco': // draco
          promise = this.loadGltfDraco(model.draco, false);
          break;
        case 'opt': // optktx
          promise = this.loadGltfOptKTX(model.opt, false);
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
            this.threeScene.add(obj);
          } else if (obj.scene instanceof THREE.Object3D) {
            this.threeScene.add(obj.scene);
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
          console.log(' gltf加载出错 ', e);
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

  /**
   * load obj
   * @param {*} aObjPath obj path
   * @param {*} aMaterialPath material path
   * @param {*} aShadow shadow
   * @returns
   */
  loadObj = (aObjPath = '', aMaterialPath = '', addToScene = true) => {
    const getDirectoryText = (aPath = '') => {
      const baseDirectoryArry = aPath.split('/');
      baseDirectoryArry.pop();
      return `${baseDirectoryArry.join('/')}/`;
    };
    return LoadingManager.shareInstance.getModelDataByUrl(aMaterialPath).then((materialdata) => {
      const mtlloader = new MTLLoader(LoadingManager.shareInstance.threeLoadingManager);
      const mtltext = String.fromCharCode.apply(null, new Uint8Array(materialdata));
      const materials = mtlloader.parse(mtltext, getDirectoryText(aMaterialPath));
      materials.shading = THREE.FlatShading;
      return LoadingManager.shareInstance.getModelDataByUrl(aObjPath).then((objdata) => {
        const objloader = new OBJLoader(LoadingManager.shareInstance.threeLoadingManager);
        objloader.setMaterials(materials);
        const group = objloader.parse(objdata);
        if (addToScene) {
          this.threeScene.add(group);
        }
        return group;
      });
    });
  };

  /**
   * load fbx
   * @param {*} aFbxpath
   * @returns
   */
  loadFbx = (aFbxpath = '', addToScene = true) =>
    LoadingManager.shareInstance.getModelDataByUrl(aFbxpath).then((data) => {
      const fbxloader = new FBXLoader(LoadingManager.shareInstance.threeLoadingManager);
      const baseDirectory = aFbxpath.split('/');
      baseDirectory.pop();
      const obj = fbxloader.parse(data, `${baseDirectory.join('/')}/`);
      if (addToScene) {
        this.threeScene.add(obj);
      }
      return obj;
    });

  /**
   * load svg
   * @param {*} aSVGpath
   * @returns
   */
  loadSVG = (aSVGpath = '') => {
    const svgloader = new SVGLoader(LoadingManager.shareInstance.threeLoadingManager);
    return new Promise((reslove, reject) => {
      svgloader.load(
        aSVGpath,
        (obj) => {
          this.threeScene.add(obj);
          reslove(obj);
        },
        null,
        (e) => {
          reject(e);
        }
      );
    });
  };

  /**
   * load gltf
   * @param {*} path
   * @returns
   */
  loadGltf = (path, addToScene = true) =>
    LoadingManager.shareInstance.getModelDataByUrl(path).then((data) => {
      const gltfLoader = new GLTFLoader(LoadingManager.shareInstance.threeLoadingManager);
      const baseDirectory = path.split('/');
      baseDirectory.pop();
      return new Promise((reslove, reject) => {
        gltfLoader.parse(
          data,
          `${baseDirectory.join('/')}/`,
          (gltf) => {
            const obj = gltf.scene;
            if (addToScene) {
              this.threeScene.add(obj);
            }
            reslove(gltf);
          },
          (e) => {
            reject(e);
          }
        );
      });
    });

  /**
   * load gltf
   * @param {ArrayBuffer} aBuffer 数据
   * @param {Boolean} addToScene 是否，默认true
   * @returns
   */
  loadGltfDracoBuffer = (aBuffer, addToScene = true) => {
    const gltfLoader = new GLTFLoader(LoadingManager.shareInstance.threeLoadingManager);
    const dracoLoader = new DRACOLoader(LoadingManager.shareInstance.threeLoadingManager);
    dracoLoader.setDecoderPath('/static/three/draco/');
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader);
    // const baseDirectory = path.split("/");
    // baseDirectory.pop();
    return new Promise((reslove, reject) => {
      gltfLoader.parse(
        aBuffer,
        '/',
        (gltf) => {
          const obj = gltf.scene;
          if (addToScene) {
            this.threeScene.add(obj);
          }
          reslove(gltf);
        },
        (e) => {
          reject(e);
        }
      );
    });
  };

  /**
   * load gltf Draco
   * @param {*} path
   * @returns
   */
  loadGltfDraco(path, addToScene = true) {
    return LoadingManager.shareInstance.getModelDataByUrl(path).then((data) => {
      const gltfLoader = new GLTFLoader(LoadingManager.shareInstance.threeLoadingManager);
      const dracoLoader = new DRACOLoader(LoadingManager.shareInstance.threeLoadingManager);
      dracoLoader.setDecoderPath('/static/three/draco/');
      dracoLoader.preload();
      gltfLoader.setDRACOLoader(this.dracoLoader);
      const baseDirectory = path.split('/');
      baseDirectory.pop();
      return new Promise((reslove, reject) => {
        gltfLoader.load(
          path,
          // `${baseDirectory.join("/")}/`,
          (gltf) => {
            const obj = gltf.scene;
            if (addToScene) {
              this.threeScene.add(obj);
            }
            reslove(gltf);
          },
          null,
          (e) => {
            reject(e);
          }
        );
      });
    });
  }

  /**
   * load gltf ktx
   * @param {*} _this
   * @param {*} path
   * @param {*} cb
   */
  loadGltfOptKTX = (path, addToScene = true) =>
    LoadingManager.shareInstance.getModelDataByUrl(path).then((data) => {
      const ktx2Loader = new KTX2Loader(LoadingManager.shareInstance.threeLoadingManager)
        .setTranscoderPath('/public/static/three/basis/')
        .detectSupport(this.threeRenderer);
      const gltfLoader = new GLTFLoader(LoadingManager.shareInstance.threeLoadingManager);
      gltfLoader.setKTX2Loader(ktx2Loader);
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);
      const baseDirectory = path.split('/');
      baseDirectory.pop();
      return new Promise((reslove, reject) => {
        gltfLoader.parse(
          data,
          `${baseDirectory.join('/')}/`,
          (gltf) => {
            const obj = gltf.scene;
            if (addToScene) {
              this.threeScene.add(obj);
            }
            reslove(gltf);
          },
          (e) => {
            reject(e);
          }
        );
      });
    });

  /**
   * v1.0 加载sprit
   * @param {string} path
   * @param {回调} cb
   */
  loadImg = (path, cb) => {
    const spriteMap = new THREE.TextureLoader().load(path);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: spriteMap,
      // sizeAttenuation: THREE.sizeAtt,
      depthWrite: false,
      side: THREE.DoubleSide,
      depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    cb(sprite);
  };

  /**
   * v2.0 获取 sprit
   * @param {string} path
   * @param {回调} cb
   */
  loadSprite = (path) =>
    new Promise((reslove, reject) => {
      const spriteMap = new THREE.TextureLoader().load(path);
      spriteMap.wrapS = THREE.RepeatWrapping;
      spriteMap.wrapT = THREE.RepeatWrapping;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteMap,
        // sizeAttenuation: THREE.sizeAtt,
        depthWrite: false,
        side: THREE.DoubleSide,
        depthTest: false
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      reslove(sprite);
    });

  /**
   * add orbitControl
   * @param {*} aContainer
   * @returns
   */
  #addOrbitControl = (aCamera = new THREE.Camera(), aDomElement = document.getElementById()) => {
    const control = new OrbitControls(aCamera, aDomElement);
    this.threeOrbitControl = control;
    control.enablePan = true;
    // control.enableZoom = true;
    control.autoRotate = false;
    // control.maxDistance = 200;
    // // control.maxDistance = 1000;
    // // control.maxPolarAngle = 3.14;
    // // control.minPolarAngle = 0.0;
  };

  /**
   * 移除 orbitControl 控制器
   */
  #removeOrbitControl = () => {
    if (this.threeOrbitControl !== null) {
      this.threeOrbitControl.dispose();
      this.threeOrbitControl = null;
    }
  };

  /**
   * create axis helper
   * @param {*} aContainer
   * @returns
   */
  #addAxisControl = (aScene = this.threeScene, aCamera = this.threeCamera) => {
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
  #addStatAnalyse = (aContainer = this.threeContainer) => {
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
   * @param {*} aPoint 点位信息
   * @param {*} ignoreMeshNames 忽略的材质名称
   * @returns
   */
  getModelsByPoint = (
    aPoint = { x: 0, y: 0 },
    ignoreMeshNames = [],
    targetObject3Ds = this.threeScene.children
  ) => {
    const canvas = this.threeContainer;
    if (!canvas || !this.threeCamera || !this.threeScene) {
      return [];
    }
    if (!targetObject3Ds) {
      return [];
    }
    const x = ((aPoint.x - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1; // 规范设施横坐标
    const y = -((aPoint.y - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1; // 规范设施纵坐标
    const standardVector = new THREE.Vector3(x, y, 1); // 规范设施坐标
    const worldVector = standardVector.unproject(this.threeCamera);
    const ray = worldVector.sub(this.threeCamera.position).normalize();
    const raycaster = new THREE.Raycaster(this.threeCamera.position, ray);
    raycaster.camera = this.threeCamera;
    let models = raycaster.intersectObjects(targetObject3Ds, true);
    //
    const commonMeshTypes = [
      'CameraHelper',
      'AxesHelper',
      'Line',
      'Line2',
      'Line3',
      'TransformControls'
    ];
    const commonMeshNames = ['可视域视锥体'];
    const checkMeshNameFunc = (aMesh) => {
      if (commonMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      if (ignoreMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      if (ignoreMeshNames.indexOf(this.getOriginMesh(aMesh)?.name) !== -1) {
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
   * 经过拆分后的模型数据，根据子物体获取拆分前 原始物体名称
   */
  getOriginMesh = (obj3d = {}) => {
    if (!(obj3d instanceof THREE.Object3D)) {
      return null;
    }

    if (obj3d.name.indexOf('_') === -1) {
      return obj3d;
    }
    // 是否为子物体
    const nameArry = obj3d.name.split('_') || [];
    const lastText = nameArry[nameArry.length - 1];
    if (!lastText) {
      return obj3d;
    }
    // 不为数字
    if (Number.isNaN(lastText)) {
      return obj3d;
    }
    nameArry.pop();
    return obj3d.parent;
  };

  /**
   * set mesh opacity
   * @param {*} aOpacity opacity  range:[0,1]
   * @param {*} meshNames material names defaut all
   * @param {*} targetObject3D 目标object3d
   */
  setOpacity = (aOpacity = 0.5, meshNames = [], targetObject3D = this.threeScene) => {
    // set material transpant
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
    if (targetObject3D instanceof THREE.Object3D) {
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
    }
  };

  /**
   * set mesh visible
   * @param {*} aVisible 可见  range:[0,1]
   * @param {*} meshNames material names defaut all
   * @param {*} targetObject3D 目标object3d
   */
  setVisible = (aVisible = true, meshNames = [], targetObject3D = this.threeScene) => {
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
    //
    if (targetObject3D instanceof THREE.Object3D) {
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
    }
  };

  /**
   * scale
   */
  zoom = (aValue = 1) => {
    if (this.threeCamera instanceof THREE.PerspectiveCamera) {
      this.useTweenAnimate(
        {
          zoom: this.threeCamera.zoom
        },
        {
          zoom: this.threeCamera.zoom * aValue
        },
        (e) => {
          this.threeCamera.zoom = e.zoom;
          this.threeCamera.updateProjectionMatrix();
        },
        0.5
      );
    }
  };

  /**
   * scale reset
   * @returns
   */
  zoomReset = () => {
    if (this.threeCamera instanceof THREE.PerspectiveCamera) {
      if (this.threeCamera.zoom === 1) {
        return;
      }
      this.useTweenAnimate(
        {
          zoom: this.threeCamera.zoom
        },
        {
          zoom: 1
        },
        (e) => {
          this.threeCamera.zoom = e.zoom;
          this.threeCamera.updateProjectionMatrix();
        }
      );
    }
  };

  /**
   * 模型爆炸效果 ，距离中心线等距离增加长度
   * @param {*} aNumber 爆炸比例
   * @param {*} aReset 是否复位
   */
  splitModel = (aNumber = 0.5, aReset = false) => {
    if (this.threeScene instanceof THREE.Scene) {
      const startPoint = {};
      const endPoint = {};
      const objs = {};
      this.threeScene.traverse((aObj) => {
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
    const canvas = this.threeContainer;
    const mousex = ((aPoint.x - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1;
    const mousey = -((aPoint.y - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1;
    const sdvector = new THREE.Vector3(mousex, mousey, 0.5);
    const worldVector = sdvector.unproject(this.threeCamera);
    return worldVector;
  };

  /**
   * 设置物体其他颜色
   * @returns
   */
  setMeshColorByNames = (
    meshNames = [],
    materialColor = '#DDFF00',
    targetObject3D = this.threeScene
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
   * 重置物体颜色
   */
  resetMeshNames = (meshNames = [], targetObject3D = this.threeScene) => {
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

  // /**
  //  * 加载模型时留住每个模型的 原材质
  //  */
  // dealMeshMaterial = () => {
  //     const result = [];
  //     const { children } = this.threeScene;
  //     for (let i = 0; i < children.length; i++) {
  //         const element = children[i];
  //         // if (element instanceof THREE.Group) {
  //         element.traverse((obj) => {
  //             if (obj instanceof THREE.Mesh) {
  //                 const promise = {
  //                     name: obj.name,
  //                     material: obj.material.clone()
  //                 };
  //                 result.push(promise);
  //             }
  //         });
  //         // }
  //     }
  //     return result;
  // };

  /**
   * 根据物体生成包围盒子
   * @param {*} object
   */
  setBoundingBox = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    // 长、宽、高
    const v = {
      x: Math.abs(box.max.x - box.min.x),
      y: Math.abs(box.max.y - box.min.y),
      z: Math.abs(box.max.z - box.min.z)
    };
    const geometry = new THREE.BoxBufferGeometry(v.x + 0.01, v.y + 0.01, v.z + 0.01);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 1, 1),
      transparent: true,
      opacity: 0.2
    });
    const cube = new THREE.Mesh(geometry, material);
    // cube.position.copy(this.GetCenters(object));
    cube.position.copy(ThreeTool.getObjectCenter(object));
    this.threeScene.add(cube);
    return cube;
  };

  /**
   * 判断obj是否是gltf拆分的子物体并返回原模型obj
   * @param {点击的obj} castObj
   * @returns
   */
  getGltfParObj = (castObj) => {
    const s = castObj.name;
    // 后缀
    const ext = s.substr(s.lastIndexOf('_') + 1);
    // 判断后缀是否是数字,如果是,
    const isNumber = !Number.isNaN(Number(ext));
    if (isNumber) {
      // 获取模型拆分物体的原模型
      if (castObj.parent === null) {
        return castObj;
      }
      return castObj.parent;
    }
    return castObj;
  };

  /**
   * 获取列表Sprite
   * @param {*} objList
   * @returns
   */
  getSpriteByList = (objList) => {
    const sprites = [];
    objList.forEach((item) => {
      if (item.object.type === 'Sprite') {
        sprites.push(item.object);
      }
    });
    return sprites;
  };

  // /**
  //  * 场景无用模型过滤
  //  * @param {模型name列表} nameList 模型name列表
  //  * @param {过滤name列表} castNameList 过滤name列表
  //  * @returns
  //  */
  // _modelsFilter = (aNameList = [], castNameList = []) => {
  //     if (aNameList?.length === 0) {
  //         return [];
  //     }
  //     // 筛选掉可视域视锥体mesh
  //     const nameList = aNameList.filter(
  //         (item) => item.object.name !== '可视域视锥体' && item.object.visible === true
  //     );
  //     // 墙体过滤 , 不过滤地板
  //     const newarray = [];
  //     nameList.forEach((item) => {
  //         if (!castNameList.includes(item.object.name)) {
  //             newarray.push(item);
  //         }
  //     });
  //     return newarray;
  // };

  // _currLineList = [];

  // /**
  //  * 根据点数组划线 生成几何体
  //  * @param {*} pointList  坐标点数组 [pos1,pos2, ...]
  //  */
  // drawLine = (pointList = []) => {
  //     const points = pointList;
  //     const material = new THREE.LineBasicMaterial({
  //         color: 0x00c8be,
  //         linewidth: 10,
  //         depthTest: false
  //     });
  //     const geometry = new THREE.BufferGeometry().setFromPoints(points);
  //     const line = new THREE.Line(geometry, material);
  //     this.threeScene.add(line);
  //     this._currLineList.push(line);
  //     return line;
  // };

  // clearLine = () => {
  //     for (let i = 0; i < this._currLineList.length; i++) {
  //         const line = this._currLineList[i];
  //         this._destroyObj(line);
  //     }
  //     this._currLineList = [];
  // };

  createOptions = (points = []) => {
    // const points = [
    //   new THREE.Vector3(0, 50, 0),
    //   new THREE.Vector3(50, 50, 0),
    //   new THREE.Vector3(80, 40, 0),
    //   new THREE.Vector3(80, 40, -20)
    //   // new Vector3(0, 40, 0),
    //   // new Vector3(-40, 40, 50),
    // ];
    const curvePath = new THREE.CurvePath();
    for (let i = 0; i < points.length - 1; i++) {
      curvePath.add(new THREE.LineCurve3(points[i], points[i + 1]));
    }

    const options = {
      steps: 1000,
      bevelEnabled: false,
      bevelThickness: 1,
      extrudePath: curvePath
    };
    return { options, curvePath };
  };

  createShapes = () => {
    const points = [];
    // points.push(new THREE.Vector2(+0.5, -0.5));
    // points.push(new THREE.Vector2(+0.5, +0.5));
    points.push(new THREE.Vector2(+0.5, +0.5));
    points.push(new THREE.Vector2(-0.5, +0.5));
    const shapes = new THREE.Shape(points);
    return shapes;
  };

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
    // this.threeScene.add(mesh);
    return { mesh, curvePath };
  };

  /**
   * 阴影测试
   * @param {*} directionalLight
   */
  shadowTest = () => {
    const directionalLight = this.threeDirectionLight;
    const geom = new THREE.BoxGeometry(0.01, 0.01, 0.01);
    const material = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const cube = new THREE.Mesh(geom, material);
    cube.castShadow = true;
    cube.position.set(0, 0, 0);
    window.cube = cube;
    this.threeScene.add(cube);

    directionalLight.position.set(-2, 10, -2);
    directionalLight.target = cube;

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000;

    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.bias = 0.002722;

    // this._initShadowGui(this.threeAmbientLight, directionalLight);
  };
}

ThreeJs.EventType = ThreeEvent.EventType;
export { THREE, CSS2DObject, CSS3DObject, ThreeTool, ThreeEvent };
export default ThreeJs;
