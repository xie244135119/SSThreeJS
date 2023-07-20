import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water2';
import SSModuleInterface from '../SSModule/module.interface';
import waterNormal1Img from '../assets/textures/water/Water_1_M_Normal.jpg';
import waterNormal2Img from '../assets/textures/water/Water_2_M_Normal.jpg';

export default class SSWater extends SSModuleInterface {
  defaultConfig = {
    visible: true,
    color: new THREE.Color(0xffffff),
    scale: 10,
    flowX: 0,
    flowY: 0
  };

  water = null;

  _setConfigValue() {
    // console.log('this.water', this.water);
    if (this.water) {
      this.water.visible = this.defaultConfig.visible;
      this.water.material.uniforms.color.value.set(
        this.defaultConfig.color.r,
        this.defaultConfig.color.g,
        this.defaultConfig.color.b
      );
      this.water.material.uniforms.config.value.w = this.defaultConfig.scale;
      this.water.material.uniforms.flowDirection.value.x = this.defaultConfig.flowX;
      this.water.material.uniforms.flowDirection.value.y = this.defaultConfig.flowY;
      this.water.material.uniforms.flowDirection.value.normalize();
      // console.log(' this.water.material.uniforms.flowDirection.value.normalize() ', this.water.material.uniforms.flowDirection.value.normalize());
    }
  }

  moduleMount() {
    // console.log(' 开发模块注册 ', this.defaultConfig);
    // 初始化赋值
    this._setConfigValue();
    this.createWater();
  }

  moduleUnmount() {
    // console.log(' 开发模块解除注册 ');
    this.ssthreeObject.threeScene.remove(this.water);
    this.water = null;
  }

  moduleImport(e = {}) {
    // console.log(' 导入的文件配置 import ', e);
    this.defaultConfig = e;
    this._setConfigValue();
  }

  moduleExport() {
    // console.log(' 处理完戯后的文件配置 export ', this.defaultConfig);
    return this.defaultConfig;
  }

  getModuleConfig() {
    return this.defaultConfig;
  }

  moduleGuiChange(e) {
    // console.log(' develop change ', e);
    this.defaultConfig = e.target;
    //
    this._setConfigValue();
  }

  createWater = () => {
    // const params = {
    //   color: '#ffffff',
    //   scale: 4,
    //   flowX: 1,
    //   flowY: 1
    // };

    const waterGeometry = new THREE.PlaneGeometry(20, 20);

    const water = new Water(waterGeometry, {
      color: this.defaultConfig.color,
      scale: this.defaultConfig.scale,
      flowDirection: new THREE.Vector2(this.defaultConfig.flowX, this.defaultConfig.flowY),
      textureWidth: 1024,
      textureHeight: 1024,
      normalMap0: new THREE.TextureLoader().load(waterNormal1Img, (texture) => {
        // eslint-disable-next-line no-multi-assign
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      normalMap1: new THREE.TextureLoader().load(waterNormal2Img, (texture) => {
        // eslint-disable-next-line no-multi-assign
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: '#FFCC00',
      waterColor: '#0099CC'
    });

    water.position.y = 0.2;
    water.rotation.x = Math.PI * -0.5;
    this.water = water;
    this.ssthreeObject.threeScene.add(this.water);
    // this.jsRef.current.ssthreeObject.threeScene.add(water);
    return water;
  };
}
