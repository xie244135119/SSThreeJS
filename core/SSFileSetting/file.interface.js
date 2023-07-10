import SSThreeObject from '../SSThreeObject';

export default class SSFileInterface {
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
    //
  }

  /**
   * 增加调试工具
   */

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
   * @returns {Object} 调试工具配置
   */
  getDebugConfig() {
    return {};
  }

  /**
   * 调试工具变化
   * @param {{ key: string, value: any, data: any  }} params
   */
  onDebugChange(params = {}) {
    //
  }
}
