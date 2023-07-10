import GUI from 'lil-gui';
import * as THREE from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import SSFile from '../SSTool/file';
import styles from './index.css';
import SSConfig from '../SSConfig/index';
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
   * @type GUI 灯光gui
   */
  lightGui = null;

  /**
   * @type GUI 后处理gui
   */
  postProcessGui = null;

  /**
   * @type GUI 开发gui <路径取点工具>
   */
  developGui = null;

  /**
   * @type GUI 摄像头gui
   */
  cameraGui = null;

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
   * export setting to json
   */
  export() {
    const resault = {};
    this._modules.forEach((e) => {
      const text = e.export();
      if (text) {
        resault[e.name] = text;
      }
    });
    SSFile.exportJson(resault, 'ssthreejs.setting.json');
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
      e.mount(this._ssthreeObject);
      this._modules.push(e);
    });
  }

  /**
   * 模块解除注册
   */
  unregisterModules() {
    this._modules.forEach((e) => {
      e.unmount();
    });
    this._modules = null;
  }

  /**
   * 获取设置调试的物体
   * @param {THREE.Object3D} object 材质物体
   */
  getObjectDebugProps = (object) => {
    const allProps = Object.keys(object);
    return allProps;
    // const validProps = allProps.filter(
    //   (prop) =>
    //     SSConfig.TYPEKEYS.IgnoreKeys.indexOf(prop) === -1 && typeof object[prop] !== 'function'
    // );
    // console.log(' object 支持调试的key值 ', object, validProps);
    // return validProps;
  };

  /**
   * 增加调试
   */
  addDebugModel() {
    // 右下角调试按钮
    this._addMenuIcon();
    // 右侧的抽屉
    this._addDrawerView();
    //
    if (this._debugGui === null) {
      this._debugGui = new GUI({
        autoPlace: true,
        injectStyles: true,
        title: '场景配置',
        closeFolders: true,
        container: this._menuContainer,
        width: 300
      });
    }

    this._modules.forEach((e) => {
      const obj = e.getDebugConfig();
      if (obj) {
        const gui = this._debugGui.addFolder(e.name);
        this.addDebugForObject(obj, gui, e.onDebugChange);
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
   * add dynamic debug，适用于新增单场景调试
   * @param {THREE.Object3D | Pass} object
   * @param {GUI} gui
   */
  addDebugForObject(object, gui = this.otherGui, onChange) {
    if (!object) {
      return;
    }
    const validProps = this.getObjectDebugProps(object);
    const folder = gui.addFolder(object.type || object.constructor?.name || object.prototype?.name);
    this._addGuiForConfig(object, validProps, folder, onChange);
  }

  /**
   * add menu icon
   */
  _addMenuIcon = () => {
    this._ssthreeObject.threeContainer.style.position = 'relative';
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
   * @param {THREE.Object3D | Pass} options 配置对象
   * @param {Array<string>} keys 属性值
   * @param {GUI} floder gui
   */
  _addGuiForConfig(options = {}, keys = [], floder = this._debugGui, onGuiChange = null) {
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
            // value.setRGB(e.r, e.g, e.b);
            onGuiChange?.({
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
            // value[valueKey] = v;
            onGuiChange?.({
              key,
              value: v,
              data: options
            });
          });
        });
        continue;
      }
      // select type
      const types = SSConfig.STATUSVARS[key];
      if (types) {
        floder.add(options, key, types)?.onChange((v) => {
          // options[key] = v;
          onGuiChange?.({
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
        // options[key] = v;
        onGuiChange?.({
          key,
          value: v,
          data: options
        });
      });
    }

    if (options instanceof THREE.Object3D) {
      const props = {
        removeOne: () => {
          this._ssthreeObject.threeScene.remove(options);
          floder.destroy();
        }
      };
      floder.add(props, 'removeOne');
    }
  }

  /**
   * 增加灯光 相关配置
   */
  _addLightsSetting = () => {
    const lightfolder = this._debugGui.addFolder('Light Helper');

    // 新增额外的灯光
    const options = {
      LIGHT_TYPE: SSConfig.STATUSVARS.LIGHT_TYPE[0],
      addOne: () => {
        const lightTypeController = lightfolder.controllers.find(
          (e) => e.property === 'LIGHT_TYPE'
        );
        console.log(' lightType ', lightTypeController);
        const lightType = lightTypeController.getValue();

        const light = new THREE[lightType]();
        this._ssthreeObject.threeScene.add(light);
        this.addDebugForObject(light, lightfolder);
      }
    };
    Object.keys(options).forEach((key) => {
      const types = SSConfig.STATUSVARS[key];
      lightfolder.add(options, key, types);
    });
    return lightfolder;
  };

  /**
   * 增加后处理相关
   */
  _addPostProcessSetting = () => {
    const postProcessFolder = this._debugGui.addFolder('PostProcess Helper');
    return postProcessFolder;
  };

  /**
   * 业务功能
   */
  _addDevelopSetting = () => {
    const developFolder = this._debugGui.addFolder('Develop Helper');
    return developFolder;
  };

  /**
   * 摄像头相关
   */
  _addCameraSetting = () => {
    const otherFolder = this._debugGui.addFolder('Camera Helper');
    return otherFolder;
  };

  /**
   * webglRender
   * @returns
   */
  _addRenderSetting = () => {
    const otherFolder = this._debugGui.addFolder('WebglRender Helper');
    return otherFolder;
  };

  /**
   * 其他相关
   */
  _addOtherSetting = () => {
    const otherFolder = this._debugGui.addFolder('Other Helper');
    return otherFolder;
  };

  /**
   *
   */
}
