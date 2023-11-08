export default class SSTool {
  /**
   * 控制器
   * @type {import('../SEController').default}
   */
  controller = null;

  constructor(controller) {
    this.controller = controller;
  }
}
