import SSController from '../SSController';

export default class Command {
  /**
   * 控制器
   * @type {SSController}
   */
  controller = null;

  constructor(object) {
    this.controller = object;
  }

  /**
   * 执行指令
   */
  execute() {
    //
  }

  /**
   * 撤销指令
   */
  undo() {
    //
  }

  /**
   * 恢复指令
   */
  redo() {
    //
  }
}
