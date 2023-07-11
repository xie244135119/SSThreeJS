import SSThreeObject from '../SSThreeObject';
import SSPubSubcribeInstance from '../SSTool/pubsubscribe';

// 订阅更新
export const SSFileInterfaceUpdateScribe = 'SSFileInterfaceUpdateScribe';

export default class SSFileInterface {
  /**
   * 挂载
   * @param {SSThreeObject} obj
   */
  mount(obj) {
    console.log(' 配置three object配置 ', obj);
  }

  /**
   * 卸载
   */
  unmount() {
    //
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
  updateDebug() {
    SSPubSubcribeInstance.publish(SSFileInterface, this);
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
