import SSThreeObject from '../SSThreeObject';
import SSPubSubcribeInstance from '../SSTool/pubsubscribe';

/**
 * @type string 更新通知
 * @param {{ target: SSFileInterface, type: string, value: Object }}  type可选类型: add or change
 */
export const SSUpdateScribe = 'SSUpdateScribe';

export default class SSFileInterface {
  /**
   * @type SSThreeObject 绑定的目标元素
   */
  ssthreeObject = null;

  /**
   * 挂载
   * @param {SSThreeObject} obj
   */
  mount(obj) {
    //
  }

  /**
   * 卸载
   */
  unmount() {
    this.ssthreeObject = null;
  }

  /**
   * 导出配置
   * @returns {Object} 导出的配置项
   */
  export() {
    return {};
  }

  /**
   * 导入配置
   */
  import(obj) {
    console.log(' 导入配置 ', obj);
  }

  /**
   * 更新调试
   */
  forceUpdateDebug() {
    SSPubSubcribeInstance.publish(SSUpdateScribe, this);
  }

  /**
   * @returns {Object} 调试工具配置
   */
  getDebugConfig() {
    return {};
  }

  /**
   * @returns {Object} 调试工具类型
   */
  getDebugSelectTypes() {
    return {
      slide: [1, 2, 3, 4]
    };
  }

  /**
   * 调试工具变化
   * @param {{ key: string, value: any, data: any  }} params
   */
  onDebugChange(params = {}) {
    //
  }
}
