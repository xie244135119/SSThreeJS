import * as THREE from 'three';
// import WEBGL from 'three/examples/jsm/capabilities/WebGL';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
// import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
// import SSThreeLoop from './SSThreeLoop';
// import SSDispose from './SSDispose';
import SSEvent from '../../core/SSEvent';
// import SSThreeTool from './SSTool';
// import LoadingManager from './SSTool/LoadingManager';
import SSThreeObject from '../../core/SSThreeObject';
// import SSLoader from './SSLoader';
import SSMessageQueue from '../../core/SSTool/MessageQueue';
import SSControlerSignal from './SSController.Signal';
import SSCommandHistory from './Command/History';
import SSSelector from './SSSTool.Selector';
// import Command from './Command/Interface';

export default class SSController {
  /**
   * 与外部通讯的全部信号
   * @type {SSControlerSignal}
   */
  signalController = null;

  /**
   * 消息队列
   * @type { SSMessageQueue }
   */
  messageQueue = null;

  /**
   * 指令集
   * @type {SSCommandHistory}
   */
  commandHistory = null;

  /**
   * 场景
   * @type {THREE.Scene}
   */
  scene = null;

  /**
   * 相机
   * @type {THREE.PerspectiveCamera | THREE.OrthographicCamera}
   */
  camera = null;

  /**
   * 渲染器
   * @type {THREE.WebGLRenderer}
   */
  renderer = null;

  /**
   * 事件机制
   * @type {SSEvent}
   */
  event = null;

  /**
   * 选择器
   * @type {SSSelector}
   */
  selector = null;

  /**
   * @param {} param0 构造参数
   */
  constructor() {
    //
    this.signalController = new SSControlerSignal();
    this.commandHistory = new SSCommandHistory(this);
    this.messageQueue = new SSMessageQueue();
    this.selector = new SSSelector(this);

    // 场景
    this.scene = new THREE.Scene();
    this.scene.name = 'Scene';

    // 相机
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(5, 5, 5);

    // render
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      // alpha: true,
      logarithmicDepthBuffer: true
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setClearColor('black', 0);
    this.renderer.autoClear = true;
    // 模拟、逼近高动态范围（HDR）效果 LinearToneMapping 为默认值，线性色调映射。
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
  }

  /**
   * 销毁
   */
  destory() {
    //
  }

  /**
   * 执行指令
   * @param {Command} cmd
   * @param {string} optionalName
   */
  execute(cmd, optionalName) {
    this.commandHistory.execute(cmd, optionalName);
  }

  /**
   * 撤销指令
   */
  undo() {
    this.commandHistory.undo();
  }

  /**
   * 重新执行指令
   */
  redo() {
    this.commandHistory.redo();
  }

  /**
   * 物体增加处理
   * @param {THREE.Object3D} object 物体
   * @param {THREE.Object3D} [parent] 添加物体的父类
   * @param {number} [index] 索引
   */
  addObject(object, parent, index) {
    object.traverse((child) => {
      // if (child.geometry !== undefined) this.addGeometry(child.geometry);
      // if (child.material !== undefined) this.addMaterial(child.material);

      // this.addCamera(child);
      this.addHelper(child);
    });

    if (parent === undefined) {
      this.scene.add(object);
    } else {
      parent.children.splice(index, 0, object);
      object.parent = parent;
    }

    this.signalController.objectAdded.dispatch(object);
    // this.signalController.sceneGraphChanged.dispatch();
  }

  /**
   * 物体重命名之后
   * @param {THREE.Object3D} object 物体
   * @param {string} name 名称
   */
  nameObject(object, name) {
    object.name = name;
    // this.signals.sceneGraphChanged.dispatch();
  }

  /**
   * 物体移除
   * @param {THREE.Object3D} object 添加的物体
   * @returns 移除的物体
   */
  removeObject(object) {
    if (object.parent === null) return; // avoid deleting the camera or scene

    object.traverse((child) => {
      // this.removeCamera(child);
      this.removeHelper(child);

      // if (child.material !== undefined) this.removeMaterial(child.material);
    });

    object.parent.remove(object);
    this.signalController.objectRemoved.dispatch(object);
  }

  addHelper = (() => {
    const geometry = new THREE.SphereGeometry(2, 4, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

    /**
     *
     * @param {THREE.Object3D} object
     * @param {THREE.Object3D} helper
     */
    return (object, helper) => {
      let newHelper = helper;
      if (helper === undefined) {
        if (object.isCamera) {
          newHelper = new THREE.CameraHelper(object);
        } else if (object.isPointLight) {
          newHelper = new THREE.PointLightHelper(object, 1);
        } else if (object.isDirectionalLight) {
          newHelper = new THREE.DirectionalLightHelper(object, 1);
        } else if (object.isSpotLight) {
          newHelper = new THREE.SpotLightHelper(object);
        } else if (object.isHemisphereLight) {
          newHelper = new THREE.HemisphereLightHelper(object, 1);
        } else if (object.isSkinnedMesh) {
          newHelper = new THREE.SkeletonHelper(object.skeleton.bones[0]);
        } else if (object.isBone === true && object.parent?.isBone !== true) {
          newHelper = new THREE.SkeletonHelper(object);
        } else {
          // no helper for this object type
          return;
        }

        const picker = new THREE.Mesh(geometry, material);
        picker.name = 'picker';
        picker.userData.object = object;
        helper.add(picker);
      }

      this.scene.add(newHelper);
      this.helpers[object.id] = newHelper;

      this.signalController.helperAdded.dispatch(newHelper);
    };
  })();

  removeHelper(object) {
    // if (this.helpers[object.id] !== undefined) {
    //   var helper = this.helpers[object.id];
    //   helper.parent.remove(helper);
    //   delete this.helpers[object.id];
    //   this.signals.helperRemoved.dispatch(helper);
    // }
  }

  /**
   * 选中物体
   * @param {THREE.Object3D} object
   */
  select(object) {
    console.log(' select 选中的物体 ', object);
    this.selector.select(object);
  }

  /**
   * 根据物品id 选中物体
   * @param {string} id object id
   */
  selectById(id) {
    if (id === this.camera.id) {
      this.select(this.camera);
      return;
    }

    this.select(this.scene.getObjectById(id));
  }

  /**
   * 根据物品id 选中物体
   * @param {string} id object uuid
   */
  selectByUuid(uuid) {
    this.scene.traverse((child) => {
      if (child.uuid === uuid) {
        this.select(child);
      }
    });
  }

  /**
   * 取消选中物体
   * @param {string} id object uuid
   */
  deselect() {
    this.selector.deselect();
  }
}
