/*
 * Author  xie244135119
 * Date  2021-12-01 18:29:01
 * LastEditors  xie244135119
 * LastEditTime  2023-04-11 10:33:11
 * Description three.js event
 */

import ThreeTool from './SSTool';

const EventType = {
  // 单击事件
  CLICK: 'click',
  // 双击事件
  DBLCLICK: 'dblclick',
  // 拖拽
  DRAG: 'drag',
  // 长按事件
  LONGPRESS: 'longpress',
  // 右键事件
  CONTEXTMENU: 'contextmenu',
  // 鼠标移动
  MOUSEMOVE: 'mousemove',
  // 鼠标进入元素
  MOUSEOVER: 'mouseover',
  // 鼠标取消元素
  MOUSECANCEL: 'mousecancel'
};
// export { EventType };
export default class ThreeEvent {
  // parent element
  _targetElement = document.body;

  // all model event
  _modelEventFunc = {};

  // timeout
  _timeroutId = 0;

  // drag
  _isDrag = false;

  // long press
  _isLongPress = false;

  // mouse move
  _modelMouseEvent = null;

  constructor(aContainer = this._targetElement) {
    if (aContainer) {
      this._targetElement = aContainer;
      this.#addListeners();
    }
  }

  destory() {
    this.#removeListeners();
    clearTimeout(this._timeroutId);
    this._timeroutId = 0;
    this._isLongPress = false;
    this._isDrag = false;
    this._modelEventFunc = null;
    this._modelMouseEvent = null;
  }

  /**
   * 注册事件
   * @param {string} aType 详见 ThreeEvent.EventType
   * @param {func} aListener 监听事件
   * @returns {string | Symbol}
   */
  addEventListener = (aType = EventType.CLICK, aListener = () => {}) => {
    const list = this._modelEventFunc[aType] || [];
    const symb = Symbol(`event ${aType}`);
    list.push({
      handle: symb,
      fn: (e) => {
        aListener?.(e);
      }
    });
    this._modelEventFunc[aType] = list;
    return symb;
  };

  /**
   * remove event
   * @param {string} aType 详见 ThreeEvent.EventType
   * @param {string | Symbol} aHandle 句柄
   */
  removeEventListener = (aType, aHandle) => {
    const list = this._modelEventFunc[aType] || [];
    const index = list.findIndex((item) => item.handle === aHandle);
    list.splice(index, 1);
  };

  /**
   * 内部增加全系列注册事件
   */
  #addListeners = () => {
    this._targetElement.addEventListener('pointerdown', this.#onElementPointDown);
    this._targetElement.addEventListener('pointerup', this.#onElementPointUp);
    this._targetElement.addEventListener('click', this.#onElementClick);
    this._targetElement.addEventListener('dblclick', this.#onElementDbClick);
    this._targetElement.addEventListener('contextmenu', this.#onElementContextMenu);
    this._targetElement.addEventListener('pointermove', this.#onElementMouseMove);
    this._targetElement.addEventListener('mousemove', this.#onElementMouseMove);
    this._targetElement.addEventListener('mouseover', this.#onElementMouseOver);
    this._targetElement.addEventListener('pointerover', this.#onElementMouseOver);
    // this._targetElement.addEventListener('pointerout', this.#onElementMouseCancel);
    this._targetElement.addEventListener('pointercancel', this.#onElementMouseCancel);
    this._targetElement.addEventListener('mouseout', this.#onElementMouseCancel);
  };

  /**
   * 移除注册事件
   */
  #removeListeners = () => {
    this._targetElement.removeEventListener('pointerdown', this.#onElementPointDown);
    this._targetElement.removeEventListener('pointerup', this.#onElementPointUp);
    this._targetElement.removeEventListener('click', this.#onElementClick);
    this._targetElement.removeEventListener('dblclick', this.#onElementDbClick);
    this._targetElement.removeEventListener('contextmenu', this.#onElementContextMenu);
    this._targetElement.removeEventListener('pointermove', this.#onElementMouseMove);
    this._targetElement.removeEventListener('mousemove', this.#onElementMouseMove);
    this._targetElement.removeEventListener('mouseover', this.#onElementMouseOver);
    this._targetElement.removeEventListener('pointerover', this.#onElementMouseOver);
    // this._targetElement.removeEventListener('pointerout', this.#onElementMouseCancel);
    this._targetElement.removeEventListener('pointercancel', this.#onElementMouseCancel);
    this._targetElement.removeEventListener('mouseout', this.#onElementMouseCancel);
  };

  /**
   * register event
   * @param {*} aCamera
   */
  #onElementClick = (e = new Event()) => {
    if (this._isDrag) {
      this._modelEventFunc[EventType.DRAG]?.forEach((element) => {
        element.fn?.(e);
      });
      return;
    }
    if (this._isLongPress) {
      this._modelEventFunc[EventType.LONGPRESS]?.forEach((element) => {
        element.fn?.(e);
      });
      return;
    }
    if (this._timeroutId != null) {
      clearTimeout(this._timeroutId);
      this._timeroutId = null;
    }
    this._timeroutId = setTimeout(() => {
      this._modelEventFunc[EventType.CLICK]?.forEach((element) => {
        element.fn?.(e);
      });
    }, 50);
  };

  /**
   * 注册双击事件
   * @param {*} aCamera
   */
  #onElementDbClick = (e = new Event()) => {
    clearTimeout(this._timeroutId);
    this._modelEventFunc[EventType.DBLCLICK]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册鼠标移动事件
   * @param {*} aCamera
   */
  #onElementMouseMove = ThreeTool.debounce((e = new Event()) => {
    this._modelEventFunc?.[EventType.MOUSEMOVE]?.forEach((element) => {
      element.fn?.(e);
    });
  });

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  #onElementMouseOver = (e = new Event()) => {
    this._modelEventFunc[EventType.MOUSEOVER]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  #onElementMouseCancel = (e = new Event()) => {
    this._modelEventFunc[EventType.MOUSECANCEL]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * register event
   * @param {*} aCamera
   */
  #onElementPointDown = (e = new Event()) => {
    clearTimeout(this._timeroutId);
    this._isDrag = false;
    this._isLongPress = false;
    this._modelMouseEvent = {
      pointDownTime: new Date().valueOf(),
      clientX: e.clientX,
      clientY: e.clientY
    };
  };

  /**
   * register point up
   * @param {*} aCamera
   */
  #onElementPointUp = (e = new Event()) => {
    // 是否为长按
    const now = new Date().valueOf();
    const { clientX, clientY } = e;
    if (!clientX || !clientY || !this._modelMouseEvent) {
      return;
    }
    if (
      Math.abs(clientX - this._modelMouseEvent.clientX) > 5 ||
      Math.abs(clientY - this._modelMouseEvent.clientY) > 5
    ) {
      this._isDrag = true;
    } else if (now - this._modelMouseEvent.pointDownTime > 500) {
      // 判断是否为长按
      this._isLongPress = true;
    }
  };

  /**
   * 注册鼠标右键事件
   * @param {*} aCamera
   */
  #onElementContextMenu = (e = new Event()) => {
    clearTimeout(this._timeroutId);
    this._isDrag = false;
    this._isLongPress = false;
    this._modelMouseEvent = {
      pointDownTime: new Date().valueOf(),
      clientX: e.clientX,
      clientY: e.clientY
    };
    this._modelEventFunc[EventType.CONTEXTMENU]?.forEach((element) => {
      element.fn?.(e);
    });
  };
}

ThreeEvent.EventType = EventType;
