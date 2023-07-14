/*
 * Author  xie244135119
 * Date  2021-12-01 18:29:01
 * LastEditors  xie244135119
 * LastEditTime  2023-04-11 10:33:11
 * Description three.js event
 */

/**
 * @enum {string}
 * @property {string} CLICK 单击事件
 * @property {string} DBLCLICK 双击事件
 * @property {string} DRAG 拖拽事件
 * @property {string} LONGPRESS 长按事件
 * @property {string} CONTEXTMENU 双击事件
 * @property {string} MOUSEMOVE 鼠标移动事件
 * @property {string} MOUSEOVER 鼠标划过事件
 * @property {string} MOUSECANCEL 鼠标取消事件
 */
const SSEventType = {
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
  MOUSECANCEL: 'mousecancel',
  // 键盘输入 任意按键
  KEYDOWN: 'keydown',
  // 键盘按下 字符按键
  KEYPRESS: 'keypress',
  // 键盘弹起
  KEYUP: 'keyup'
};
export default class SSEvent {
  /**
   * @type HTMLElement
   */
  _targetElement = null;

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
      this._addListeners();
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
   * @param {SSEventType} aType 详见 ThreeEvent.SSEventType
   * @param {function (Event | KeyboardEvent):void} aListener 监听事件
   * @returns {string | Symbol}
   */
  addEventListener = (aType = SSEventType.CLICK, aListener = () => {}) => {
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
   * @param {SSEventType} aType 详见 SSEventType
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
  _addListeners = () => {
    this._targetElement.addEventListener('pointerdown', this.#onElementPointDown);
    this._targetElement.addEventListener('pointerup', this.#onElementPointUp);
    this._targetElement.addEventListener('click', this.#onElementClick);
    this._targetElement.addEventListener('dblclick', this.#onElementDbClick);
    this._targetElement.addEventListener('contextmenu', this.#onElementContextMenu);
    this._targetElement.addEventListener('pointermove', this.#onElementMouseMove);
    this._targetElement.addEventListener('pointerover', this.#onElementMouseOver);
    this._targetElement.addEventListener('pointercancel', this.#onElementMouseCancel);
    window.addEventListener('keydown', this.#onKeyboardDown);
    window.addEventListener('keypress', this.#onKeyboardPress);
    window.addEventListener('keyup', this.#onKeyboardUp);
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
    this._targetElement.removeEventListener('pointerover', this.#onElementMouseOver);
    this._targetElement.removeEventListener('pointercancel', this.#onElementMouseCancel);
    window.removeEventListener('keydown', this.#onKeyboardDown);
    window.removeEventListener('keypress', this.#onKeyboardPress);
    window.removeEventListener('keyup', this.#onKeyboardUp);
  };

  /**
   * register event
   * @param {*} aCamera
   */
  #onElementClick = (e) => {
    if (this._isDrag) {
      this._modelEventFunc[SSEventType.DRAG]?.forEach((element) => {
        element.fn?.(e);
      });
      return;
    }
    if (this._isLongPress) {
      this._modelEventFunc[SSEventType.LONGPRESS]?.forEach((element) => {
        element.fn?.(e);
      });
      return;
    }
    if (this._timeroutId != null) {
      clearTimeout(this._timeroutId);
      this._timeroutId = null;
    }
    this._timeroutId = setTimeout(() => {
      this._modelEventFunc[SSEventType.CLICK]?.forEach((element) => {
        element.fn?.(e);
      });
    }, 50);
  };

  /**
   * 注册双击事件
   * @param {*} aCamera
   */
  #onElementDbClick = (e) => {
    clearTimeout(this._timeroutId);
    this._modelEventFunc[SSEventType.DBLCLICK]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  // /**
  //  * 注册鼠标移动事件
  //  */
  // #onElementMouseMove = SSThreeTool.throttle((e) => {
  //   this._modelEventFunc?.[SSEventType.MOUSEMOVE]?.forEach((element) => {
  //     element.fn?.(e);
  //   }, 0);
  // });

  /**
   * 注册鼠标移动事件
   */
  #onElementMouseMove = (e) => {
    this._modelEventFunc?.[SSEventType.MOUSEMOVE]?.forEach((element) => {
      element.fn?.(e);
    }, 0);
  };

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  #onElementMouseOver = (e) => {
    this._modelEventFunc[SSEventType.MOUSEOVER]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  #onElementMouseCancel = (e) => {
    this._modelEventFunc[SSEventType.MOUSECANCEL]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * register event
   * @param {*} aCamera
   */
  #onElementPointDown = (e) => {
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
  #onElementPointUp = (e) => {
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
   * @param {Event} e
   */
  #onElementContextMenu = (e) => {
    clearTimeout(this._timeroutId);
    this._isDrag = false;
    this._isLongPress = false;
    this._modelMouseEvent = {
      pointDownTime: new Date().valueOf(),
      clientX: e.clientX,
      clientY: e.clientY
    };
    this._modelEventFunc[SSEventType.CONTEXTMENU]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册键盘按下事件
   */
  #onKeyboardDown = (e) => {
    this._modelEventFunc[SSEventType.KEYDOWN]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册键盘按下事件
   */
  #onKeyboardPress = (e) => {
    this._modelEventFunc[SSEventType.KEYPRESS]?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册键盘按下事件
   */
  #onKeyboardUp = (e) => {
    this._modelEventFunc[SSEventType.KEYUP]?.forEach((element) => {
      element.fn?.(e);
    });
  };
}

SSEvent.SSEventType = SSEventType;
