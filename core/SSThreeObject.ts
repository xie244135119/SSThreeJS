import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'postprocessing';
import SSThreeLoop from './SSThreeLoop';
import SSThreeTool from './SSTool/index';

export default class SSThreeObject {
  /**
   * @description container dom
   */
  threeContainer: HTMLElement = null;

  /**
   * @description scene
   */
  threeScene: THREE.Scene = null;

  /**
   * @description scene 调试 helper
   */
  sceneHelper: THREE.Scene = null;

  /**
   * @description 场景相机
   */
  threeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera = null;

  /**
   * @description WebGl渲染器
   */
  threeRenderer: THREE.WebGLRenderer = null;

  /**
   * @description 轨道控制器
   */
  threeOrbitControl: OrbitControls = null;

  /**
   * @description 后处理
   */
  threeEffectComposer: EffectComposer = null;

  /**
   * @description 响应监听器
   */
  _resizeObserver: ResizeObserver = null;

  constructor(props: {
    container: HTMLElement;
    scene: THREE.Scene;
    sceneHelper?: THREE.Scene;
    control: OrbitControls;
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    effectComposer?: EffectComposer;
  }) {
    this.threeContainer = props.container;
    this.threeScene = props.scene;
    this.sceneHelper = props.sceneHelper;
    this.threeOrbitControl = props.control;
    this.threeCamera = props.camera;
    this.threeRenderer = props.renderer;
    this.threeEffectComposer = props.effectComposer;
  }

  destory() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this.cancelRenderLoop();
    this.removeCameraHelper();
  }

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
    if (!animate) {
      this.threeCamera.position.copy(cameraPosition);
      this.threeOrbitControl.target.copy(controlPosition);
      this.threeOrbitControl.update();
    } else {
      const startPoint = {
        camera_x: this.threeCamera.position.x,
        camera_y: this.threeCamera.position.y,
        camera_z: this.threeCamera.position.z,
        orbitControl_x: this.threeOrbitControl.target.x,
        orbitControl_y: this.threeOrbitControl.target.y,
        orbitControl_z: this.threeOrbitControl.target.z
      };
      const endPoint = {
        camera_x: cameraPosition.x,
        camera_y: cameraPosition.y,
        camera_z: cameraPosition.z,
        orbitControl_x: controlPosition.x,
        orbitControl_y: controlPosition.y,
        orbitControl_z: controlPosition.z
      };
      SSThreeTool.useTweenAnimate(
        startPoint,
        endPoint,
        (e) => {
          this.threeCamera.position.set(e.camera_x, e.camera_y, e.camera_z);
          this.threeOrbitControl.target.set(e.orbitControl_x, e.orbitControl_y, e.orbitControl_z);
          this.threeOrbitControl.update();
        },
        animateSpeed,
        complete
      );
    }
  }

  /**
   * 选择视角位置
   */
  getEye() {
    return {
      camera: this.threeCamera.position,
      target: this.threeOrbitControl.target
    };
  }

  /**
   * 根据二维坐标 拾取模型数据
   * @param pointEvent 点位信息
   * @param targetObject3Ds 目标模型
   * @param ignoreMeshNames 忽略的材质名称
   * @returns
   */
  getModelsByPoint = (
    pointEvent: PointerEvent,
    targetObject3Ds: THREE.Object3D[] = this.threeScene.children,
    ignoreMeshNames: string[] = []
  ) => {
    const point = new THREE.Vector2(
      (pointEvent.offsetX / this.threeContainer.offsetWidth) * 2 - 1, // 规范设施横坐标
      -(pointEvent.offsetY / this.threeContainer.offsetHeight) * 2 + 1
    );
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
      'AxesHelper',
      'GridHelper',
      'BoxHelper'
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
   * @param type 相机类型
   */
  changeCameraMode = (type: 'PerspectiveCamera' | 'OrthographicCamera') => {
    if (type === this.threeCamera.type) {
      return;
    }
    this.removeCameraHelper();
    if (this.threeCamera) {
      this.threeCamera = null;
      this.threeOrbitControl?.dispose();
      this.threeOrbitControl = null;
    }

    if (type === 'PerspectiveCamera') {
      const camera = new THREE.PerspectiveCamera();
      camera.position.set(2, 2, 2);
      this.threeCamera = camera;
      this.threeOrbitControl = new OrbitControls(this.threeCamera, this.threeContainer);
    } else if (type === 'OrthographicCamera') {
      const camera = new THREE.OrthographicCamera();
      camera.position.set(0, 4, 0);
      this.threeCamera = camera;
      this.threeOrbitControl = new OrbitControls(this.threeCamera, this.threeContainer);
    }
    this.renderOnce();
    this.threeOrbitControl.update();
    this.addCameraHelper();
  };

  /**
   * 手动更新相机矩阵
   */
  updateCameraMatrix() {
    const ascale = this.threeContainer.offsetWidth / this.threeContainer.offsetHeight;
    if (this.threeCamera instanceof THREE.PerspectiveCamera) {
      this.threeCamera.aspect = ascale;
    } else if (this.threeCamera instanceof THREE.OrthographicCamera) {
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
  renderLoop() {
    this.updateCameraMatrix();
    SSThreeLoop.add(() => {
      this.threeRenderer.render(this.threeScene, this.threeCamera);
    }, 'webglrender update');
  }

  /**
   * 页面渲染
   */
  renderOnce() {
    this.threeRenderer.render(this.threeScene, this.threeCamera);
    if (this.sceneHelper) {
      this.threeRenderer.autoClear = false;
      this.threeRenderer.render(this.sceneHelper, this.threeCamera);
      this.threeRenderer.autoClear = true;
    }
  }

  /**
   * cancel webgl render
   */
  cancelRenderLoop() {
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
