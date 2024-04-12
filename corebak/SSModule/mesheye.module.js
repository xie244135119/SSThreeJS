import SSModuleInterface from './module.interface';

export default class SSMeshEyeModule extends SSModuleInterface {
  title = '模块-物体视角';

  moduleImport() {}

  moduleExport() {}

  module;

  moduleOpenDebug() {}

  moduleCloseDebug() {}

  moduleGuiChange(params) {
    console.log(' 模块参数变更的时候 ', params);
  }
}
