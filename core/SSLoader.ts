import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader, MaterialCreatorOptions } from 'three/examples/jsm/loaders/MTLLoader';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry, TextGeometryParameters } from 'three/examples/jsm/geometries/TextGeometry';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

export default class SSLoader {

  /**
   * load obj
   * @param aObjPath obj地址
   * @param aMaterialPath 材质地址 
   * @param aMaterialOptions 材质选项
   * @param manager 加载器
   * @returns 
   */
  static loadObj = (aObjPath: string, aMaterialPath: string, aMaterialOptions?: MaterialCreatorOptions , manager?: THREE.LoadingManager) => {
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
   * @param path 文件目录
   * @param manager 加载器
   * @returns 
   */
  static loadFbx = (path: string, manager?: THREE.LoadingManager) => {
    const fbxloader = new FBXLoader(manager);
    return fbxloader.loadAsync(path);
  };

  /**
   * load fbx
   * @param buffer 二进制数据
   * @param directory 文件目录
   * @param manager 加载器
   * @returns 
   */
  static loadFbxBuffer = (buffer: ArrayBuffer|string, directory: string, manager?:THREE.LoadingManager) =>
    new Promise((reslove) => {
      const fbxloader = new FBXLoader(manager);
      const obj = fbxloader.parse(buffer, directory);
      reslove(obj);
    });

  /**
   * load gltf
   * @param path 二进制数据
   * @param manager 加载器
   * @returns 
   */
  static loadGltf = (path: string, manager?:THREE.LoadingManager) => {
    const gltfLoader = new GLTFLoader(manager);
    return gltfLoader.loadAsync(path);
  };

  /**
   * load gltf
   * @param buffer 二进制数据
   * @param directory 文件目录
   * @param manager 加载器
   * @returns 
   */
  static loadGltfBuffer = (buffer:string | ArrayBuffer, directory: string, manager?:THREE.LoadingManager) => {
    const gltfLoader = new GLTFLoader(manager);
    return gltfLoader.parseAsync(buffer, directory);
  };


  /**
   * load gltf
   * @param buffer 二进制数据
   * @param directory 文件目录
   * @param manager 加载器
   * @returns 
   */
  static loadGltfDracoBuffer: (buffer: string | ArrayBuffer, directory: string, manager?: THREE.LoadingManager)=>Promise<GLTF> = (aBuffer, directory, manager) => {
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
   * load gltf draco
   * @param path 路径
   * @param manager 加载器
   * @returns 
   */
  static loadGltfDraco:(path: string, manager?: THREE.LoadingManager)=>Promise<GLTF> = (path, manager)=>{
    const gltfLoader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader(manager);
    dracoLoader.setDecoderPath('/static/three/draco/');
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader);
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
   * @param buffer 路径
   * @param directory 文件目录
   * @param manager 加载器
   * @returns 
   */
  static loadGltfOptKTXBuffer: (buffer: string | ArrayBuffer, directory: string, manager?: THREE.LoadingManager)=>Promise<GLTF> = (buffer, directory, manager) => {
    const ktx2Loader = new KTX2Loader(manager)
      .setTranscoderPath('/static/three/basis/');
      // .detectSupport(this.ssThreeObject.threeRenderer);
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
   * @param path 路径
   * @param manager 加载器
   * @returns 
   */
  static loadGltfOptKTX:(path: string,  manager?: THREE.LoadingManager)=>Promise<GLTF> = (path, manager) => {
    const ktx2Loader = new KTX2Loader(manager)
      .setTranscoderPath('/static/three/basis/');
      // .detectSupport(this.ssThreeObject.threeRenderer);
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
   * v2.0 create Sprite
   * @param texturePath 纹理路径
   * @param materialOptions 材质属性
   * @returns 
   */
  static loadSprite:(texturePath: string, materialOptions?: THREE.SpriteMaterialParameters)=>Promise<THREE.Sprite> = (texturePath, materialOptions = {}) =>
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
   * @param aSVGpath svg 地址
   * @param manager 加载器
   * @returns 
   */
  static loadSVG:(aSVGpath: string, manager?: THREE.LoadingManager)=>Promise<SVGResult> = (aSVGpath, manager) => {
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

  /**
   * 加载几何体文字
   * @param text 文字
   * @param geometryOptions 几何体属性
   * @param materialOptions 材质属性
   * @returns
   */
  static geomertryFromText:(text: string, geometryOptions?: TextGeometryParameters,materialOptions?: THREE.MeshPhongMaterialParameters)=>Promise<THREE.Mesh> = (text, geometryOptions,materialOptions) =>
    new Promise((reslove, reject) => {
      const loader = new FontLoader();
      loader.load(
        '/static/three/examples/fonts/optimer_regular.typeface.json',
        (font) => {
          const materials = new THREE.MeshPhongMaterial({ color: 'white', flatShading: true, ...(materialOptions || {})  });
          const textGeo = new TextGeometry(text, {
            font,
            size: 0.5,
            height: 0.1,
            ...(geometryOptions || {})
          });
          const textMesh = new THREE.Mesh(textGeo, materials);
          textMesh.rotation.x = 0;
          textMesh.rotation.y = Math.PI;
          reslove(textMesh);
        },
        null,
        reject
      );
    });
}
