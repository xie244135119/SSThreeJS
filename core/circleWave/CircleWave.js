/*
 * Author  Kayson.Wan
 * Date  2023-04-06 16:15:16
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-04-06 16:52:49
 * Description
 */

import * as THREE from 'three';
import ThreeLoop from '../threeLoop';
import img from './扩散圆环.png';
import ThreeJs from '..';

export default class CircleWave {
  /**
   * @type ThreeJs
   */
  threeJs = null;

  // 大小
  size = 10;

  // 速度
  speed = 1;

  waveMeshArr = [];

  constructor(threejs) {
    this.threeJs = threejs;
  }

  /**
   * 创建扩散圆圈
   * @param {*} position position | [position]
   * @param {*} faceNormal 是否法线方向贴图
   */
  addWaveMesh = (position, color = 'white', faceNormal = false) => {
    const addMesh = (position) => {
      // const position = new THREE.Vector3(0, 30, 0);
      const texture = new THREE.TextureLoader().load(img);
      const planGeometry = new THREE.PlaneGeometry(this.size, this.size);

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        color,
        transparent: true, // 使用背景透明的png贴图，注意开启透明计算
        // side: THREE.DoubleSide, //双面可见
        depthWrite: false, // 禁止写入深度缓冲区数据
        depthTest: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(planGeometry, material);
      const size = 1; // 矩形平面Mesh的尺寸
      mesh.size = size;
      mesh.scale.set(size, size, size); // 设置mesh大小
      // 设置mesh位置
      mesh.position.set(position.x, position.y, position.z);
      if (faceNormal) {
        // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
        const coordVec3 = new THREE.Vector3(position.x, position.y, position.z).normalize();
        // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
        const meshNormal = new THREE.Vector3(0, 0, 1);
        // 四元数属性.quaternion表示mesh的角度状态
        // .setFromUnitVectors();计算两个向量之间构成的四元数值
        mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
      } else {
        mesh.rotation.set((Math.PI / 180) * -90, 0, 0);
      }

      this.waveMeshArr.push(mesh);
      return mesh;
    };

    if (Array.isArray(position)) {
      position.forEach((pos) => {
        const mesh = addMesh(pos);
        this.threeJs.threeScene.add(mesh);
      });
    } else {
      const mesh = addMesh(position);
      this.threeJs.threeScene.add(mesh);
    }

    ThreeLoop.add(() => {
      if (this.waveMeshArr.length) {
        this.waveMeshArr.forEach((mesh) => {
          mesh._s += 0.01 * this.speed;
          mesh.scale.set(mesh.size * mesh._s, mesh.size * mesh._s, mesh.size * mesh._s);
          // console.log('mesh.scale', mesh.scale);
          if (mesh._s <= 1.5) {
            // mesh._s=1，透明度=0 mesh._s=1.5，透明度=1
            mesh.material.opacity = (mesh._s - 1) * 2;
            // console.log('mesh.material.opacity', mesh.material.opacity);
          } else if (mesh._s > 1.5 && mesh._s <= 2) {
            // mesh._s=1.5，透明度=1 mesh._s=2，透明度=0
            mesh.material.opacity = 1 - (mesh._s - 1.5) * 2;
            // console.log('mesh.material.opacity', mesh.material.opacity);
          } else {
            mesh._s = 1.0;
          }
        });
      }
    }, 'circle wave');
  };

  destroy = () => {
    ThreeLoop.removeId('circle wave');
    if (this.waveMeshArr.length > 0) {
      this.waveMeshArr.forEach((waveMesh) => {
        this.threeJs.threeScene.remove(waveMesh);
        this.threeJs.destroyObj(waveMesh);
      });
      this.waveMeshArr = [];
    }
  };
}
