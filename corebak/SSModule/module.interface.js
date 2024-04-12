/* eslint-disable no-unused-vars */
import GUI from 'lil-gui';
import SSThreeObject from '../SSThreeObject';
import SSPubSubcribeInstance from '../SSTool/PubSubscribe';

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
  ssThreeObject = null;

  /**
   * 挂载
   * @override
   */
  moduleMount() {
    //
  }

  /**
   * 卸载
   * @override
   */
  moduleUnmount() {
    this.ssThreeObject = null;
  }

  /**
   * 导出配置
   * @override
   * @returns {Object} 导出的配置项
   */
  moduleExport() {
    return null;
  }

  /**
   * 导入配置
   * @override
   */
  moduleImport(obj) {
    //
  }

  /**
   * 整块 Gui 更新调试
   */
  moduleUpdateGui() {
    SSPubSubcribeInstance.publish(SSModuleUpdateScribe, this);
  }

  /**
   * 模块数值 更新调试
   * @param {string} key 唯一key值
   * @param {*} value 更新的数据值
   * @returns
   */
  moduleUpdateGuiValue(key, value) {
    if (!this.__gui) {
      return;
    }
    // 普通控制器
    const controler = this.__gui.controllers.find((item) => item.property === key);
    if (controler && controler.getValue() !== value) {
      controler.setValue(value);
      return;
    }
    // key 为子gui, value为object
    const childgui = this.__gui.folders.find((item) => item._title === key);
    if (childgui) {
      Object.keys(value).forEach((item) => {
        const con = childgui.controllers.find((item2) => item2.property === item);
        if (con && con.getValue() !== value[item]) {
          con.setValue(value[item]);
        }
      });
    }
  }

  /**
   * 获取模块调试配置
   * @override
   * @returns {Object} 调试工具配置
   */
  getModuleConfig() {
    return {
      slide: 1,
      number: 2
    };
  }

  /**
   * @override
   * @returns {Object} 调试工具数据结构
   */
  getModuleConfigSource() {
    return {
      slide: [1, 2, 3, 4],
      number: {
        min: 0,
        max: 100,
        step: 1
      }
    };
  }

  /**
   * 模块开启功能调试
   * @override
   */
  moduleOpenDebug() {
    //
  }

  /**
   * 调试工具变化
   * @override
   * @param {{ key: string, value: any, data: object, target: object  }} params 参数
   */
  moduleGuiChange(params = {}) {
    //
  }

  /**
   * 模块关闭功能调试
   * @override
   */
  moduleCloseDebug() {
    //
  }
}
