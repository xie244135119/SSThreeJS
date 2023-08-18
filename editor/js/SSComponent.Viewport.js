import * as THREE from 'three';
import Stats from 'stats.js';
import WEBGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
// import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { UIPanel } from './libs/ui';
// import SSThreeLoop from './SSThreeLoop';
// import SSDispose from './SSDispose';
// import SSEvent from './SSEvent';
// import SSThreeTool from './SSTool';
// import LoadingManager from './SSTool/LoadingManager';
import SSThreeObject from '../../core/SSThreeObject';
// import SSLoader from './SSLoader';
// import SSModuleCenter from './SSModule';
// import SSMessageQueue from './SSTool/MessageQueue';
import SSEvent from '../../core/SSEvent';
import SSTransformControl from '../../core/SSTool/TransformControl';
// import SSPostProcessModule from './SSModule/basepostprocess.module';
import SSController from './SSController';
import SSComponent from './SSComponent';
import SSViewportInfo from './SSComponent.Viewport.Info';

export default class SSViewport extends SSComponent {
  /**
   * 位置调试工具
   * @type {SSTransformControl}
   */
  ssTransformControl = null;

  constructor(controller) {
    const container = new UIPanel();
    container.setId('viewport');
    container.setPosition('absolute');
    super(controller, container.dom);

    //
    const viewPortInfo = new SSViewportInfo(this.controller);
    this.add(viewPortInfo);

    //  控制器
    this.addOrbitControl();
    // 平移器
    const object = new SSThreeObject({
      container: this.dom,
      scene: this.controller.scene,
      camera: this.controller.camera,
      renderer: this.controller.renderer,
      control: this.orbitControl
    });
    this.ssTransformControl = new SSTransformControl(object, (e) => {
      this.render();
    });
    //
    this.dom.appendChild(this.controller.renderer.domElement);
    this.controller.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.controller.renderer.render(this.controller.scene, this.controller.camera);
    // 尺寸变化的时候
    this.controller.signalController.windowResize.add(this.updateCameraMatrix);
    // 位置变动的时候
    this.controller.signalController.cameraMoved.add(this.render);
    this.controller.signalController.objectAdded.add(() => {
      this.render();
    });
    this.controller.signalController.objectSelected.add((e) => {
      this.ssTransformControl.attach(e);
      this.render();
    });
    //
    this.addDebugHelper();
  }

  /**
   * 重新渲染
   */
  render = () => {
    const startTime = Date.now();
    this.controller.renderer.render(this.controller.scene, this.controller.camera);
    const endTime = Date.now();
    this.controller.signalController.sceneRendered.dispatch(endTime - startTime);
  };

  /**
   *
   */
  addDebugHelper() {
    const ambientlight = new THREE.AmbientLight();
    ambientlight.intensity = 1;
    this.controller.scene.add(ambientlight);

    // helpers
    const grid = new THREE.Group();
    this.controller.scene.add(grid);

    const grid1 = new THREE.GridHelper(30, 30, 0x888888);
    grid1.material.color.setHex(0x888888);
    grid1.material.vertexColors = false;
    grid.add(grid1);

    const grid2 = new THREE.GridHelper(30, 6, 0x222222);
    grid2.material.color.setHex(0x222222);
    grid2.material.vertexColors = false;
    grid.add(grid2);
  }

  // /**
  //  * 销毁机制
  //  */
  // destroy(loop = true) {
  //   this._threeJsDestoryed = true;
  //   this.ssThreeObject?.destory();
  //   this.ssMessageQueue?.destory();
  //   this.ssMessageQueue = null;
  //   if (loop) {
  //     SSThreeLoop.destory();
  //   }

  //   this.ssModuleCenter?.destroy();
  //   this.ssModuleCenter = null;

  //   this._removeOrbitControl();

  //   this.threeEvent.destory();
  //   this.threeEvent = null;

  //   if (this.ssThreeObject.threeScene !== null) {
  //     SSDispose.dispose(this.ssThreeObject.threeScene);
  //     if (this.ssThreeObject.threeRenderer.info.programs.length !== 0) {
  //       console.log('scene material has not released', this.ssThreeObject.threeRenderer.info);
  //     } else if (this.ssThreeObject.threeRenderer.info.memory.geometries) {
  //       console.log('scene geometries has not released', this.ssThreeObject.threeRenderer.info);
  //     } else if (this.ssThreeObject.threeRenderer.info.memory.textures) {
  //       console.log('scene textures has not released', this.ssThreeObject.threeRenderer.info);
  //     }
  //   }
  //   if (this.ssThreeObject.threeRenderer !== null) {
  //     this.ssThreeObject.threeRenderer.dispose();
  //     this.ssThreeObject.threeRenderer.forceContextLoss();
  //     this.ssThreeObject.threeContainer.removeChild(this.ssThreeObject.threeRenderer.domElement);
  //   }
  // }

