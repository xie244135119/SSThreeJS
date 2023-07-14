import * as THREE from 'three';
import SSDispose from '../SSDispose';
import SSFileInterface from './file.interface';
import SSThreeObject from '../SSThreeObject';
// import SSConfig from '../SSConfig';

// 轨道控制
const defaultControlKeys = [
  'minPolarAngle',
  'maxPolarAngle',
  'enableDamping',
  'dampingFactor',
  'enableZoom',
  'zoomSpeed',
  'autoRotate',
  'autoRotateSpeed'
];

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
    // 移除默认灯光
    const originLights = this._ssthreeObject.threeScene.children.filter(
      (item) => item instanceof THREE.Light
    );
    originLights.forEach((e) => {
      SSDispose.dispose(e);
      e.removeFromParent();
    });

    const { lights = [], camera = {}, orbitControl = {} } = obj;
    lights.forEach((rest) => {
      const light = new THREE[rest.type]();
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
    });
    // 轨道控制
    const defaultControlVect3Keys = ['target'];
    defaultControlKeys.forEach((key) => {
      this._ssthreeObject.threeOrbitControl[key] = orbitControl[key];
    });
    defaultControlVect3Keys.forEach((key) => {
      this._ssthreeObject.threeOrbitControl[key].copy(orbitControl[key]);
    });
    // camera
    const defaultCameraVect3Keys = ['position'];
    defaultCameraVect3Keys.forEach((key) => {
      this._ssthreeObject.threeCamera[key].copy(camera[key]);
    });
    this._ssthreeObject.threeOrbitControl.update();
  }

  export() {
    // 灯光
    const lights = [];
    this._ssthreeObject.threeScene.children.forEach((e) => {
      if (e instanceof THREE.Light) {
        if (e.visible) {
          const obj = {};
          obj.type = e.constructor.name;
          Object.keys(this._lightProps[obj.type]).forEach((key) => {
            if (key === 'position') {
              obj[key] = {
                x: e[key].x,
                y: e[key].y,
                z: e[key].z
              };
            } else if (key === 'color') {
              obj[key] = e[key].getHex();
            } else if (key.indexOf('_') === -1) {
              obj[key] = e[key];
            }
          });
          lights.push(obj);
        }
      }
    });
    // 轨道控制
    // const {
    //   target,
    //   minPolarAngle,
    //   maxPolarAngle,
    //   enableDamping,
    //   dampingFactor,
    //   enableZoom,
    //   zoomSpeed,
    //   autoRotate,
    //   autoRotateSpeed
    // } = this._ssthreeObject.threeOrbitControl;
    // const orbitControl = {
    //   target,
    //   minPolarAngle,
    //   maxPolarAngle,
    //   enableDamping,
    //   dampingFactor,
    //   enableZoom,
    //   zoomSpeed,
    //   autoRotate,
    //   autoRotateSpeed
    // };
    const orbitControl = {};
    // 轨道控制
    const defaultControlVect3Keys = ['target'];
    [...defaultControlKeys, ...defaultControlVect3Keys].forEach((key) => {
      orbitControl[key] = this._ssthreeObject.threeOrbitControl[key];
    });

    // camera
    const { position } = this._ssthreeObject.threeCamera;
    const camera = {
      position
    };
    const obj = {
      lights,
      orbitControl,
      camera
    };
    return obj;
  }

  getDebugConfig() {
    const options = {
      lightType: this.getDebugSelectTypes().lightType[2],
      addOne: () => {
        const { lightType = this.getDebugSelectTypes().lightType[2] } = this._dynamicConfig;
        console.log(' add one light ', lightType);
        const light = new THREE[lightType]();
        this._ssthreeObject.threeScene.add(light);
        // 更新 调试
        this.forceUpdateDebug();
      }
    };
    // lights
    this._ssthreeObject.threeScene.children.forEach((e) => {
      if (e instanceof THREE.Light) {
        const list = options[e.type] || [];
        // 从 _lightProps 读取赋值
        const obj = {
          __id: e.id
        };
        Object.keys(this._lightProps[e.type]).forEach((key) => {
          obj[key] = e[key];
        });
        list.push(obj);
        options[e.type] = list;
      }
    });
    // orcontrol
    const orbitControl = {
      objType: 'threeOrbitControl'
    };
    defaultControlKeys.forEach((key) => {
      orbitControl[key] = this._ssthreeObject.threeOrbitControl[key];
    });
    options.orbitControl = orbitControl;
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
    // 复用的对象结构 直接使用已有的结构
    // 非复用结构 需要赋值 <获取scene上的场景元素>
    if (params.data.__id) {
      const obj3d = this._ssthreeObject.threeScene.getObjectById(params.data.__id);
      if (obj3d) {
        if (params.key === 'color') {
          obj3d[params.key].setRGB(params.value.r, params.value.g, params.value.b);
        } else {
          obj3d[params.key] = params.value;
        }
      }
    }

    //
    switch (params.data.objType) {
      case 'threeOrbitControl':
        this._ssthreeObject.threeOrbitControl[params.key] = params.value;
        break;

      default:
        break;
    }
  }
}
