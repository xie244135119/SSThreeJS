/*
 * Author  Kayson.Wan
 * Date  2022-09-08 23:20:28
 * LastEditors  xie244135119
 * LastEditTime  2023-06-08 13:55:25
 * Description
 */
import * as THREE from 'three';

export default class SSDispose {

  operationQueue: Set<(e?:any)=>void> = null;


  constructor() {
    this.operationQueue = new Set();
  }

  destory() {
    this.operationQueue.forEach((e) => {
      SSDispose.dispose(e);
    });
    THREE.Cache.clear();
  }

  /**
   * add object to queue
   * @param {THREE.Object3D} aObj
   */
  add = (aObj) => {
    this.operationQueue.add(aObj);
  };

  /**
   * 具体元素 uniforms
   */
  static disposeUniforms = (uniforms = {}) => {
    const uniformKeys = Object.getOwnPropertyNames(uniforms);
    uniformKeys.forEach((e) => {
      const { value } = uniforms[e];
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    });
  };

  /**
   * 2.0 dispose 元素
   */
  static dispose = (aObj: any) => {
    const disposeTexture = (texture: THREE.Texture) => {
      if (!(texture instanceof THREE.Texture)) {
        return;
      }
        texture.dispose();
    };
    const disposeGeometry = (geo: THREE.BufferGeometry) => {
      if (!(geo instanceof THREE.BufferGeometry)) {
        return;
      }
        geo.dispose();
    };
    const disposeMaterial = (material: THREE.Material) => {
      if (!(material instanceof THREE.Material)) {
        return
      }
      if (material instanceof THREE.ShaderMaterial) {
        const { uniforms = {} } = material;
        this.disposeUniforms(uniforms);
      }
        const materialKeys = Object.keys(material);
        materialKeys.forEach((e) => {
          if (material[e] instanceof THREE.Texture) {
            material[e].dispose();
            material[e] = null;
          }
        });
        material.dispose();
    };
    const disposeObject3D = (aObj3D: THREE.Object3D) => {
        if (!(aObj3D instanceof THREE.Object3D)) {
          return;
        }
        // user data
        if (aObj3D.userData) {
          const allKeys = Object.getOwnPropertyNames(aObj3D.userData);
          allKeys.forEach((key) => {
            const value = aObj3D.userData[key];
            disposeGeometry(value);
            disposeMaterial(value);
          });
        }
        // mesh 
        if (aObj3D instanceof THREE.Mesh) {
        disposeGeometry(aObj3D.geometry);
        if (aObj3D.material instanceof Array) {
          aObj3D.material.forEach((e) => {
            disposeMaterial(e);
          });
        } else {
          disposeMaterial(aObj3D.material);
        }
      }
      // 
        aObj3D.children.forEach((e) => {
          disposeObject3D(e);
        });
        // remove children
        aObj3D.clear();
        // extends object3D 的 dispose
        if (aObj3D.dispose && !(aObj3D instanceof THREE.Scene)) {
            aObj3D.dispose();
        }
        // remove from parent 不能加
        // aObj3D.removeFromParent();
        // 不能加
        // aObj3D = null;
    };
    const disposeArray = (aList) => {
      if (Array.isArray(aList)) {
        aList.forEach((e) => {
          this.dispose(e);
        });
      }
    };
    const disposeObject = (obj) => {
      if (obj instanceof Object) {
        const properyNames = Object.getOwnPropertyNames(obj);
        properyNames.forEach((e) => {
          if (e !== 'parent') {
            const value = obj[e];
            disposeTexture(value);
            disposeGeometry(value);
            disposeMaterial(value);
            disposeObject3D(value);
            disposeArray(value);
            if (value && typeof value.dispose === 'function') {
              value.dispose();
            }
          }
        });
      }
    };
    disposeTexture(aObj);
    disposeGeometry(aObj);
    disposeMaterial(aObj);
    disposeObject3D(aObj);
    disposeObject(aObj);
    disposeArray(aObj);
    if (aObj && typeof aObj.dispose === 'function') {
      aObj.dispose();
    }
  };
}
