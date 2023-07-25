import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

export default class SSLoader {
  /**
   * load obj
   * @param {string} aObjPath obj path
   * @param {string} aMaterialPath material path
   * @param {THREE.MaterialCreatorOptions} aMaterialOptions material
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<THREE.Group>}
   */
  static loadObj = (aObjPath, aMaterialPath, aMaterialOptions, manager) => {
    const mtlloader = new MTLLoader(manager);
    mtlloader.setMaterialOptions(aMaterialOptions);
    return mtlloader.loadAsync(aMaterialPath).then((materil) => {
      const objloader = new OBJLoader(manager);
      objloader.setMaterials(materil);
      return objloader.loadAsync(aObjPath);
    });
  };

  /**
   * load fbx
   * @param {string} path fbx path
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<THREE.Group>}
   */
  static loadFbx = (path, manager) => {
    const fbxloader = new FBXLoader(manager);
    return fbxloader.loadAsync(path);
  };

  /**
   * @param {ArrayBuffer|string} buffer 数据
   * @param {string} directory directory path
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<THREE.Group>}
   */
  static loadFbxBuffer = (buffer, directory, manager) =>
    new Promise((reslove) => {
      const fbxloader = new FBXLoader(manager);
      const obj = fbxloader.parse(buffer, directory);
      reslove(obj);
    });

  /**
   * load gltf
   * @param {string} path model path
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<GLTF>}
   */
  static loadGltf = (path, manager) => {
    const gltfLoader = new GLTFLoader(manager);
    return gltfLoader.loadAsync(path);
  };

  /**
   * load gltf
   * @param {ArrayBuffer|string} buffer 数据
   * @param {string} directory directory目录
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<GLTF>}
   */
  static loadGltfBuffer = (buffer, directory, manager) => {
    const gltfLoader = new GLTFLoader(manager);
    return gltfLoader.parseAsync(buffer, directory);
  };

  /**
   * load gltf
   * @param {ArrayBuffer|string} aBuffer 数据
   * @param {string} directory directory目录
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<GLTF>}
   */
  static loadGltfDracoBuffer = (aBuffer, directory, manager) => {
    const gltfLoader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader(manager);
    dracoLoader.setDecoderPath('/static/three/draco/');
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader);
    return new Promise((reslove, reject) => {
      gltfLoader.parse(
        aBuffer,
        directory,
        (gltf) => {
          reslove(gltf);
        },
        (e) => {
          reject(e);
        }
      );
    });
  };

  /**
   * load gltf Draco
   * @param {string} path model path
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<GLTF>}
   */
  static loadGltfDraco(path, manager) {
    const gltfLoader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader(manager);
    dracoLoader.setDecoderPath('/static/three/draco/');
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(this.dracoLoader);
    const baseDirectory = path.split('/');
    baseDirectory.pop();
    return new Promise((reslove, reject) => {
      gltfLoader.load(
        path,
        (gltf) => {
          reslove(gltf);
        },
        null,
        (e) => {
          reject(e);
        }
      );
    });
  }

  /**
   * load gltf ktx
   * @param {ArrayBuffer | string} buffer model buffer
   * @param {string} directory directory path
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<GLTF>}
   */
  static loadGltfOptKTXBuffer = (buffer, directory, manager) => {
    const ktx2Loader = new KTX2Loader(manager)
      .setTranscoderPath('/static/three/basis/')
      .detectSupport(this.ssthreeObject.threeRenderer);
    const gltfLoader = new GLTFLoader(manager);
    gltfLoader.setKTX2Loader(ktx2Loader);
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    return new Promise((reslove, reject) => {
      gltfLoader.parse(
        buffer,
        directory,
        (gltf) => {
          reslove(gltf);
        },
        (e) => {
          reject(e);
        }
      );
    });
  };

  /**
   * load gltf ktx
   * @param {string} path model path
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<GLTF>}
   */
  static loadGltfOptKTX = (path, manager) => {
    const ktx2Loader = new KTX2Loader(manager)
      .setTranscoderPath('/static/three/basis/')
      .detectSupport(this.ssthreeObject.threeRenderer);
    const gltfLoader = new GLTFLoader(manager);
    gltfLoader.setKTX2Loader(ktx2Loader);
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    return new Promise((reslove, reject) => {
      gltfLoader.load(
        path,
        (gltf) => {
          reslove(gltf);
        },
        null,
        (e) => {
          reject(e);
        }
      );
    });
  };

  /**
   * load gltf ktx
   * @param {string} path model path
   * @param {boolean} addToScene add to
   * @returns {Promise<GLTF>}
   */
  // static loadGltfOptKTX = (path, addToScene = true) =>
  // LoadingManager.shareInstance.getModelDataByUrl(path).then((data) => {
  //   const ktx2Loader = new KTX2Loader(LoadingManager.shareInstance.threeLoadingManager)
  //     .setTranscoderPath('/public/static/three/basis/')
  //     .detectSupport(this.ssthreeObject.threeRenderer);
  //   const gltfLoader = new GLTFLoader(LoadingManager.shareInstance.threeLoadingManager);
  //   gltfLoader.setKTX2Loader(ktx2Loader);
  //   gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  //   const baseDirectory = path.split('/');
  //   baseDirectory.pop();
  //   return new Promise((reslove, reject) => {
  //     gltfLoader.parse(
  //       data,
  //       `${baseDirectory.join('/')}/`,
  //       (gltf) => {
  //         const obj = gltf.scene;
  //         if (addToScene) {
  //           this.ssthreeObject.threeScene.add(obj);
  //         }
  //         reslove(gltf);
  //       },
  //       (e) => {
  //         reject(e);
  //       }
  //     );
  //   });
  // });

  /**
   * v2.0 create Sprite
   * @param {string} texturePath sprite texture path
   * @param {THREE.SpriteMaterialParameters} materialOptions material options
   * @return {Promise<THREE.Sprite}
   */
  static loadSprite = (texturePath, materialOptions) =>
    new Promise((reslove, reject) => {
      const spriteMap = new THREE.TextureLoader().load(texturePath, undefined, undefined, (e) => {
        reject(e);
      });
      spriteMap.wrapS = THREE.RepeatWrapping;
      spriteMap.wrapT = THREE.RepeatWrapping;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteMap,
        depthWrite: false,
        side: THREE.DoubleSide,
        depthTest: false,
        ...materialOptions
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      reslove(sprite);
    });

  /**
   * load svg
   * @param {string} aSVGpath svg path
   * @param {THREE.LoadingManager} [manager] loading manager
   * @returns {Promise<THREE.SVGResult>}
   */
  static loadSVG = (aSVGpath, manager) => {
    const svgloader = new SVGLoader(manager);
    return new Promise((reslove, reject) => {
      svgloader.load(
        aSVGpath,
        (obj) => {
          reslove(obj);
        },
        null,
        (e) => {
          reject(e);
        }
      );
    });
  };
}
