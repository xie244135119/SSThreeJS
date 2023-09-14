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
  // 鼠标按下
  MOUSEDOWN: 'mousedown',
  // 鼠标抬起
  MOUSEUP: 'mouseup',
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
  KEYUP: 'keyup',
  // 撤销
  REVOKE: 'revoke',
  // 确定
  CONFIRM: 'Confirm'
};
export default class SSEvent {
  /**
   * @type HTMLElement
   */
  _targetElement = null;

  /**
   * @type Array<function>
   */
  list = null;

  /**
   * @type {{ string: Array }}
   */
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
    this._removeListeners();
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
   * @param {function (KeyboardEvent | PointerEvent):void} aListener 监听事件
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
   * skip event
   * @param {SSEventType} aType 详见 SSEventType
   * @param {string | Symbol} aHandle 句柄
   */
  skipEvent = (aType, aHandle) => {
    const list = this._modelEventFunc[aType] || [];
    const item = list.find((item) => item.handle === aHandle);
    if (item) {
      item.skip = true;
    }
  };

  /**
   * cancel skip event
   * @param {SSEventType} aType 详见 SSEventType
   * @param {string | Symbol} aHandle 句柄
   */
  cancelSkipEvent = (aType, aHandle) => {
    const list = this._modelEventFunc[aType] || [];
    const item = list.find((item) => item.handle === aHandle);
    if (item) {
      item.skip = false;
    }
  };

  /**
   * 内部增加全系列注册事件
   */
  _addListeners = () => {
    this._targetElement.addEventListener('pointerdown', this._onElementPointDown);
    this._targetElement.addEventListener('pointerup', this._onElementPointUp);
    this._targetElement.addEventListener('click', this._onElementClick);
    this._targetElement.addEventListener('dblclick', this._onElementDbClick);
    this._targetElement.addEventListener('contextmenu', this._onElementContextMenu);
    this._targetElement.addEventListener('pointermove', this._onElementMouseMove);
    this._targetElement.addEventListener('pointerover', this._onElementMouseOver);
    this._targetElement.addEventListener('pointercancel', this._onElementMouseCancel);
    window.addEventListener('keydown', this._onKeyboardDown);
    window.addEventListener('keypress', this._onKeyboardPress);
    window.addEventListener('keyup', this._onKeyboardUp);
  };

  /**
   * 移除注册事件
   */
  _removeListeners = () => {
    this._targetElement.removeEventListener('pointerdown', this._onElementPointDown);
    this._targetElement.removeEventListener('pointerup', this._onElementPointUp);
    this._targetElement.removeEventListener('click', this._onElementClick);
    this._targetElement.removeEventListener('dblclick', this._onElementDbClick);
    this._targetElement.removeEventListener('contextmenu', this._onElementContextMenu);
    this._targetElement.removeEventListener('pointermove', this._onElementMouseMove);
    this._targetElement.removeEventListener('pointerover', this._onElementMouseOver);
    this._targetElement.removeEventListener('pointercancel', this._onElementMouseCancel);
    window.removeEventListener('keydown', this._onKeyboardDown);
    window.removeEventListener('keypress', this._onKeyboardPress);
    window.removeEventListener('keyup', this._onKeyboardUp);
  };

  /**
   * 查询相关的点击事件
   * @param {string} type 事件类型
   * @returns {{ handle: string | symbol, fn: function (KeyboardEvent|PointerEvent):void , skip: boolean}[]}
   */
  _getFuncsFromType = (type) =>
    this._modelEventFunc[type]?.filter((item) => item.skip !== true) || [];

  /**
   * register event
   * @param {KeyboardEvent | PointerEvent} e
   */
  _onElementClick = (e) => {
    if (this._isDrag) {
      this._getFuncsFromType(SSEventType.DRAG).forEach((element) => {
        element.fn?.(e);
      });
      return;
    }
    if (this._isLongPress) {
      this._getFuncsFromType(SSEventType.LONGPRESS)?.forEach((element) => {
        element.fn?.(e);
      });
      return;
    }
    if (this._timeroutId != null) {
      clearTimeout(this._timeroutId);
      this._timeroutId = null;
    }
    this._timeroutId = setTimeout(() => {
      this._getFuncsFromType(SSEventType.CLICK)?.forEach((element) => {
        element.fn?.(e);
      });
    }, 50);
  };

  /**
   * 注册双击事件
   * @param {*} aCamera
   */
  _onElementDbClick = (e) => {
    clearTimeout(this._timeroutId);
    this._getFuncsFromType(SSEventType.DBLCLICK)?.forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册鼠标移动事件
   */
  _onElementMouseMove = (e) => {
    this._getFuncsFromType(SSEventType.MOUSEMOVE)?.forEach((element) => {
      element.fn?.(e);
    }, 0);
  };

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  _onElementMouseOver = (e) => {
    this._getFuncsFromType(SSEventType.MOUSEOVER).forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  _onElementMouseCancel = (e) => {
    this._getFuncsFromType(SSEventType.MOUSECANCEL).forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * register event
   * @param {*} aCamera
   */
  _onElementPointDown = (e) => {
    this._getFuncsFromType(SSEventType.MOUSEDOWN).forEach((element) => {
      element.fn?.(e);
    });
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
  _onElementPointUp = (e) => {
    this._getFuncsFromType(SSEventType.MOUSEUP).forEach((element) => {
      element.fn?.(e);
    });
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
  _onElementContextMenu = (e) => {
    clearTimeout(this._timeroutId);
    this._isDrag = false;
    this._isLongPress = false;
    this._modelMouseEvent = {
      pointDownTime: new Date().valueOf(),
      clientX: e.clientX,
      clientY: e.clientY
    };
    this._getFuncsFromType(SSEventType.CONTEXTMENU).forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册键盘按下事件
   */
  _onKeyboardDown = (e) => {
    this._getFuncsFromType(SSEventType.KEYDOWN).forEach((element) => {
      element.fn?.(e);
    });

    if (['Backspace', 'Escape'].indexOf(e.key) !== -1) {
      this._getFuncsFromType(SSEventType.REVOKE).forEach((fnobj) => {
        fnobj.fn?.(e);
      });
    } else if (['Enter'].indexOf(e.key) !== -1) {
      this._getFuncsFromType(SSEventType.CONFIRM).forEach((fnobj) => {
        fnobj.fn?.(e);
      });
    }
  };

  /**
   * 注册键盘按下事件
   */
  _onKeyboardPress = (e) => {
    this._getFuncsFromType(SSEventType.KEYPRESS).forEach((element) => {
      element.fn?.(e);
    });
  };

  /**
   * 注册键盘按下事件
   */
  _onKeyboardUp = (e) => {
    this._getFuncsFromType(SSEventType.KEYUP).forEach((element) => {
      element.fn?.(e);
    });
  };
}

SSEvent.SSEventType = SSEventType;
