export default class SEComponent {
  /**
   * 控制器
   * @type {import('./SEController').default}
   */
  controller = null;

  /**
   * dom元素
   * @type {HTMLElement}
   */
  dom = null;

  /**
   * uiDom 元素
   * @type {import('./UIKit/UI').UIElement}
   */
  uiDom = null;

  destory() {
    //
  }

  constructor(controller, dom) {
    this.controller = controller;
    this.dom = dom;
  }

  /**
   * 添加子元素
   * @type {Array<SEComponent>} elements
   */
  add(...elements) {
    for (let i = 0; i < arguments.length; i++) {
      const argument = elements[i];

      if (argument instanceof SEComponent) {
        this.dom.appendChild(argument.dom);
      } else {
        console.error('SEComponent:', argument, 'is not an instance of UIElement.');
      }
    }

    return this;
  }

  remove(...elements) {
    for (let i = 0; i < arguments.length; i++) {
      const argument = elements[i];

      if (argument instanceof SEComponent) {
        this.dom.removeChild(argument.dom);
      } else {
        console.error('UIElement:', argument, 'is not an instance of UIElement.');
      }
    }

    return this;
  }
}
