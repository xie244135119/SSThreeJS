import SSFileInterface from './file.interface';
import SSThreeObject from '../SSThreeObject';
import SSConfig from '../SSConfig';

export default class LightDebug extends SSFileInterface {
  /**
   *
   * @param {SSThreeObject} ssthreeObject three object
   */
  mount(ssthreeObject) {
    //
  }

  unmount() {}

  import() {}

  export() {}

  getDebugConfig() {
    return {
      //
    };
  }

  getDebugSelectTypes() {
    return SSConfig;
  }

  onDebugChange(data) {
    console.log(' 灯光改变 ', data);
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
}
