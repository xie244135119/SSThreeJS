import { UIRow, UIText } from '../UIKit/UI';

export default class SSProperty {
  /**
   * 控制器
   * @type {import('../SEController').default}
   */
  controller = null;

  /**
   * 行数据
   * @type {UIRow}
   */
  containerDom = null;

  /**
   * 选中的目标元素
   * @type {THREE.Object3D}
   */
  object = null;

  /**
   * 属性名称
   * @type {string}
   */
  name = null;

  /**
   * 属性事件改变
   * @type {function ():void }
   */
  onChange = null;

  constructor(controller, name) {
    this.controller = controller;

    const container = new UIRow();
    container.add(new UIText(name).setWidth('90px'));
    this.containerDom = container;
  }

  destory() {
    //
  }

  /**
   * 更新操作
   */
  update() {
    //
  }
}