  // /**
  //  * 场景初始化
  //  * @param {string | HTMLElement} aCanvasElement canvasid 或 element
  //  * @returns {void}
  //  */
  // setup = (aCanvasElement) => {
  //   let container = document.body;
  //   if (typeof aCanvasElement === 'string') {
  //     const element = document.getElementById(aCanvasElement);
  //     container = element;
  //   } else if (aCanvasElement instanceof HTMLElement) {
  //     container = aCanvasElement;
  //   }

  //   // webgl render
  //   container.append(render.domElement);

  //   // ambient light
  //   const ambientlight = new THREE.AmbientLight(new THREE.Color(0xffffff), 1);
  //   scene.add(ambientlight);
  //   this.threeAmbientLight = ambientlight;

  //   // keyboard orbitcontrol
  //   const control = this._addOrbitControl(camera, container);
  //   // add event
  //   this.threeEvent = new SSEvent(container);
  //   // loading manager
  //   LoadingManager.shareInstance.addProgressView(container);
  //   //
  //   SSThreeLoop.setup();
  //   //
  //   this.ssThreeObject = new SSThreeObject({
  //     container,
  //     scene,
  //     camera,
  //     control,
  //     renderer: render
  //   });
  //   // window resize
  //   this.ssThreeObject.autoWindowResize();
  //   // add webgl render
  //   this.ssThreeObject.render();
  //   // module center
  //   this.ssModuleCenter = new SSModuleCenter(this.ssThreeObject);
  //   // postprocess module
  //   this.ssPostProcessModule = new SSPostProcessModule(this.ssThreeObject);
  //   //
  //   SSThreeLoop.add(() => {
  //     if (this.ssThreeObject.threeOrbitControl) {
  //       this.ssThreeObject.threeOrbitControl.update();
  //     }
  //   }, 'control update');

  //   return scene;
  // };

  // /**
  //  * sky box
  //  * @param {*} hdrs
  //  * @returns
  //  */
  // addSky = (skys = []) => {
  //   const pmremGenerator = new THREE.PMREMGenerator(this.ssThreeObject.threeRenderer);
  //   const hdrLoader = new THREE.CubeTextureLoader(LoadingManager.shareInstance.threeLoadingManager);
  //   return new Promise((reslove, reject) => {
  //     hdrLoader.load(
  //       skys,
  //       (texture) => {
  //         const cubetexure = pmremGenerator.fromCubemap(texture).texture;
  //         this.ssThreeObject.threeScene.environment = cubetexure;
  //         this.ssThreeObject.threeScene.background = cubetexure;
  //         pmremGenerator.dispose();
  //         reslove(texture);
  //       },
  //       null,
  //       (e) => {
  //         pmremGenerator.dispose();
  //         reject(e);
  //       }
  //     );
  //   });
  // };

  // /**
  //  * addHdr
  //  */
  // addHDR = (hdrs = []) => {
  //   const pmremGenerator = new THREE.PMREMGenerator(this.ssThreeObject.threeRenderer);
  //   if (hdrs.length === 1) {
  //     return new Promise((reslove, reject) => {
  //       const rgbeLoader = new RGBELoader(LoadingManager.shareInstance.threeLoadingManager);
  //       rgbeLoader.load(
  //         hdrs,
  //         (texture) => {
  //           const cubetexure = pmremGenerator.fromCubemap(texture).texture;
  //           this.ssThreeObject.threeScene.background = cubetexure;
  //           this.ssThreeObject.threeScene.environment = cubetexure;
  //           pmremGenerator.dispose();
  //           reslove(texture);
  //         },
  //         null,
  //         (e) => {
  //           pmremGenerator.dispose();
  //           reject(e);
  //         }
  //       );
  //     });
  //   }
  //   //
  //   const hdrLoader = new HDRCubeTextureLoader(LoadingManager.shareInstance.threeLoadingManager);
  //   return new Promise((reslove, reject) => {
  //     hdrLoader.load(
  //       hdrs,
  //       (texture) => {
  //         const cubetexure = pmremGenerator.fromCubemap(texture).texture;
  //         this.ssThreeObject.threeScene.environment = cubetexure;
  //         this.ssThreeObject.threeScene.background = cubetexure;
  //         pmremGenerator.dispose();
  //         reslove(texture);
  //       },
  //       null,
  //       (e) => {
  //         pmremGenerator.dispose();
  //         reject(e);
  //       }
  //     );
  //   });
  // };

