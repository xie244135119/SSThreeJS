import * as THREE from 'three';
import Stats from 'stats.js';
import WEBGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
// import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { UIPanel } from '../UIKit/UI';
// import SSThreeLoop from './SSThreeLoop';
// import SSDispose from './SSDispose';
// import SSEvent from './SSEvent';
// import SSThreeTool from './SETool';
// import LoadingManager from './SETool/LoadingManager';
import SSThreeObject from '../../../core/SSThreeObject';
// import SSLoader from './SSLoader';
// import SSModuleCenter from './SSModule';
// import SSMessageQueue from './SETool/MessageQueue';
import SSEvent from '../../../core/SSEvent';
import SSTransformControl from '../../../core/SSTool/TransformControl';
// import SSPostProcessModule from './SSModule/basepostprocess.module';
// import SSController from '../SEController';
import SEComponent from '../SEComponent';
import SSViewportInfo from './FPS';

export default class SEViewport extends SEComponent {
  /**
   * 位置调试工具
   * @type {SSTransformControl}
   */
  ssTransformControl = null;

  destory() {
    this.event?.destory();
    this.event = null;
    this.ssTransformControl?.destory();
    this.ssTransformControl = null;
    super.destory();
  }

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
    const ssthreeObject = new SSThreeObject({
      container: this.dom,
      scene: this.controller.scene,
      camera: this.controller.camera,
      renderer: this.controller.renderer,
      control: this.orbitControl
    });
    this.ssTransformControl = new SSTransformControl(ssthreeObject, (e) => {
      if (e.type === 'delete') {
        this.controller.removeObject(e.target);
      } else if (e.type === 'change') {
        this.controller.signals.objectChanged.dispatch(e.target);
      } else if (e.type === 'focus') {
        this.controller.signals.cameraMoved.dispatch(e.target);
      }
    });
    //
    this.dom.appendChild(this.controller.renderer.domElement);
    this.controller.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.controller.renderer.render(this.controller.scene, this.controller.camera);
    // 尺寸变化的时候
    this.controller.signals.windowResize.add(this.updateCameraMatrix);
    // 位置变动的时候
    this.controller.signals.cameraMoved.add(this.render);
    // 场景数据变化的时候
    this.controller.signals.sceneGraphChanged.add(this.render);
    // 事件选中的时候
    this.controller.signals.objectSelected.add((e) => {
      if (e) {
        this.ssTransformControl.attach(e);
      } else {
        this.ssTransformControl.detach();
      }
      this.render();
    });
    // 对象被更新的时候
    this.controller.signals.objectChanged.add(this.render);
    // 调试器
    this.addDebugHelper();
    //
    const threeEvent = new SSEvent(this.dom);
    this.event = threeEvent;
    // 点击事件
    threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (aPoint) => {
      let models = ssthreeObject.getModelsByPoint(aPoint);
      models = models.filter((item) => item.object.type.indexOf('Helper') === -1);
      this.controller.signals.intersectionsDetected.dispatch(models);
    });
    //
    // this.controller.signals.sceneGraphChanged.add(() => {
    //   console.log(' 图表数据变化 ', this.controller.scene.children);
    // });
    //
    // environment
    this.controller.signals.sceneEnvironmentChanged.add(
      (environmentType, environmentEquirectangularTexture) => {
        switch (environmentType) {
          case 'None':
            this.controller.scene.environment = null;
            break;
          case 'Equirectangular':
            this.controller.scene.environment = null;
            if (environmentEquirectangularTexture) {
              environmentEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
              this.controller.scene.environment = environmentEquirectangularTexture;
            }
            break;
          case 'ModelViewer':
            if (!this.pmremGenerator) {
              this.pmremGenerator = new THREE.PMREMGenerator(this.controller.renderer);
              this.pmremGenerator.compileEquirectangularShader();
            }
            this.controller.scene.environment = this.pmremGenerator.fromScene(
              new RoomEnvironment(),
              0.04
            ).texture;
            break;
          default:
            break;
        }

        this.render();
      }
    );

    // fog
    this.controller.signals.sceneFogChanged.add(
      (fogType, fogColor, fogNear, fogFar, fogDensity) => {
        switch (fogType) {
          case 'None':
            this.controller.scene.fog = null;
            break;
          case 'Fog':
            this.controller.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
            break;
          case 'FogExp2':
            this.controller.scene.fog = new THREE.FogExp2(fogColor, fogDensity);
            break;
          default:
            break;
        }
        this.render();
      }
    );
    // fog setting
    this.controller.signals.sceneFogSettingsChanged.add(
      (fogType, fogColor, fogNear, fogFar, fogDensity) => {
        switch (fogType) {
          case 'Fog':
            this.controller.scene.fog.color.setHex(fogColor);
            this.controller.scene.fog.near = fogNear;
            this.controller.scene.fog.far = fogFar;
            break;
          case 'FogExp2':
            this.controller.scene.fog.color.setHex(fogColor);
            this.controller.scene.fog.density = fogDensity;
            break;
          default:
            break;
        }
        this.render();
      }
    );
    // background
    this.controller.signals.sceneBackgroundChanged.add(
      (
        backgroundType,
        backgroundColor,
        backgroundTexture,
        backgroundEquirectangularTexture,
        backgroundBlurriness,
        backgroundIntensity
      ) => {
        console.log(' backgroundType backgroundColor', backgroundType, backgroundColor);
        switch (backgroundType) {
          case 'None':
            this.controller.scene.background = null;
            break;
          case 'Color':
            this.controller.scene.background = new THREE.Color(backgroundColor);
            break;
          case 'Texture':
            if (backgroundTexture) {
              this.controller.scene.background = backgroundTexture;
            }
            break;
          case 'Equirectangular':
            if (backgroundEquirectangularTexture) {
              backgroundEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
              this.controller.scene.background = backgroundEquirectangularTexture;
              this.controller.scene.backgroundBlurriness = backgroundBlurriness;
              this.controller.scene.backgroundIntensity = backgroundIntensity;
            }
            break;
          default:
            break;
        }
        this.render();
      }
    );
  }

  /**
   * 重新渲染
   */
  render = () => {
    const startTime = Date.now();
    this.controller.renderer.render(this.controller.scene, this.controller.camera);
    const endTime = Date.now();
    this.controller.signals.sceneRendered.dispatch(endTime - startTime);
  };

  /**
   * 添加调试帮助器
   */
  addDebugHelper() {
    const ambientlight = new THREE.AmbientLight();
    ambientlight.intensity = 1;
    this.controller.scene.add(ambientlight);

    // helpers
    const grid = new THREE.Group();
    this.controller.scene.add(grid);

    const grid1 = new THREE.GridHelper(300, 300, 0x888888);
    grid1.material.color.setHex(0x888888);
    grid1.material.vertexColors = false;
    grid.add(grid1);

    // const grid2 = new THREE.GridHelper(30, 6, 0x222222);
    // grid2.material.color.setHex(0x222222);
    // grid2.material.vertexColors = false;
    // grid.add(grid2);
  }

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
    // control.minDistance = 2;
    // control.maxDistance = 1000;
    control.enablePan = true;
    this.orbitControl = control;
    control.addEventListener('change', () => {
      this.controller.signals.cameraMoved.dispatch();
    });
  };

  /**
   * remove orbitControl
   */
  removeOrbitControl = () => {
    if (this.ssThreeObject.threeOrbitControl !== null) {
      this.ssThreeObject.threeOrbitControl.dispose();
      this.ssThreeObject.threeOrbitControl = null;
    }
  };

  // /**
  //  * create axis helper
  //  * @returns
  //  */
  // _addAxisControl = (aScene = this.ssThreeObject.threeScene) => {
  //   const axis = new THREE.AxesHelper(100);
  //   aScene.add(axis);
  //   this._axisControlHelper = axis;
  // };

  // /**
  //  * remove axis helper
  //  */
  // _removeAxisControl = () => {
  //   if (this._axisControlHelper !== null) {
  //     this._axisControlHelper.dispose();
  //     this._axisControlHelper = null;
  //   }
  // };

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

  // /**
  //  * 将屏幕坐标转化为世界坐标 <目前不是很准确>
  //  */
  // transformPositionToVector3 = (aPoint = { x: 0, y: 0 }) => {
  //   const canvas = this.ssThreeObject.threeContainer;
  //   const mousex = ((aPoint.x - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1;
  //   const mousey = -((aPoint.y - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1;
  //   const sdvector = new THREE.Vector3(mousex, mousey, 0.5);
  //   const worldVector = sdvector.unproject(this.ssThreeObject.threeCamera);
  //   return worldVector;
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

  // /**
  //  * 根据二维坐标 拾取模型数据
  //  * @param {PointerEvent|KeyboardEvent} pointEvent 点位信息
  //  * @param {Array<THREE.Object3D>} targetObject3Ds 目标模型
  //  * @param {Array<string>} [ignoreMeshNames] 忽略的材质名称
  //  * @returns
  //  */
  // getModelsByPoint = (
  //   pointEvent,
  //   targetObject3Ds = this.threeScene.children,
  //   ignoreMeshNames = []
  // ) => {
  //   const point = new THREE.Vector2(
  //     (pointEvent.offsetX / this.threeContainer.offsetWidth) * 2 - 1, // 规范设施横坐标
  //     -(pointEvent.offsetY / this.threeContainer.offsetHeight) * 2 + 1
  //   );
  //   // if (needOffset) {
  //   //   point.x =
  //   //     ((aPoint.x - this.threeContainer.getBoundingClientRect().left) /
  //   //       this.threeContainer.offsetWidth) *
  //   //       2 -
  //   //     1; // 规范设施横坐标
  //   //   point.y =
  //   //     -(
  //   //       (aPoint.y - this.threeContainer.getBoundingClientRect().top) /
  //   //       this.threeContainer.offsetHeight
  //   //     ) *
  //   //       2 +
  //   //     1;
  //   // } else {
  //   //     point.x = (aPoint.x / this.threeContainer.offsetWidth) * 2 - 1; // 规范设施横坐标
  //   //     point.y = -(aPoint.y / this.threeContainer.offsetHeight) * 2 + 1;
  //   // }
  //   const invalidTypes = [
  //     'AmbientLight',
  //     'PointLight',
  //     'PointLightHelper',
  //     'SpotLight',
  //     'SpotLightHelper',
  //     'DirectionalLight',
  //     'DirectionalLightHelper',
  //     'TransformControls',
  //     'CameraHelper',
  //     'AxesHelper'
  //   ];
  //   const object3ds = targetObject3Ds || this.threeScene.children;
  //   const object3Ds = object3ds.filter(
  //     (item) => invalidTypes.indexOf(item.constructor.name) === -1
  //   );
  //   const raycaster = new THREE.Raycaster();
  //   raycaster.setFromCamera(point, this.threeCamera);
  //   let models = raycaster.intersectObjects(object3Ds, true);
  //   //
  //   const commonMeshTypes = ['Line', 'Line2', 'Line3'];
  //   const commonMeshNames = ['可视域视锥体'];
  //   const checkMeshNameFunc = (aMesh) => {
  //     if (commonMeshNames.indexOf(aMesh.name) !== -1) {
  //       return false;
  //     }
  //     if (ignoreMeshNames.indexOf(aMesh.name) !== -1) {
  //       return false;
  //     }
  //     // if (ignoreMeshNames.indexOf(SSThreeTool.getOriginMesh(aMesh)?.name) !== -1) {
  //     //   return false;
  //     // }
  //     return true;
  //   };
  //   models = models.filter(
  //     (item) =>
  //       commonMeshTypes.indexOf(item.object.type) === -1 &&
  //       item.object.visible === true &&
  //       checkMeshNameFunc(item.object)
  //   );
  //   return models;
  // };

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
