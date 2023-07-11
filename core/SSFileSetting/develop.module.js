import GUI from 'lil-gui';
import * as THREE from 'three';
import SSThreeObject from '../SSThreeObject';
import SSThreeLoop from '../SSThreeLoop';
import SSDispose from '../SSDispose';
import SSFileInterface from './file.interface';

export default class SSDevelopMode extends SSFileInterface {
  /**
   * @type GUI
   */
  _debugGui = null;

  /**
   * @type SSThreeObject
   */
  _ssThreeObject = null;

  /**
   * @type THREE.Group
   */
  _pathGroup = null;

  destory() {}

  /**
   * 增加调试模式
   * @param {HTMLElement} container
   */
  addDebugMode(container) {
    if (this._debugGui === null) {
      const gui = new GUI({
        container,
        title: '调试工具',
        width: 300,
        closeFolders: false,
        autoPlace: false
      });
      this._debugGui = gui;
    }

    // 路径选择工具
    const pathObj = {
      visible: false,
      resault: '输出选中的结果'
    };
    const pathGui = this._debugGui.addFolder('路径选择');
    this._addGuiForConfig(pathObj, pathGui, (key, value) => {
      console.log(' gui change ', key, value);
      if (key === 'visible') {
        if (value) {
          this.openChoosePathMode();
        } else {
          this.closeChoosePathMode();
        }
      }
    });
  }

  /**
   * 开启选择路径模式
   */
  openChoosePathMode() {
    // 选择相机
    // const camera = new THREE.OrthographicCamera();
    // camera.position.set(0, 0, 1);
    // SSThreeLoop.add(() => {
    //   this._ssThreeObject?.threeRenderer.render(this._ssThreeObject.threeScene, camera);
    // });

    const material = new THREE.MeshBasicMaterial({
      color: 'yellow'
    });
    const group = new THREE.Group();
    group.position.set(0, 0, 1);
    group.name = 'debug_path_group';
    this._ssThreeObject?.threeScene.add(group);
    this._pathGroup = group;

    const planeGeometry = new THREE.PlaneGeometry(8, 8, 1);
    const mesh = new THREE.Mesh(planeGeometry, material);
    group.add(mesh);
  }

  /**
   * 关闭选择路径模式
   */
  closeChoosePathMode() {
    const group = this._ssThreeObject.threeScene.getObjectByName('debug_path_group');
    if (group) {
      SSDispose.dispose(group);
      group.removeFromParent();
    }
  }

  /**
   * 新增 gui 事件
   * @param {object} options 配置对象
   * @param {GUI} floder gui
   * @param {function} onChange 事件触发
   */
  _addGuiForConfig(options = {}, floder = this._debugGui, onChange = () => {}) {
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
            value.setRGB(e.r, e.g, e.b);
            onChange?.(key, e);
          });
        continue;
      }
      // select type
      const types = null;
      if (types) {
        floder.add(options, key, types)?.onChange((v) => {
          options[key] = v;
          onChange?.(key, v);
        });
        continue;
      }
      floder.add(options, key)?.onChange((v) => {
        options[key] = v;
        onChange?.apply(key, v);
      });
    }
  }

  mount() {
    console.log(' 开发模块注册 ');
  }

  unmount() {
    console.log(' 开发模块解除注册 ');
  }

  getDebugConfig() {
    return {
      visible: true,
      interinty: 3
    };
  }

  import(e = {}) {
    console.log(' 导入的文件配置 import ', e);
  }

  export() {
    return {
      interinty: 10
    };
  }

  onDebugChange(e) {
    console.log(' develop change ', e);
  }
}
