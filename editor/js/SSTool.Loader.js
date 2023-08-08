export default class SSLoader {
  /**
   * 获取模型路径目录
   * @returns
   */
  getModelDirectory = (aPath = '') => {
    const baseDirectory = aPath.split('/');
    baseDirectory.pop();
    const directory = `${baseDirectory.join('/')}/`;
    return directory;
  };

  /**
   * load fbx
   * @param {string} aFbxpath fbx path
   * @param {string} addToScene add to scene
   * @returns {Promise<THREE.Group>}
   */
  loadFbx = (aFbxpath = '') =>
    LoadingManager.shareInstance
      .getModelDataByUrl(aFbxpath)
      .then((data) =>
        SSLoader.loadFbxBuffer(
          data,
          this.getModelDirectory(aFbxpath),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param {string} path model path
   * @param {THREE.LoadingManager} manager loading manager
   * @returns {Promise<GLTF>}
   */
  loadGltf = (path) =>
    LoadingManager.shareInstance
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfBuffer(
          data,
          this.getModelDirectory(path),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param {*} path
   * @returns
   */
  loadGltfDraco = (path) =>
    LoadingManager.shareInstance
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfDracoBuffer(
          data,
          this.getModelDirectory(path),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );

  /**
   * load gltf
   * @param {*} path
   * @returns
   */
  loadGltfOptKTX = (path) =>
    LoadingManager.shareInstance
      .getModelDataByUrl(path)
      .then((data) =>
        SSLoader.loadGltfOptKTXBuffer(
          data,
          this.getModelDirectory(path),
          LoadingManager.shareInstance.threeLoadingManager
        )
      );
}
