import GUI from 'lil-gui';
import * as THREE from 'three';
import SSFile from '../SSTool/file';
import styles from './index.css';
import SSThreeObject from '../SSThreeObject';
import SSModuleInterface, { SSModuleUpdateScribe } from './module.interface';
import SSPubSubcribeInstance from '../SSTool/pubsubscribe';

export default class SSModuleCenter {
  /**
   * @type GUI
   */
  _debugGui = null;

  /**
   * @type SSThreeObject
   */
  _ssthreeObject = null;

  /**
   * @type HTMLElement dom
   */
  _menuContainer = null;

  /**
   * @type Array<SSModuleInterface>
   */
  _modules = null;

  /**
   * 当前正在调试的模块
   * @type {SSModuleInterface}
   */
  _currentEnableModule = null;

  /**
   * @param {SSThreeObject} ssthreeObject 构造参数
   */
  constructor(ssthreeObject) {
    this._ssthreeObject = ssthreeObject;
  }

  destroy() {
    this.unregisterModules();
    this.closeDebugModel();
    this._debugGui.destroy();
  }

  /**
   * 模块注册
   * @param {Array<SSModuleInterface>} modules
   */
  registerModules(modules = []) {
    this._modules = [];
    modules.forEach((E) => {
      const e = new E();
      e.ssthreeObject = this._ssthreeObject;
      e.__name = E.name;
      e.moduleMount?.(this._ssthreeObject);
      this._modules.push(e);
    });
    SSPubSubcribeInstance.subscribe(SSModuleUpdateScribe, (aModule) => {
      const lastgui = aModule.__gui;
      lastgui?.destroy();
      if (this._debugGui) {
        const gui = this._addModuleGui(aModule);
        gui.open();
      }
    });
  }

  /**
   * 模块解除注册
   */
  unregisterModules() {
    this._modules.forEach((e) => {
      e.ssthreeObject = null;
      e.moduleUnmount?.();
    });
    this._modules = null;
  }

  /**
   * 根据类名查询模块实例
   * @param {string} moduleName
   * @returns {SSModuleInterface}
   */
  getModuleByClassName = (moduleName) => this._modules.find((e) => e.__name === moduleName);

  /**
   * export setting to json
   */
  export() {
    const resault = {};
    this._modules.forEach((e) => {
      const text = e.moduleExport?.();
      if (text) {
        resault[e.__name] = text;
      }
    });
    SSFile.exportJson(resault, 'ssthreejs.setting.json');
  }

  /**
   * 导入设置
   * @param {{}} fileSetting 加载的配置
   */
  import(fileSetting = {}) {
    this._modules.forEach((e) => {
      const moduleObj = fileSetting[e.__name];
      if (moduleObj) {
        // 将深层次对象进行递墷
        const moduleObjDeep = (obj) => {
          Object.keys(obj).forEach((key) => {
            const value = obj[key];
            if (value instanceof Object) {
              // color
              if (value.r !== undefined && value.g !== undefined && value.b !== undefined) {
                obj[key] = new THREE.Color(value.r, value.g, value.b);
              }
              // vector3 不处理
              moduleObjDeep(value);
            }
          });
        };
        moduleObjDeep(moduleObj);
        e.moduleImport(moduleObj);
        SSPubSubcribeInstance.publish(SSModuleUpdateScribe, e);
      }
    });
  }

  /**
   * 增加调试
   */
  openDebugModel() {
    // 右下角调试按钮
    this._addDrawIcon();
    // 右侧的抽屉
    this._addDrawerView();
    //
    if (this._debugGui === null) {
      this._debugGui = new GUI({
        autoPlace: true,
        injectStyles: true,
        title: '场景调试',
        closeFolders: true,
        container: this._menuContainer,
        width: '100%'
      });
    }
    this._modules.forEach(this._addModuleGui);
  }

  /**
   * 移除调试
   */
  closeDebugModel() {
    this._menuContainer.parentElement.remove();
  }

