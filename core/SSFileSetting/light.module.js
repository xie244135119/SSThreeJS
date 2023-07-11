import * as THREE from 'three';
import SSFileInterface from './file.interface';
import SSThreeObject from '../SSThreeObject';
import SSConfig from '../SSConfig';

export default class SSLightModule extends SSFileInterface {
  /**
   * @type {Object} 动态配置
   */
  _dynamicConfig = null;

  /**
   * 灯光props
   */
  _lightProps = {
    AmbientLight: {
      visible: false,
      color: new THREE.Color(0, 0, 0),
      intensity: 1
    },
    DirectionalLight: {
      visible: false,
      position: new THREE.Vector3(0, 0, 0),
      castShadow: false,
      color: new THREE.Color(0, 0, 0),
      intensity: 1
    },
    SpotLight: {
      visible: false,
      position: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(0, 0, 0),
      intensity: 1,
      distance: 0,
      angle: 2,
      penumbra: 0, // 0-1
      decay: 2
    },
    PointLight: {
      visible: false,
      position: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(0, 0, 0),
      intensity: 1,
      distance: 0,
      castShadow: false,
      decay: 2
    },
    RectAreaLight: {
      visible: false,
      color: new THREE.Color(0, 0, 0),
      intensity: 1,
      width: 10,
      height: 10
    }
  };

  /**
   * @type {SSThreeObject} three object
   */
  _ssthreeObject = null;

  /**
   *
   * @param {SSThreeObject} object three object
   */
  mount(object) {
    this._dynamicConfig = {};
    this._ssthreeObject = object;
  }

  unmount() {
    this._dynamicConfig = null;
  }

  import(obj) {
    console.log(' import light ', obj);
    const { type, ...rest } = obj;
    const light = new THREE[type]();
    Object.keys(rest).forEach((key) => {
      if (key === 'position') {
        light[key].set(rest[key].x, rest[key].y, rest[key].z);
      } else if (key === 'color') {
        light[key].set(rest[key]);
      } else {
        light[key] = rest[key];
      }
    });
    this._ssthreeObject.threeScene.add(light);
  }

  export() {
    const lights = [];
    this._ssthreeObject.threeScene.children.forEach((e) => {
      if (e instanceof THREE.Light) {
        if (e.visible) {
          const obj = {};
          obj.type = e.constructor.name;
          Object.keys(this._lightProps[e.constructor.name]).forEach((key) => {
            if (key === 'position') {
              obj[key] = {
                x: e[key].x,
                y: e[key].y,
                z: e[key].z
              };
            } else if (key === 'color') {
              obj[key] = e[key].getHex();
            } else {
              obj[key] = e[key];
            }
          });
          lights.push(obj);
        }
      }
    });
    console.log(' export light ', lights);
    return lights;
  }

  getDebugConfig() {
    const options = {
      lightType: this.getDebugSelectTypes().lightType[0],
      addOne: () => {
        const { lightType = this.getDebugSelectTypes().lightType[0] } = this._dynamicConfig;
        console.log(' add one light ', lightType);
        const light = new THREE[lightType]();
        this._ssthreeObject.threeScene.add(light);
        // 更新 调试
        this.updateDebug();
      }
    };
    //
    this._ssthreeObject.threeScene.children.forEach((e) => {
      if (e instanceof THREE.Light) {
        const list = options[e.type] || [];
        // 从 _lightProps 读取赋值
        const obj = {};
        Object.keys(this._lightProps[e.type]).forEach((key) => {
          obj[key] = e[key];
        });
        list.push(obj);
        options[e.type] = list;
      }
    });
    console.log(' 获取的调试选项 ', options);
    return options;
  }

  getDebugSelectTypes() {
    return {
      lightType: ['AmbientLight', 'DirectionalLight', 'SpotLight', 'PointLight', 'RectAreaLight']
    };
  }

  onDebugChange(params) {
    console.log(' gui 灯光改变 ', params);
    this._dynamicConfig[params.key] = params.value;
  }
}