  /**
   * dynamic debug
   */
  addDymaicDebug = () => {
    this._addAxisControl(this.ssThreeObject.threeScene);
    this._addStatAnalyse();
    window.ssThreeJs = this;
    window.ssThreeObject = this.ssThreeObject;
    window.THREE = THREE;
    //
    this.ssTransformControl = new SSTransformControl(this.ssThreeObject);
    // window.ssThreeObject.threeCamera.setFov = (aValue) => {
    //   aCamera.fov = aValue;
    //   aCamera.updateProjectionMatrix();
    // };
    this._clickEvent = this.threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (aPoint) => {
      const models = this.ssThreeObject.getModelsByPoint(aPoint);
      if (models.length === 0) {
        return;
      }
      this.ssTransformControl.attach(models[0].object);
      this.ssPostProcessModule.addOutlineByObject3Ds([models[0].object]);
      this.ssPostProcessModule.addMaskBoxByObject3Ds(models[0].object);
    });
  };

  /**
   * remove debug
   */
  removeDymaicDebug = () => {
    this.threeEvent.removeEventListener(SSEvent.SSEventType.CLICK, this._clickEvent);
    this._removeStatAnalyse();
    this._removeAxisControl();
    this._transformControl?.destory();
    this._transformControl = null;
    window.ssthreeJs = null;
    window.THREE = null;
    window.ssThreeObject = null;
  };

  // /**
  //  * v3.0方案 根据配置文件加载模型
  //  * @param {Array<{type: string, obj: string, mtl: string, gltf: string, draco:string}>} list 模型配置
  //  * @param {function(THREE.Object3D[]): void} [onComplete] 页面熏染完成 参数：全部模型
  //  * @param {function({type: string, obj: string, mtl: string, gltf: string, draco:string}, THREE.Group | GLTF):void} [onBeforeRender] 场景添加前 参数：(对象条目, 模型)
  //  * @param {function({type: string, obj: string, mtl: string, gltf: string, draco:string}, THREE.Group | GLTF):void} [onAfterRender] 场景添加后 参数：(对象条目, 模型)
  //  * @returns
  //  */
  // loadModelQueue = (list, onComplete, onBeforeRender, onAfterRender) => {
  //   if (list.length === 0) {
  //     onComplete?.([]);
  //     return;
  //   }
  //   if (this.ssMessageQueue === null) {
  //     this.ssMessageQueue = new SSMessageQueue();
  //   }
  //   const objList = [];
  //   list.forEach((config) => {
  //     let promise = Promise.resolve();
  //     switch (config.type) {
  //       case 'obj':
  //         promise = SSLoader.loadObj(
  //           config.obj,
  //           config.mtl,
  //           null,
  //           LoadingManager.shareInstance.threeLoadingManager
  //         );
  //         break;
  //       case 'fbx':
  //         promise = this.loadFbx(config.fbx);
  //         break;
  //       case 'gltf':
  //         promise = this.loadGltf(config.gltf);
  //         break;
  //       case 'draco':
  //         promise = this.loadGltfDraco(config.draco);
  //         break;
  //       case 'opt':
  //         promise = this.loadGltfOptKTX(config.opt);
  //         break;
  //       default:
  //         break;
  //     }
  //     this.ssMessageQueue.add(() => {
  //       promise
  //         .then((obj) => {
  //           onBeforeRender?.(config, obj);
  //           if (obj instanceof THREE.Object3D) {
  //             obj.traverse((e) => {
  //               e.receiveShadow = true;
  //               e.castShadow = true;
  //             });
  //             this.ssThreeObject.threeScene.add(obj);
  //           } else if (obj.scene instanceof THREE.Object3D) {
  //             obj.scene.traverse((e) => {
  //               e.receiveShadow = true;
  //               e.castShadow = true;
  //             });
  //             this.ssThreeObject.threeScene.add(obj.scene);
  //           }

  //           onAfterRender?.(config, obj);
  //           objList.push(obj);
  //           //
  //           this.ssMessageQueue.remove();
  //         })
  //         .catch((e) => {
  //           console.log(' 模型渲染失败 ', config, e);
  //           this.ssMessageQueue.remove();
  //         });
  //     });
  //   });
  //   this.ssMessageQueue.add(() => {
  //     onComplete?.(objList);
  //     this.ssMessageQueue.remove();
  //   });
  // };

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
  //         this.ssThreeObject.threeScene.add(group);
  //       }
  //       return group;
  //     });
  //   });
  // };

  /**
   * add orbitControl
   * @param {*} aContainer
   * @returns
   */
  addOrbitControl = () => {
    const control = new OrbitControls(this.controller.camera, this.dom);
    control.enableDamping = true;
    control.dampingFactor = 0.25;
    control.enableZoom = true;
    control.autoRotate = false;
    control.autoRotateSpeed = 2;
    control.minDistance = 2;
    control.maxDistance = 1000;
    control.enablePan = true;
    this.orbitControl = control;
    control.addEventListener('change', () => {
      this.controller.signalController.cameraMoved.dispatch();
    });
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

  // /**
  //  * add stats
  //  */
  // _addStatAnalyse = (aContainer = this.ssThreeObject.threeContainer) => {
  //   const stats = new Stats();
  //   this._statsJs = stats;
  //   stats.showPanel(0);
  //   aContainer.appendChild(stats.domElement);
  //   stats.domElement.style.position = 'absolute';
  //   stats.domElement.style.top = 'unset';
  //   stats.domElement.style.bottom = '0px';
  //   SSThreeLoop.add(() => {
  //     stats.update();
  //   }, 'fps render');
  // };

  // /**
  //  * remove stats
  //  */
  // _removeStatAnalyse = () => {
  //   if (this._statsJs !== null) {
  //     this._statsJs.domElement.remove();
  //     this._statsJs.end();
  //     this._statsJs = null;
  //     SSThreeLoop.removeId('fps render');
  //   }
  // };

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

  /**
   * 根据二维坐标 拾取模型数据
   * @param {PointerEvent|KeyboardEvent} pointEvent 点位信息
   * @param {Array<THREE.Object3D>} targetObject3Ds 目标模型
   * @param {Array<string>} [ignoreMeshNames] 忽略的材质名称
   * @returns
   */
  getModelsByPoint = (
    pointEvent,
    targetObject3Ds = this.threeScene.children,
    ignoreMeshNames = []
  ) => {
    const point = new THREE.Vector2(
      (pointEvent.offsetX / this.threeContainer.offsetWidth) * 2 - 1, // 规范设施横坐标
      -(pointEvent.offsetY / this.threeContainer.offsetHeight) * 2 + 1
    );
    // if (needOffset) {
    //   point.x =
    //     ((aPoint.x - this.threeContainer.getBoundingClientRect().left) /
    //       this.threeContainer.offsetWidth) *
    //       2 -
    //     1; // 规范设施横坐标
    //   point.y =
    //     -(
    //       (aPoint.y - this.threeContainer.getBoundingClientRect().top) /
    //       this.threeContainer.offsetHeight
    //     ) *
    //       2 +
    //     1;
    // } else {
    //     point.x = (aPoint.x / this.threeContainer.offsetWidth) * 2 - 1; // 规范设施横坐标
    //     point.y = -(aPoint.y / this.threeContainer.offsetHeight) * 2 + 1;
    // }
    const invalidTypes = [
      'AmbientLight',
      'PointLight',
      'PointLightHelper',
      'SpotLight',
      'SpotLightHelper',
      'DirectionalLight',
      'DirectionalLightHelper',
      'TransformControls',
      'CameraHelper',
      'AxesHelper'
    ];
    const object3ds = targetObject3Ds || this.threeScene.children;
    const object3Ds = object3ds.filter(
      (item) => invalidTypes.indexOf(item.constructor.name) === -1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(point, this.threeCamera);
    let models = raycaster.intersectObjects(object3Ds, true);
    //
    const commonMeshTypes = ['Line', 'Line2', 'Line3'];
    const commonMeshNames = ['可视域视锥体'];
    const checkMeshNameFunc = (aMesh) => {
      if (commonMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      if (ignoreMeshNames.indexOf(aMesh.name) !== -1) {
        return false;
      }
      // if (ignoreMeshNames.indexOf(SSThreeTool.getOriginMesh(aMesh)?.name) !== -1) {
      //   return false;
      // }
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
   * 手动更新相机矩阵
   */
  updateCameraMatrix = () => {
    const ascale = this.dom.offsetWidth / this.dom.offsetHeight;
    if (this.controller.camera.isPerspectiveCamera) {
      this.controller.camera.aspect = ascale;
    } else {
      const s = 1;
      this.concontrollertroler.camera.left = -ascale * s;
      this.controller.camera.right = ascale * s;
      this.controller.camera.top = s;
      this.controller.camera.bottom = -s;
    }
    this.controller.camera.updateProjectionMatrix(); // 手动更新相机的投影矩阵
    this.controller.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    //
    this.render();
  };
}
