export default class SEBaseCommand {
  /**
   * 控制器
   * @type {import('../../SEController').default}
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
