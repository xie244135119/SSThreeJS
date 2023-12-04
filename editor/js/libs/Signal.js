class Signal {
  name = '';

  // 观察者
  _fnlist = null;

  constructor(name) {
    this.name = name;
    this._fnlist = [];
  }

  destory() {
    this._fnlist = null;
  }

  /**
   * 增加消息触发
   * @param {function} fn 触发函数
   */
  add = (fn) => {
    this._fnlist.push(fn);
  };

  /**
   * 移除消息触发
   * @param {function} fn 触发函数
   */
  remove = (fn) => {
    const findIndex = this._fnlist.findIndex((item) => item.type === fn);
    this._fnlist.splice(findIndex, 1);
  };

  /**
   * 消息触发 不同的消息触发不同的机制
   * @param {object} object 消息传值对象
   */
  dispatch = (...items) => {
    this._fnlist.forEach((fn) => {
      fn?.(...items);
    });
  };
}

export default Signal;
