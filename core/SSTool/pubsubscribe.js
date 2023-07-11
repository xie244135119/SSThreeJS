/*
 * Author  Murphy.xie
 * Date  2022-09-25 17:25:21
 * LastEditors  Murphy.xie
 * LastEditTime  2022-10-15 13:22:07
 * Description 发布订阅模式
 */

class SSPubSubcribe {
  // 观察者
  subscribeObjs = {};

  /**
   * 订阅消息
   * @param {消息名称}} name
   * @param {触发的函数} fn
   */
  subscribe = (name, fn) => {
    const arry = this.subscribeObjs[name] || [];
    const idenifer = Symbol('subcribe');
    arry.push({
      type: idenifer,
      fn
    });
    this.subscribeObjs[name] = arry;
    return idenifer;
  };

  /**
   * 移除订阅
   * @param {消息名称} name
   */
  remove = (name, idenifer) => {
    const arry = this.subscribeObjs[name] || [];
    const findIndex = arry.findIndex((item) => item.type === idenifer);
    arry.splice(findIndex, 1);
  };

  /**
   * 发布消息
   * @param {消息名称} name
   * @param {消息传值对象} data
   */
  publish = (name = '', data = {} || []) => {
    const array = this.subscribeObjs[name] || [];
    for (let index = 0; index < array.length; index += 1) {
      const { fn } = array[index];
      fn?.(data);
    }
  };
}

const SSPubSubcribeInstance = new SSPubSubcribe();
export default SSPubSubcribeInstance;
