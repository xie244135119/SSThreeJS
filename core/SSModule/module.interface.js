/* eslint-disable no-unused-vars */
import GUI from 'lil-gui';
import SSThreeObject from '../SSThreeObject';
import SSPubSubcribeInstance from '../SSTool/pubsubscribe';

/**
 * @type string 更新通知
 * @param {{ target: SSModuleInterface, type: string, value: Object }}  type可选类型: add or change
 */
export const SSModuleUpdateScribe = 'SSModuleUpdateScribe';

export default class SSModuleInterface {
  /**
   * @type string 类标注名称<用于模块调试显示>
   */
  title = '';

  /**
   * @type GUI 模块绑定的gui
   */
  __gui = null;

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
   * 整块 Gui 更新调试
   */
  moduleUpdateGui() {
    SSPubSubcribeInstance.publish(SSModuleUpdateScribe, this);
  }

  /**
   * 模块数值 更新调试
   */
  moduleUpdateGuiValue(key, value) {
    if (!this.__gui) {
      return;
    }
    // 普通控制器
    const controler = this.__gui.controllers.find((item) => item.property === key);
    if (controler) {
      controler.setValue(value);
      return;
    }
    // key 为子gui, value为object
    const childgui = this.__gui.folders.find((item) => item._title === key);
    if (childgui) {
      Object.keys(value).forEach((item) => {
        childgui.controllers.find((item2) => item2.property === item)?.setValue(value[item]);
      });
    }
  }

  /**
   * 获取模块调试配置
   * @returns {Object} 调试工具配置
   */
  getModuleConfig() {
    return {
      slide: 1
    };
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
