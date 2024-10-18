
class SSPubSubcribe {
  // 观察者
  _subscribeObjs = {};

  /**
   * 订阅消息
   * @param {string} name 消息名称
   * @param {Function} fn
   */
  subscribe = (name, fn) => {
    const arry = this._subscribeObjs[name] || [];
    const idenifer = Symbol('subcribe');
    arry.push({
      type: idenifer,
      fn
    });
    this._subscribeObjs[name] = arry;
    return idenifer;
  };

  /**
   * 移除订阅
   * @param {string} name 消息名称
   */
  remove = (name, idenifer) => {
    const arry = this._subscribeObjs[name] || [];
    const findIndex = arry.findIndex((item) => item.type === idenifer);
    arry.splice(findIndex, 1);
  };

  /**
   * 发布消息
   * @param {string} name 消息名称
   * @param {object} data 消息传值对象
   */
  publish = (name = '', data = {} || []) => {
    const array = this._subscribeObjs[name] || [];
    for (let index = 0; index < array.length; index += 1) {
      const { fn } = array[index];
      fn?.(data);
    }
  };
}

const SSPubSubcribeInstance = new SSPubSubcribe();
export default SSPubSubcribeInstance;
