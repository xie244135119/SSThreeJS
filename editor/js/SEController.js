import * as THREE from 'three';
import SSMessageQueue from '../../core/SSTool/MessageQueue';
import SEControlerSignal from './SEController.Signal';
import SECommandHistory from './Command/History';
import SESelector from './SETool/Selector';
import Strings from './libs/Strings';
// import Zhcn from '../locales/zh-cn.json';
import Config from './libs/Config';

export default class SEController {
  /**
   * 与外部通讯的全部信号
   * @type {SEControlerSignal}
   */
  signals = null;

  /**
   * 消息队列
   * @type { SSMessageQueue }
   */
  messageQueue = null;

  /**
   * 指令集
   * @type {SECommandHistory}
   */
  commandHistory = null;

  /**
   * 本地化对象
   * @type {Strings}
   */
  strings = null;

  /**
   * 全局配置
   * @type {Config}
   */
  config = null;

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
   * @type {import('../../core/SSEvent').default}
   */
  event = null;

  /**
   * 场景选择器
   * @type {SESelector}
   */
  selector = null;

  /**
   * 选中的物体
   * @type {THREE.Object3D}
   */
  // selected = null;

  /**
   * @param {} param0 构造参数
   */
  constructor() {
    // 信号处理器
    this.signals = new SEControlerSignal();
    // 操作历史
    this.commandHistory = new SECommandHistory(this);
    // 操作队列
    this.messageQueue = new SSMessageQueue();
    // 工具选择器
    this.selector = new SESelector(this);
    // 本地配置对象
    this.config = new Config();
    // 国际化对象
    const modules = import.meta.glob('../locales/*.json', {
      import: 'default',
      eager: true
    });
    const language = this.config.getKey('language');
    const languageJson = modules[`../locales/${language}.json`];
    this.strings = new Strings();
    this.strings.use(languageJson);

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
    this.signals.destory();
    this.signals = null;
    this.removeHelper();
    this.renderer.dispose();
    this.renderer = null;
  }

  /**
   * 执行指令
   * @param {import('../js/Command/commands/Base').default} cmd
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

    this.signals.objectAdded.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
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
    this.signals.objectRemoved.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
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

      this.signals.helperAdded.dispatch(newHelper);
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

  get selected() {
    return this.selector.selected;
  }
}
