/*
 * Author  Kayson.Wan
 * Date  2022-09-08 23:20:28
 * LastEditors  xie244135119
 * LastEditTime  2023-06-08 13:55:25
 * Description
 */
import * as THREE from 'three';

export default class ThreeDisposeQueue {
  constructor() {
    this.operationQueue = new Set();
  }

  destory() {
    this.operationQueue.forEach((e) => {
      this.dispose(e);
    });
    THREE.Cache.clear();
  }

  /**
   * 将
   * @param {*} aObj
   */
  add = (aObj) => {
    this.operationQueue.add(aObj);
  };

  /**
   * 具体元素 uniforms
   */
  disposeUniforms = (uniforms = {}) => {
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
   * @param {*} aObj
   */
  dispose = (aObj) => {
    const disposeGeometry = (geo) => {
      if (geo instanceof THREE.BufferGeometry) {
        geo.dispose();
      }
    };
    const disposeMaterial = (material) => {
      if (material instanceof THREE.ShaderMaterial) {
        const { uniforms = {} } = material;
        this.disposeUniforms(uniforms);
      }
      if (material instanceof THREE.Material) {
        const materialKeys = Object.keys(material);
        materialKeys.forEach((e) => {
          if (material[e] instanceof THREE.Texture) {
            material[e].dispose();
            material[e] = null;
          }
        });
        material.dispose();
      }
    };
    const disposeObject3D = (aObj3D) => {
      if (aObj3D instanceof THREE.Object3D) {
        if (aObj3D.userData) {
          const allKeys = Object.getOwnPropertyNames(aObj3D.userData);
          allKeys.forEach((key) => {
            const value = aObj3D.userData[key];
            disposeGeometry(value);
            disposeMaterial(value);
          });
        }
        disposeGeometry(aObj3D.geometry);
        if (aObj3D.material instanceof Array) {
          aObj3D.material.forEach((e) => {
            disposeMaterial(e);
          });
        } else {
          disposeMaterial(aObj3D.material);
        }
        aObj3D.children.forEach((e) => {
          disposeObject3D(e);
        });
        // remove children
        aObj3D.clear();
        // extends object3D 的 dispose
        if (aObj3D.dispose) {
          if (!(aObj3D instanceof THREE.Scene)) {
            aObj3D.dispose();
          }
        }
        // remove from parent 不能加
        // aObj3D.removeFromParent();
        // 不能加
        // aObj3D = null;
      }
    };
    disposeGeometry(aObj);
    disposeMaterial(aObj);
    disposeObject3D(aObj);
  };
}
