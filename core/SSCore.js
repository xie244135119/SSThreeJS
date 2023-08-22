import * as THREE from 'three';
import Stats from 'stats.js';
import WEBGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
// import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import SSThreeLoop from './SSThreeLoop';
import SSDispose from './SSDispose';
import SSEvent from './SSEvent';
import SSThreeTool from './SSTool';
import SSThreeObject from './SSThreeObject';
import SSLoader from './SSLoader';
import SSModuleCenter from './SSModule';
import SSMessageQueue from './SSTool/MessageQueue';
import SSTransformControl from './SSTool/TransformControl';
import SSPostProcessModule from './SSModule/basepostprocess.module';
import SSLoadingManager from './SSTool/LoadingManager';

export default class SSThreeJs {
  /**
   * @description 场景存储类
   * @type {SSThreeObject}
   */
  ssThreeObject = null;

  /**
   * 模块中心
   * @type {SSModuleCenter}
   */
  ssModuleCenter = null;

  /**
   * 消息队列
   * @type { SSMessageQueue }
   */
  ssMessageQueue = null;

  /**
   * 位置调试工具
   * @type {SSTransformControl}
   */
  ssTransformControl = null;

  /**
   * @type { SSPostProcessModule } 基础后处理
   */
  ssPostProcessModule = null;

  /**
   * @type {THREE.AmbientLight}  ambient light
   */
  threeAmbientLight = null;

  /**
   * @type {SSEvent}
   */
  threeEvent = null;

  /**
   * ssthreejs 加载器
   * @type {SSLoadingManager}
   */
  ssLoadingManager = null;

  /**
   * @type {Stats}
   */
  _statsJs = null;

  // axis helper
  _axisControlHelper = null;

  // has released
  _threeJsDestoryed = false;

  /**
   * 销毁机制
   */
  destroy(loop = true) {
    this._threeJsDestoryed = true;
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

    if (this.ssThreeObject.threeScene !== null) {
      SSDispose.dispose(this.ssThreeObject.threeScene);
      if (this.ssThreeObject.threeRenderer.info.programs.length !== 0) {
        console.log('scene material has not released', this.ssThreeObject.threeRenderer.info);
      } else if (this.ssThreeObject.threeRenderer.info.memory.geometries) {
        console.log('scene geometries has not released', this.ssThreeObject.threeRenderer.info);
      } else if (this.ssThreeObject.threeRenderer.info.memory.textures) {
        console.log('scene textures has not released', this.ssThreeObject.threeRenderer.info);
      }
    }
    if (this.ssThreeObject.threeRenderer !== null) {
      this.ssThreeObject.threeRenderer.dispose();
      this.ssThreeObject.threeRenderer.forceContextLoss();
      this.ssThreeObject.threeContainer.removeChild(this.ssThreeObject.threeRenderer.domElement);
    }
  }

  /**
   * 场景初始化
   * @param {string | HTMLElement} aCanvasElement canvasid 或 element
   * @returns {void}
   */
  setup = (aCanvasElement) => {
    let container = document.body;
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
    const aspect = container.offsetWidth / container.offsetHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 20000);
    camera.position.set(10, 10, 10);
    // webgl render
    const render = this._addRender();
    container.append(render.domElement);

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
    this.ssThreeObject.render();
    // module center
    this.ssModuleCenter = new SSModuleCenter(this.ssThreeObject);
    // postprocess module
    this.ssPostProcessModule = new SSPostProcessModule(this.ssThreeObject);
    //
    SSThreeLoop.add(() => {
      if (this.ssThreeObject.threeOrbitControl) {
        this.ssThreeObject.threeOrbitControl.update();
      }
    }, 'control update');