  /**
   * 增加 模块调试工具
   * @param {SSModuleInterface} aModule 模块
   * @returns {GUI}
   */
  _addModuleGui = (aModule) => {
    const obj = aModule.getModuleConfig?.();
    if (obj) {
      // 调试过程中，只能单一模块生效
      obj['模块调试'] = false;
      const gui = this._debugGui.addFolder(aModule.title || aModule.__name);
      aModule.__gui = gui;
      const configSource = aModule.getModuleConfigSource?.();
      this._addDebugForObject(
        obj,
        gui,
        (params) => {
          // 开启新模块
          if (params.key === '模块调试') {
            if (params.value) {
              // 取消原有的效果处理
              if (this._currentEnableModule) {
                this._currentEnableModule.moduleUpdateGuiValue('模块调试', false);
              }
              aModule.moduleOpenDebug();
              this._currentEnableModule = aModule;
            } else {
              aModule.moduleCloseDebug();
              this._currentEnableModule = null;
            }
          }
          //
          if (obj['模块调试']) {
            aModule.moduleGuiChange?.({
              ...params,
              target: obj
            });
          }
        },
        configSource
      );
      return gui;
    }
    return null;
  };

  /**
   * add menu icon
   */
  _addDrawIcon = () => {
    const menudiv = document.createElement('div');
    menudiv.innerText = '调';
    menudiv.className = styles.menuicon;
    this._ssthreeObject.threeContainer.parentElement.append(menudiv);
    // adjust style
    if (
      ['relative', 'absolute'].indexOf(
        this._ssthreeObject.threeContainer.parentElement.style.position
      ) === -1
    ) {
      this._ssthreeObject.threeContainer.parentElement.style.position = 'relative';
    }
    menudiv.onclick = () => {
      this._menuContainer.parentElement.style.right = '0px';
      this._menuContainer.parentElement.style.opacity = 1;
    };
  };

  /**
   * add drawer view
   */
  _addDrawerView = () => {
    const drawer = document.createElement('div');
    drawer.className = styles.drawer;
    this._ssthreeObject.threeContainer.parentElement.append(drawer);

    const header = document.createElement('div');
    header.className = styles.drawerheader;
    drawer.append(header);
    const title = document.createElement('span');
    title.className = styles.drawerheadertitle;
    title.innerText = '场景调试';
    header.append(title);
    const closetext = document.createElement('div');
    closetext.innerText = 'X';
    closetext.className = styles.drawerheaderclose;
    header.append(closetext);
    closetext.onpointerdown = () => {
      // drawer.style.opacity = 0;
      drawer.style.right = `-${drawer.offsetWidth}px`;
    };

    const content = document.createElement('div');
    content.className = styles.contentview;
    drawer.append(content);
    this._menuContainer = content;

    const footer = document.createElement('div');
    footer.className = styles.drawerfooter;
    drawer.append(footer);
    const exportbt = document.createElement('div');
    exportbt.className = styles.drawerfooterbtn;
    exportbt.innerText = '导出配置';
    footer.append(exportbt);
    exportbt.onclick = () => {
      this.export();
    };
  };

  /**
   * 新增 gui 事件
   * @param {object} options 配置对象
   * @param {GUI} [floder] gui
   * @param {function({key: string, value: string, data: object}):void} [onDebugChange] 调试改变的时候
   * @param {object} [optionSource={}] select组件数据源
   */
  _addDebugForObject(
    options = {},
    floder = this._debugGui,
    onDebugChange = null,
    optionSource = {}
  ) {
    const keys = Object.keys(options);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const value = options[key];

      if (value instanceof THREE.Color) {
        floder
          .addColor(
            {
              [key]: value.getRGB({})
            },
            key
          )
          .onChange((e) => {
            options[key] = e;
            onDebugChange?.({
              key,
              value: e,
              data: options
            });
          });
        continue;
      }
      // Array<Ob(ject>
      if (value instanceof Array) {
        const arrayfolder = floder.addFolder(key);
        value.forEach((e, index) => {
          if (e instanceof Object) {
            const objfolder = arrayfolder.addFolder(index + 1);
            this._addDebugForObject(e, objfolder, onDebugChange, optionSource);
          }
        });
        continue;
      }
      // object
      if (value instanceof Object && !(value instanceof Function)) {
        // addGuiByObject(value, key);
        const objfolder = floder.addFolder(key);
        this._addDebugForObject(value, objfolder, onDebugChange, optionSource);
        continue;
      }

      // select type
      const types = optionSource[key];
      if (types instanceof Array) {
        floder.add(options, key, types)?.onChange((v) => {
          options[key] = v;
          onDebugChange?.({
            key,
            value: v,
            data: options
          });
        });
        continue;
      }
      const optionData = optionSource[key] || {};
      floder.add(options, key, optionData.min, optionData.max, optionData.step)?.onChange((v) => {
        options[key] = v;
        onDebugChange?.({
          key,
          value: v,
          data: options
        });
      });
    }
  }
}
