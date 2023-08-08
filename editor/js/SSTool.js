import SSController from './SSController';

export default class SSTool {
  /**
   * 控制器
   * @type {SSController}
   */
  controller = null;

  constructor(controller) {
    this.controller = controller;
  }
}