    return scene;
  };

  /**
   * sky box
   * @param {*} hdrs
   * @returns
   */
  addSky = (skys = []) => {
    const pmremGenerator = new THREE.PMREMGenerator(this.ssThreeObject.threeRenderer);
    const hdrLoader = new THREE.CubeTextureLoader(this.ssLoadingManager.threeLoadingManager);
    return new Promise((reslove, reject) => {
      hdrLoader.load(
        skys,
        (texture) => {
          const cubetexure = pmremGenerator.fromCubemap(texture).texture;
          this.ssThreeObject.threeScene.environment = cubetexure;
          this.ssThreeObject.threeScene.background = cubetexure;
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
    const pmremGenerator = new THREE.PMREMGenerator(this.ssThreeObject.threeRenderer);
    if (hdrs.length === 1) {
      return new Promise((reslove, reject) => {
        const rgbeLoader = new RGBELoader(this.ssLoadingManager.threeLoadingManager);
        rgbeLoader.load(
          hdrs,
          (texture) => {
            const cubetexure = pmremGenerator.fromCubemap(texture).texture;
            this.ssThreeObject.threeScene.background = cubetexure;
            this.ssThreeObject.threeScene.environment = cubetexure;
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
          this.ssThreeObject.threeScene.environment = cubetexure;
          this.ssThreeObject.threeScene.background = cubetexure;
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
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
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
   * 缓动设置模型中心位置信息
   * @param {*} aCameraPosition 镜头位置
   * @param {*} aCenterPosition 模型中心点坐标
   * @param {*} animate 是否动画
   * @param {*} speed 速度
   * @param {*} cb 回调
   * @deprecated 请使用 SSThreeObject中的 setEye 方法
   */
  setModelPosition = (
    aCameraPosition = { x: 0, y: 0, z: 0 },
    aCenterPosition = { x: 0, y: 0, z: 0 },
    animate = false,
    speed = 0.5,
    cb = null
  ) => {
    if (!this.ssThreeObject.threeCamera) {
      return;
    }
    if (!animate) {
      this.ssThreeObject.threeCamera.position.set(
        aCameraPosition.x,
        aCameraPosition.y,
        aCameraPosition.z
      );
      const center = new THREE.Vector3(aCenterPosition.x, aCenterPosition.y, aCenterPosition.z);
      this.ssThreeObject.threeOrbitControl.target.set(center.x, center.y, center.z);
      this.ssThreeObject.threeOrbitControl.update();
    } else {
      //
      const startPoint = {
        camera_x: this.ssThreeObject.threeCamera.position.x,
        camera_y: this.ssThreeObject.threeCamera.position.y,
        camera_z: this.ssThreeObject.threeCamera.position.z,
        orbitControl_x: this.ssThreeObject.threeOrbitControl.target.x,
        orbitControl_y: this.ssThreeObject.threeOrbitControl.target.y,
        orbitControl_z: this.ssThreeObject.threeOrbitControl.target.z
      };
      const endPoint = {
        camera_x: aCameraPosition.x,
        camera_y: aCameraPosition.y,
        camera_z: aCameraPosition.z,
        orbitControl_x: aCenterPosition.x,
        orbitControl_y: aCenterPosition.y,
        orbitControl_z: aCenterPosition.z
      };
      SSThreeTool.useTweenAnimate(
        startPoint,
        endPoint,
        (e) => {
          this.ssThreeObject.threeCamera.position.set(e.camera_x, e.camera_y, e.camera_z);
          this.ssThreeObject.threeOrbitControl.target.set(
            e.orbitControl_x,
            e.orbitControl_y,
            e.orbitControl_z
          );
          this.ssThreeObject.threeOrbitControl.update();
        },
        speed,
        cb?.()
      );
    }
  };

  /**
   * dynamic debug
   */
  addDymaicDebug = () => {
    this._addAxisControl(this.ssThreeObject.threeScene);
    this._addStatAnalyse();
    this.ssTransformControl = new SSTransformControl(this.ssThreeObject);
    this._clickEvent = this.threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (aPoint) => {
      const models = this.ssThreeObject.getModelsByPoint(aPoint);
      if (models.length === 0) {
        return;
      }
      if (models[0].object instanceof THREE.Object3D) {
        this.ssTransformControl.attach(models[0].object);
      }
    });
    window.ssThreeJs = this;
    window.ssThreeObject = this.ssThreeObject;
    window.THREE = THREE;
  };

  /**
   * remove debug
   */
  removeDymaicDebug = () => {
    this._removeAxisControl();
    this._removeStatAnalyse();
    this.ssTransformControl?.destory();
    this.ssTransformControl = null;
    this.threeEvent.removeEventListener(SSEvent.SSEventType.CLICK, this._clickEvent);
    window.ssthreeJs = null;
    window.THREE = null;
    window.ssThreeObject = null;
  };

  /**
   * v3.0方案 根据配置文件加载模型
   * @param {Array<{type: string, obj: string, mtl: string, gltf: string, draco:string}>} list 模型配置
   * @param {function(THREE.Object3D[]): void} [onComplete] 页面熏染完成 参数：全部模型
   * @param {function({type: string, title: string, obj: string, mtl: string, gltf: string, draco:string}, THREE.Group | GLTF):void} [onBeforeRender] 场景添加前 参数：(对象条目, 模型)
   * @param {function({type: string, title: string, obj: string, mtl: string, gltf: string, draco:string}, THREE.Group | GLTF):void} [onAfterRender] 场景添加后 参数：(对象条目, 模型)
   * @returns
   */
  loadModelQueue = (list, onComplete, onBeforeRender, onAfterRender) => {
    if (list.length === 0) {
      onComplete?.([]);
      return;
    }
    if (this.ssMessageQueue === null) {
      this.ssMessageQueue = new SSMessageQueue();
    }
    const objList = [];
    list.forEach((config) => {
      let promise = Promise.resolve();
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
              this.ssThreeObject.threeScene.add(obj);
            } else if (obj.scene instanceof THREE.Object3D) {
              obj.scene.traverse((e) => {
                e.receiveShadow = true;
                e.castShadow = true;
              });
              this.ssThreeObject.threeScene.add(obj.scene);
            }

            onAfterRender?.(config, obj);
            objList.push(obj);
            //
            this.ssMessageQueue.remove();
          })
          .catch((e) => {
            console.log(' 模型渲染失败 ', config, e);
            this.ssMessageQueue.remove();
          });
      });
    });
    this.ssMessageQueue.add(() => {
      onComplete?.(objList);
      this.ssMessageQueue.remove();
    });
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
  //   return this.ssLoadingManager.getModelDataByUrl(aMaterialPath).then((materialdata) => {
  //     const mtlloader = new MTLLoader(this.ssLoadingManager.threeLoadingManager);
  //     const mtltext = String.fromCharCode.apply(null, new Uint8Array(materialdata));
  //     const materials = mtlloader.parse(mtltext, getDirectoryText(aMaterialPath));
  //     return this.ssLoadingManager.getModelDataByUrl(aObjPath).then((objdata) => {
  //       const objloader = new OBJLoader(this.ssLoadingManager.threeLoadingManager);
  //       objloader.setMaterials(materials);
  //       const group = objloader.parse(objdata);
  //       if (addToScene) {
  //         this.ssThreeObject.threeScene.add(group);
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
   * @param {string} path model path
   * @param {THREE.LoadingManager} manager loading manager
   * @returns {Promise<GLTF>}
   */
  loadGltf = (path) =>
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
   * @param {*} path
   * @returns
   */
  loadGltfDraco = (path) =>
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
   * @param {*} path
   * @returns
   */
  loadGltfOptKTX = (path) =>
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
   * @param {*} aContainer
   * @returns
   */
  _addOrbitControl = (aCamera = new THREE.Camera(), aDomElement = document.getElementById()) => {
    const control = new OrbitControls(aCamera, aDomElement);
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
  _addAxisControl = (aScene = this.ssThreeObject.threeScene) => {
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
  _addStatAnalyse = (aContainer = this.ssThreeObject.threeContainer) => {
    const stats = new Stats();
    this._statsJs = stats;
    stats.showPanel(0);
    aContainer.appendChild(stats.domElement);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = 'unset';
    stats.domElement.style.bottom = '0px';
    SSThreeLoop.add(() => {
      stats.update();
    }, 'fps render');
  };

  /**
   * remove stats
   */
  _removeStatAnalyse = () => {
    if (this._statsJs !== null) {
      this._statsJs.domElement.remove();
      this._statsJs.end();
      this._statsJs = null;
      SSThreeLoop.removeId('fps render');
    }
  };

  /**
   * 将屏幕坐标转化为世界坐标 <目前不是很准确>
   */
  transformPositionToVector3 = (aPoint = { x: 0, y: 0 }) => {
    const canvas = this.ssThreeObject.threeContainer;
    const mousex = ((aPoint.x - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1;
    const mousey = -((aPoint.y - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1;
    const sdvector = new THREE.Vector3(mousex, mousey, 0.5);
    const worldVector = sdvector.unproject(this.ssThreeObject.threeCamera);
    return worldVector;
  };

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

  // // 创建管道
  // createOptionss = (points, material) => {
  //   let curvePath = null;
  //   let options = null;
  //   const pro = this.createOptions(points);
  //   curvePath = pro.curvePath;
  //   options = pro.options;
  //   const geometry1 = new THREE.ExtrudeBufferGeometry(this.createShapes(), options);

  //   // // ExtrudeBufferGeometry转换BufferGeometry
  //   const geometry = new THREE.BufferGeometry();
  //   const verticesByThree = geometry1.attributes.position.array;
  //   // 4. 设置position
  //   geometry.setAttribute('position', new THREE.BufferAttribute(verticesByThree, 3));
  //   // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]
  //   // 5.1 以18个顶点为单位分组
  //   const pointsGroupBy18 = new Array(verticesByThree.length / 3 / 6)
  //     .fill(0)
  //     .map((_, i) => verticesByThree.slice(i * 3 * 6, (i + 1) * 3 * 6));
  //   // 5.2 按uv周期分组
  //   const pointsGroupBy63 = pointsGroupBy18.map((item) =>
  //     new Array(item.length / 3).fill(0).map((_, i) => item.slice(i * 3, (i + 1) * 3))
  //   );
  //   // 5.3根据BoundingBox确定uv平铺范围
  //   geometry.computeBoundingBox();
  //   const { min, max } = geometry.boundingBox;
  //   const rangeX = max.x - min.x;
  //   const uvs = [].concat(
  //     ...pointsGroupBy63.map((item) => {
  //       const point0 = item[0];
  //       const point5 = item[5];
  //       const distance =
  //         new THREE.Vector3(...point0).distanceTo(new THREE.Vector3(...point5)) / (rangeX / 10);
  //       return [0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1];
  //     })
  //   );
  //   geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  //   // const meshMat =
  //   //   material ||
  //   //   new THREE.MeshBasicMaterial({
  //   //     color: 0x00ffff,
  //   //     side: THREE.DoubleSide
  //   //   });

  //   // this.assignUVs(geometry);
  //   // const material = new THREE.MeshBasicMaterial({
  //   //   color: 0x00ff00,
  //   //   wireframe: false
  //   // });
  //   const mesh = new THREE.Mesh(geometry, material);
  //   // const mesh = new THREE.Mesh(geometry, material);
  //   // this.ssThreeObject.threeScene.add(mesh);
  //   return { mesh, curvePath };
  // };
}
