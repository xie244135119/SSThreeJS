import GUI, { Controller } from 'lil-gui';
import * as THREE from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import SSFile from '../SSTool/file';
import styles from './index.css';
import SSConfig from '../SSConfig/index';
import SSThreeObject from '../SSThreeObject';

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
   * 默认设置
   * 第一阶段：全部功能化配置 耦合到当前文件配置类中
   * 第二阶段 将调试类与功能拆分开
   */
  defaultSetting = {
    // 灯光
    light: [],
    // 相机
    camera: {},
    //
    // 后处理
    postProcess: {}
    // 新增的效果 <雨，雪，雾，围墙>

    // 对于不支持的功能，设计为插口，由外部支持
    // 1，路径取点功能
    // 2，自动连线功能 <基于选取的点位>
    // 3，指哪看哪, 视频融合
  };

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
   * @type GUI 其他调试 Gui
   */
  otherGui = null;

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
   * @param {{ lights: Array<{}>, camera:{}, orbitControls:{} }} fileSetting 加载的配置
   */
  import(fileSetting = {}) {
    const updateDataToObj = (dataObj = {}, source = {}) => {
      Object.keys(dataObj).forEach((key) => {
        if (source[key] instanceof THREE.Color) {
          source[key].set(dataObj[key]);
        } else if (source[key] instanceof THREE.Vector3) {
          source[key].copy(dataObj[key]);
        } else {
          source[key] = dataObj[key];
        }
      });
    };
    let existlights = this._ssthreeObject.threeScene.children.filter(
      (item) => item instanceof THREE.Light
    );
    existlights.forEach((e) => {
      e.removeFromParent();
    });
    existlights = null;
    //
    const { lights = [], camera = {}, orbitControls = {} } = fileSetting;
    lights.forEach((e) => {
      const light = new THREE[e.type]();
      this._ssthreeObject.threeScene.add(light);
      updateDataToObj(e, light);
    });
    updateDataToObj(camera, this._ssthreeObject.threeCamera);
    updateDataToObj(orbitControls, this._ssthreeObject.threeOrbitControl);
    this._ssthreeObject.threeOrbitControl.update();
  }

  /**
   * export setting to json
   */
  export() {
    const getDataFromObj = (obj) => {
      const resault = {
        type: obj.type
      };
      const props = this.getObjectDebugProps(obj);
      props.forEach((e) => {
        if (obj[e] === Infinity || obj[e] === -Infinity) {
          //
        } else {
          resault[e] = obj[e];
        }
      });
      return resault;
    };

    // light
    const lights = [];
    this._ssthreeObject.threeScene.children.forEach((child) => {
      if (child instanceof THREE.Light) {
        const data = getDataFromObj(child);
        lights.push(data);
      }
    });
    // Camera
    const camera = getDataFromObj(this._ssthreeObject.threeCamera);
    // OrbitControls
    const orbitControls = getDataFromObj(this._ssthreeObject.threeOrbitControl);
    orbitControls.target = this._ssthreeObject.threeOrbitControl.target;
    // PostProcess
    const resault = {
      lights,
      camera,
      orbitControls
    };
    SSFile.exportJson(resault, 'ssthreejs.setting.json');
  }

  /**
   * 获取设置调试的物体
   * @param {THREE.Object3D} object 材质物体
   */
  getObjectDebugProps = (object) => {
    const allProps = Object.keys(object);
    const validProps = allProps.filter(
      (prop) =>
        SSConfig.TYPEKEYS.IgnoreKeys.indexOf(prop) === -1 && typeof object[prop] !== 'function'
    );
    console.log(' object 支持调试的key值 ', object, validProps);
    return validProps;
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
    this._ssthreeObject.threeOrbitControl.addEventListener('change', (e) => {
      //
    });
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
    window.fileSetting = this;
    //
    this.lightGui = this._addLightsSetting();
    this.addDebugForObject(this._ssthreeObject.threeRenderer, this._debugGui);
    this.cameraGui = this._addCameraSetting();
    this.postProcessGui = this._addPostProcessSetting();
    // this.addDebugForObject(this._ssthreeObject.threeEffectComposer, this.postProcessGui);
    // postProcess test
    this.addDebugForObject(
      this._ssthreeObject.threeEffectComposer.passes[1].effects[0].luminanceMaterial,
      this.postProcessGui
    );
    this.addDebugForObject(
      this._ssthreeObject.threeEffectComposer.passes[1].effects[1],
      this.postProcessGui
    );

    this.developGui = this._addDevelopSetting();
    this.otherGui = this._addOtherSetting();
    this.addDebugForObject(this._ssthreeObject.threeOrbitControl, this.cameraGui);
    this.addDebugForObject(this._ssthreeObject.threeCamera, this.cameraGui);
    //
    this.cameraGui.onOpenClose((e) => {
      console.log(' gui onOpenClose 变化 ', e);
    });

    //
    this._ssthreeObject.threeScene.children.forEach((e) => {
      if (e instanceof THREE.Light) {
        this.addDebugForObject(e, this.lightGui);
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
  addDebugForObject(object, gui = this.otherGui) {
    if (!object) {
      return;
    }
    const validProps = this.getObjectDebugProps(object);
    const folder = gui.addFolder(object.type || object.constructor?.name || object.prototype?.name);
    this._addGuiForConfig(object, validProps, folder);
  }

  /**
   * add menu icon
   */
  _addMenuIcon = () => {
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
  _addGuiForConfig(options = {}, keys = [], floder = this._debugGui) {
    const addGuiByObject = (object, aFolderKey = '') => {
      if (object instanceof Object) {
        const valueKeys = Object.keys(object);
        const valueFolder = floder.addFolder(aFolderKey);
        valueKeys.forEach((valueKey) => {
          valueFolder.add(object, valueKey)?.onChange((v) => {
            object[valueKey] = v;
          });
        });
      }
    };

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
            value.setRGB(e.r, e.g, e.b);
          });
        continue;
      }
      // Array<Ob(ject>
      if (value instanceof Array) {
        value.forEach((e) => {
          if (e instanceof Object) {
            addGuiByObject(e, `${key}_${e.name || e.type}`);
          }
        });
        continue;
      }
      // object
      if (value instanceof Object) {
        addGuiByObject(value, key);
        continue;
      }
      // select type
      const types = SSConfig.STATUSVARS[key];
      if (types) {
        floder.add(options, key, types)?.onChange((v) => {
          options[key] = v;
        });
        continue;
      }
      if (options[key] === null) {
        continue;
      }
      floder.add(options, key)?.onChange((v) => {
        options[key] = v;
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
}
