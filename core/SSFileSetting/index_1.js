import GUI from 'lil-gui';
import * as THREE from 'three';
import SSFile from '../SSTool/file';
import styles from './index.css';
import SSThreeObject from '../SSThreeObject';
import SSFileInterface from './file.interface';

export default class SSFileSetting {
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
   * @type Array<SSFileInterface>
   */
  _modules = null;

  /**
   * @param {SSThreeObject} ssthreeObject 构造参数
   */
  constructor(ssthreeObject) {
    this._ssthreeObject = ssthreeObject;
  }

  destory() {
    this._debugGui.destroy();
  }

  /**
   * 模块注册
   * @param {Array<SSFileInterface>} modules
   */
  registerModules(modules = []) {
    this._modules = [];
    modules.forEach((E) => {
      const e = new E();
      e.name = E.name;
      e.mount?.(this._ssthreeObject);
      this._modules.push(e);
    });
  }

  /**
   * 模块解除注册
   */
  unregisterModules() {
    this._modules.forEach((e) => {
      e.unmount?.();
    });
    this._modules = null;
  }

  /**
   * export setting to json
   */
  export() {
    const resault = {};
    this._modules.forEach((e) => {
      const text = e.export?.();
      if (text) {
        resault[e.name] = text;
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
      if (fileSetting[e.name]) {
        e.import(fileSetting[e.name]);
      }
    });
  }

  /**
   * 增加调试
   */
  addDebugModel() {
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

    this._modules.forEach((e) => {
      const obj = e.getDebugConfig?.();
      const selectData = e.getDebugSelectTypes?.();
      if (obj) {
        const gui = this._debugGui.addFolder(e.name);
        this._addDebugForObject(obj, gui, e.onDebugChange, selectData);
      }
    });
  }

  /**
   * 移除调试
   */
  removeDebugModel() {
    this._menuContainer.parentElement.remove();
  }

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
    const exportbt = document.createElement('button');
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
   * @param {GUI} floder gui
   * @param {Function} onDebugChange 调试改变的时候
   * @param {object} selectSource select组件数据源
   */
  _addDebugForObject(
    options = {},
    floder = this._debugGui,
    onDebugChange = null,
    selectSource = {}
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
            onDebugChange?.({
              key,
              value: e,
              data: options
            });
          });
        continue;
      }
      // object
      if (value instanceof Object) {
        const valueKeys = Object.keys(value);
        const valueFolder = floder.addFolder(key);
        valueKeys.forEach((valueKey) => {
          valueFolder.add(value, valueKey)?.onChange((v) => {
            onDebugChange?.({
              key,
              value: v,
              data: options
            });
          });
        });
        continue;
      }
      // select type
      const types = selectSource[key];
      if (types) {
        floder.add(options, key, types)?.onChange((v) => {
          onDebugChange?.({
            key,
            value: v,
            data: options
          });
        });
        continue;
      }
      if (options[key] === null) {
        continue;
      }
      floder.add(options, key)?.onChange((v) => {
        onDebugChange?.({
          key,
          value: v,
          data: options
        });
      });
    }
  }
}
