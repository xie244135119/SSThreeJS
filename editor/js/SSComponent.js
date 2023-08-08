import SSController from './SSController';

export default class SSComponent {
  /**
   * 控制器
   * @type {SSController}
   */
  controller = null;

  /**
   * dom元素
   * @type {HTMLElement}
   */
  dom = null;

  constructor(controller, dom) {
    this.controller = controller;
    this.dom = dom;
  }

  /**
   * 添加子元素
   * @type {Array<SSComponent>} elements
   */
  add(...elements) {
    for (let i = 0; i < arguments.length; i++) {
      const argument = elements[i];

      if (argument instanceof SSComponent) {
        this.dom.appendChild(argument.dom);
      } else {
        console.error('SSComponent:', argument, 'is not an instance of UIElement.');
      }
    }

    return this;
  }

  remove(...elements) {
    for (let i = 0; i < arguments.length; i++) {
      const argument = elements[i];

      if (argument instanceof SSComponent) {
        this.dom.removeChild(argument.dom);
      } else {
        console.error('UIElement:', argument, 'is not an instance of UIElement.');
      }
    }

    return this;
  }
}
