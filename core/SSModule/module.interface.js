import SSThreeObject from '../SSThreeObject';
import SSPubSubcribeInstance from '../SSTool/pubsubscribe';

/**
 * @type string 更新通知
 * @param {{ target: SSModuleInterface, type: string, value: Object }}  type可选类型: add or change
 */
export const SSModuleUpdateScribe = 'SSModuleUpdateScribe';

export default class SSModuleInterface {
  /**
   * @type SSThreeObject 绑定的目标元素
   */
  ssthreeObject = null;

  /**
   * 挂载
   * @param {SSThreeObject} obj
   */
  moduleMount(obj) {
    //
  }

  /**
   * 卸载
   */
  moduleUnmount() {
    this.ssthreeObject = null;
  }

  /**
   * 导出配置
   * @returns {Object} 导出的配置项
   */
  moduleExport() {
    return {};
  }

  /**
   * 导入配置
   */
  moduleImport(obj) {
    console.log(' 导入配置 ', obj);
  }

  /**
   * 更新ui调试
   */
  moduleUpdateGui() {
    SSPubSubcribeInstance.publish(SSModuleUpdateScribe, this);
  }

  /**
   * 获取模块调试配置
   * @returns {Object} 调试工具配置
   */
  getModuleConfig() {
    return {};
  }

  /**
   * @returns {Object} 调试工具类型
   */
  getModuleSelectTypes() {
    return {
      slide: [1, 2, 3, 4]
    };
  }

  /**
   * 调试工具变化
   * @param {{ key: string, value: any, data: any  }} params
   */
  moduleGuiChange(params = {}) {
    //
  }
}
