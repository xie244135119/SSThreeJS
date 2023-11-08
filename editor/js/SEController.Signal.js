/**
 * 全部信号控制器
 */
import Signal from './libs/Signal';

export default class SSControllerSign {
  /**
   * @description 文件保存开始
   * @type {Signal}
   */
  savingStarted = null;

  /**
   * @description 文件保存结束
   * @type {Signal }
   */
  savingFinished = null;

  /**
   * @description 转换模式改变
   * @type {Signal }
   */
  transformModeChanged = null;

  // snapChanged= null;
  // spaceChanged= null;

  /**
   * @description 渲染器创建
   * @type {Signal }
   */
  rendererCreated = null;

  /**
   * @description 渲染器更新
   * @type {Signal }
   */
  rendererUpdated = null;

  /**
   * @description 场景更新
   * @type {Signal }
   */
  sceneChanged = null;

  /**
   * @description 场景数据结构变化
   * @type {Signal }
   */
  sceneGraphChanged = null;

  /**
   * @description 场景渲染时刻
   * @type {Signal }
   */
  sceneRendered = null;

  //
  /**
   * @description 摄像头改变
   * @type {Signal }
   */
  cameraChanged = null;

  /**
   * @description 摄像头移动的时候
   * @type { Signal }
   */
  cameraMoved = null;

  /**
   * @description 摄像头重置
   * @type {Signal }
   */
  cameraResetted = null;

  //
  /**
   * @description 物体被选中
   * @type {Signal }
   */
  objectSelected = null;

  /**
   * @description 物体被聚焦 >> 镜头拉近的场景
   * @type {Signal }
   */
  objectFocused = null;

  //
  /**
   * @description 探测物体改变
   * @type {Signal }
   */
  intersectionsDetected = null;

  /**
   * @description 物体被添加
   * @type {Signal }
   */
  objectAdded = null;

  /**
   * @description 物体被添加 >> 改颜色，大小，材质等
   * @type {Signal }
   */
  objectChanged = null;

  /**
   * @description 物体被移除
   * @type {Signal }
   */
  objectRemoved = null;

  /**
   * @description 相机被添加
   * @type {Signal }
   */
  cameraAdded = null;

  /**
   * @description 相机被移除
   * @type {Signal }
   */
  cameraRemoved = null;

  /**
   * @description 材质添加
   * @type {Signal }
   */
  materialAdded = null;

  /**
   * @description 材质改变
   * @type {Signal }
   */
  materialChanged = null;

  /**
   * @description 材质移除
   * @type {Signal }
   */
  materialRemoved = null;

  // scriptAdded= null;
  // scriptChanged= null;
  // scriptRemoved= null;

  /**
   * @description 窗口改变
   * @type {Signal }
   */
  windowResize = null;

  /**
   * @description 编辑器移除的时候
   * @type {Signal }
   */
  editorCleared = new Signal();

  //
  showGridChanged = null;

  showHelpersChanged = null;

  refreshSidebarObject3D = null;

  /**
   * @description 执行操作的时候
   * @type {Signal }
   */
  historyChanged = null;

  /**
   * @description 物体帮助
   * @type {Signal }
   */
  helperAdded = null;

  // viewportCameraChanged= null;
  // viewportShadingChanged= null;

  destory() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      const sigal = this[key];
      if (sigal instanceof Signal) {
        sigal.destory();
      }
      delete this[key];
    });
  }

  constructor() {
    Object.getOwnPropertyNames(this).forEach((key) => {
      this[key] = new Signal();
    });
  }
}
