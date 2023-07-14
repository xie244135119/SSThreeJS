import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SSThreeLoop from './SSThreeLoop';

export default class SSThreeObject {
  /**
   * @type HTMLElement three dom
   */
  threeContainer = null;

  /**
   * @type THREE.Scene
   */
  threeScene = null;

  /**
   * @description 场景相机
   * @type THREE.PerspectiveCamera | THREE.OrthographicCamera
   */
  threeCamera = null;

  /**
   * @type THREE.WebGLRenderer
   */
  threeRenderer = null;

  /**
   * @type OrbitControls
   */
  threeOrbitControl = null;

  /**
   * @type EffectComposer
   */
  threeEffectComposer = null;

  /**
   * @enum {string} CameraType
   * @property {string} Perspective 透视目标
   * @property {string} Orthographic 正位目标
   */
  static CameraType = {
    /**
     * 透视相机
     */
    Perspective: 'PerspectiveCamera',
    /**
     * 正交相机
     */
    Orthographic: 'OrthographicCamera'
  };

  /**
   * @param {{ container: HTMLElement, scene: THREE.Scene, control: OrbitControls, camera: THREE.PerspectiveCamera | THREE.OrthographicCamera, renderer: THREE.WebGLRenderer ,effectComposer}} param0 构造参数
   */
  constructor({ container, scene, control, camera, renderer, effectComposer } = {}) {
    this.threeContainer = container;
    this.threeScene = scene;
    this.threeOrbitControl = control;
    this.threeCamera = camera;
    this.threeRenderer = renderer;
    this.threeEffectComposer = effectComposer;
  }

  destory() {
    this._resizeObserver.disconnect();
    this._resizeObserver = null;
    this.cancelRender();
    this.removeCameraHelper();
  }

  /**
   * 根据二维坐标 拾取模型数据
   * @param {THREE.Vector2} aPoint 点位信息
   * @param {Array<THREE.Object3D>} targetObject3Ds 目标模型
   * @param {Array<string>} [ignoreMeshNames] 忽略的材质名称
   * @param {boolean} [needOffset=false] 是否需要偏移
   * @returns
   */
  getModelsByPoint = (
    aPoint,
    targetObject3Ds = this.threeScene.children,
    ignoreMeshNames = [],
    needOffset = false
  ) => {
    const point = new THREE.Vector2();
    if (needOffset) {
      point.x =
        ((aPoint.x - this.threeContainer.getBoundingClientRect().left) /
          this.threeContainer.offsetWidth) *
          2 -
        1; // 规范设施横坐标
      point.y =
        -(
          (aPoint.y - this.threeContainer.getBoundingClientRect().top) /
          this.threeContainer.offsetHeight
        ) *
          2 +
        1;
    } else {
      point.x = (aPoint.x / this.threeContainer.offsetWidth) * 2 - 1; // 规范设施横坐标
      point.y = -(aPoint.y / this.threeContainer.offsetHeight) * 2 + 1;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(point, this.threeCamera);

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
   * 改变相机类型 正交或透视
   * @param {CameraType} type 相机类型
   */
  changeCameraMode = (type = '') => {
    if (type === this.threeCamera.type) {
      return;
    }
    this.cancelRender();
    this.removeCameraHelper();
    if (this.threeCamera) {
      this.threeCamera = null;
      this.threeOrbitControl?.dispose();
      this.threeOrbitControl = null;
    }

    if (type === SSThreeObject.CameraType.Perspective) {
      const camera = new THREE.PerspectiveCamera();
      camera.position.set(2, 2, 2);
      this.threeCamera = camera;
      this.threeOrbitControl = new OrbitControls(this.threeCamera, this.threeContainer);
    } else if (type === SSThreeObject.CameraType.Orthographic) {
      const camera = new THREE.OrthographicCamera();
      camera.position.set(0, 4, 0);
      this.threeCamera = camera;
      this.threeOrbitControl = new OrbitControls(this.threeCamera, this.threeContainer);
      // this.threeOrbitControl.enableRotate = false;
    }
    this.render();
    this.threeOrbitControl.update();
    this.addCameraHelper();
  };

  /**
   * 手动更新相机矩阵
   */
  updateCameraMatrix() {
    const ascale = this.threeContainer.offsetWidth / this.threeContainer.offsetHeight;
    if (this.threeCamera.isPerspectiveCamera) {
      this.threeCamera.aspect = ascale;
    } else {
      const s = 1;
      this.threeCamera.left = -ascale * s;
      this.threeCamera.right = ascale * s;
      this.threeCamera.top = s;
      this.threeCamera.bottom = -s;
    }
    this.threeCamera.updateProjectionMatrix(); // 手动更新相机的投影矩阵
  }

  /**
   * webgl render
   */
  render() {
    this.updateCameraMatrix();
    SSThreeLoop.add(() => {
      this.threeRenderer.render(this.threeScene, this.threeCamera);
    }, 'webglrender update');
  }

  /**
   * cancel webgl render
   */
  cancelRender() {
    SSThreeLoop.removeId('webglrender update');
  }

  /**
   * 新增 Camera Helper
   */
  addCameraHelper() {
    const cameraaxishelper = new THREE.CameraHelper(this.threeCamera);
    cameraaxishelper.name = 'Camera Helper';
    this.threeScene.add(cameraaxishelper);
  }

  /**
   * 移除 Camera Helper
   */
  removeCameraHelper() {
    const cameraHelper = this.threeScene.getObjectByName('Camera Helper');
    if (cameraHelper instanceof THREE.CameraHelper) {
      cameraHelper.dispose();
      this.threeScene.remove(cameraHelper);
    }
  }

  /**
   * window resize observer
   */
  autoWindowResize = () => {
    this.threeRenderer.setSize(this.threeContainer.offsetWidth, this.threeContainer.offsetHeight);
    const observer = new window.ResizeObserver(() => {
      // 调整相机矩阵
      this.updateCameraMatrix();
      // 调整画布
      this.threeRenderer.setSize(this.threeContainer.offsetWidth, this.threeContainer.offsetHeight);
    });
    observer.observe(this.threeContainer);
    this._resizeObserver = observer;
  };
}
