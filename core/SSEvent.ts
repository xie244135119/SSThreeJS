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

export enum SSEventType {
  // 单击事件
  CLICK = 'click',
  // 双击事件
  DBLCLICK = 'dblclick',
  // 拖拽
  DRAG = 'drag',
  // 长按事件
  LONGPRESS = 'longpress',
  // 右键事件
  CONTEXTMENU = 'contextmenu',
  // 鼠标按下
  MOUSEDOWN = 'mousedown',
  // 鼠标抬起
  MOUSEUP = 'mouseup',
  // 鼠标移动
  MOUSEMOVE = 'mousemove',
  // 鼠标进入元素
  MOUSEOVER = 'mouseover',
  // 鼠标取消元素
  MOUSECANCEL = 'mousecancel',
  // 键盘输入 任意按键
  KEYDOWN = 'keydown',
  // 键盘按下 字符按键
  KEYPRESS = 'keypress',
  // 键盘弹起
  KEYUP = 'keyup',
  // 撤销
  REVOKE = 'revoke',
  // 确定
  CONFIRM = 'Confirm'
}

export default class SSEvent {
  /**
   * 事件类型
   */
  static SSEventType = SSEventType;

  /**
   * @description 目标元素
   */
  _targetElement: HTMLElement = null;

  /**
   * 事件
   */
  _modelEventFunc: {
    [key: string]: {
      handler: Symbol;
      listener: (e: any) => void;
      skip?: boolean;
    }[];
  } = {};

  // timeout
  timeOut: NodeJS.Timeout = null;

  // drag
  _isDraging: boolean = false;

  // long press
  _isLongPress: boolean = false;

  // mouse move
  _modelMouseEvent = null;

  constructor(aContainer: HTMLElement) {
    this._targetElement = aContainer;
    this.addListeners();
  }

  destory() {
    this.removeListeners();
    clearTimeout(this.timeOut);
    this.timeOut = null;
    this._isLongPress = false;
    this._isDraging = false;
    this._modelEventFunc = null;
    this._modelMouseEvent = null;
  }

  /**
   * add event
   * @param aType 详见 SSEventType
   * @param aListener 函数
   */
  addEventListener = (type: SSEventType, listener: (e: any) => void) => {
    const list = this._modelEventFunc[type] || [];
    const symb = Symbol(`event ${type}`);
    list.push({
      handler: symb,
      listener: (e) => {
        listener?.(e);
      }
    });
    this._modelEventFunc[type] = list;
    return symb;
  };

  /**
   * remove event
   * @param aType 详见 SSEventType
   * @param aHandle 句柄
   */
  removeEventListener = (type: SSEventType, handler?: Symbol, listener?: (e: any) => void) => {
    const list = this._modelEventFunc[type] || [];
    const index = list.findIndex((item) => item.handler === handler || item.listener === listener);
    if (index !== -1) {
      list.splice(index, 1);
    }
  };

  /**
   * skip event
   * @param aType 详见 SSEventType
   * @param aHandle 句柄
   */
  skipEvent = (aType: SSEventType, aHandle: Symbol) => {
    const list = this._modelEventFunc[aType] || [];
    const item = list.find((item) => item.handler === aHandle);
    if (item) {
      item.skip = true;
    }
  };

  /**
   * cancel skip event
   * @param aType 详见 SSEventType
   * @param aHandle 句柄
   */
  cancelSkipEvent = (aType: SSEventType, aHandle: Symbol) => {
    const list = this._modelEventFunc[aType] || [];
    const item = list.find((item) => item.handler === aHandle);
    if (item) {
      item.skip = false;
    }
  };

  /**
   * 内部增加全系列注册事件
   */
  addListeners = () => {
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
  removeListeners = () => {
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
   */
  _getFuncsFromType = (type: SSEventType) =>
    this._modelEventFunc[type]?.filter((item) => item.skip !== true) || [];

  /**
   * register event
   */
  _onElementClick = (e: KeyboardEvent | PointerEvent) => {
    if (this._isDraging) {
      this._getFuncsFromType(SSEventType.DRAG).forEach((element) => {
        element.listener?.(e);
      });
      return;
    }
    if (this._isLongPress) {
      this._getFuncsFromType(SSEventType.LONGPRESS)?.forEach((element) => {
        element.listener?.(e);
      });
      return;
    }
    if (this.timeOut != null) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
    this.timeOut = setTimeout(() => {
      this._getFuncsFromType(SSEventType.CLICK)?.forEach((element) => {
        element.listener?.(e);
      });
    }, 50);
  };

  /**
   * 注册双击事件
   * @param {*} aCamera
   */
  _onElementDbClick = (e: KeyboardEvent | PointerEvent) => {
    clearTimeout(this.timeOut);
    this._getFuncsFromType(SSEventType.DBLCLICK)?.forEach((element) => {
      element.listener?.(e);
    });
  };

  /**
   * 注册鼠标移动事件
   */
  _onElementMouseMove = (e: KeyboardEvent | PointerEvent) => {
    this._getFuncsFromType(SSEventType.MOUSEMOVE)?.forEach((element) => {
      element.listener?.(e);
    }, 0);
  };

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  _onElementMouseOver = (e: KeyboardEvent | PointerEvent) => {
    this._getFuncsFromType(SSEventType.MOUSEOVER).forEach((element) => {
      element.listener?.(e);
    });
  };

  /**
   * 注册鼠标覆盖事件
   * @param {*} aCamera
   */
  _onElementMouseCancel = (e) => {
    this._getFuncsFromType(SSEventType.MOUSECANCEL).forEach((element) => {
      element.listener?.(e);
    });
  };

  /**
   * register event
   * @param {*} aCamera
   */
  _onElementPointDown = (e) => {
    this._getFuncsFromType(SSEventType.MOUSEDOWN).forEach((element) => {
      element.listener?.(e);
    });
    clearTimeout(this.timeOut);
    this._isDraging = false;
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
      element.listener?.(e);
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
      this._isDraging = true;
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
    clearTimeout(this.timeOut);
    this._isDraging = false;
    this._isLongPress = false;
    this._modelMouseEvent = {
      pointDownTime: new Date().valueOf(),
      clientX: e.clientX,
      clientY: e.clientY
    };
    this._getFuncsFromType(SSEventType.CONTEXTMENU).forEach((element) => {
      element.listener?.(e);
    });
  };

  /**
   * 注册键盘按下事件
   */
  _onKeyboardDown = (e) => {
    this._getFuncsFromType(SSEventType.KEYDOWN).forEach((element) => {
      element.listener?.(e);
    });

    if (['Backspace', 'Escape'].indexOf(e.key) !== -1) {
      this._getFuncsFromType(SSEventType.REVOKE).forEach((fnobj) => {
        fnobj.listener?.(e);
      });
    } else if (['Enter'].indexOf(e.key) !== -1) {
      this._getFuncsFromType(SSEventType.CONFIRM).forEach((fnobj) => {
        fnobj.listener?.(e);
      });
    }
  };

  /**
   * 注册键盘按下事件
   */
  _onKeyboardPress = (e) => {
    this._getFuncsFromType(SSEventType.KEYPRESS).forEach((element) => {
      element.listener?.(e);
    });
  };

  /**
   * 注册键盘按下事件
   */
  _onKeyboardUp = (e) => {
    this._getFuncsFromType(SSEventType.KEYUP).forEach((element) => {
      element.listener?.(e);
    });
  };
}
