/* eslint-disable max-classes-per-file */
/*
 * Author  Kayson.Wan
 * Date  2022-09-26 22:15:20
 * LastEditors  xie244135119
 * LastEditTime  2022-10-19 16:11:14
 * Description
 */
import * as THREE from 'three';
import ThreeLoop from '../threeLoop';

// 定义Point类
class Point {
  constructor() {
    this.range = 1500; // 分布半径
    this.center = {
      // 分布中心
      x: 0,
      y: 0,
      z: 0
    };
    this.position = {
      // 粒子位置
      x: Math.random() * 2 * this.range + this.center.x - this.range,
      y: Math.random() * 2 * this.range + this.center.y - this.range,
      z: Math.random() * 2 * this.range + this.center.z - this.range
    };
    this.speed = {
      // 粒子移动速度
      x: (Math.random() - 0.5) * 30 - 5,
      y: (Math.random() - 0.5) * 30 - 5,
      z: (Math.random() - 0.5) * 30 - 5
    };
    this.color = '#aaa'; // 粒子颜色
    this.createTime = Date.now(); // 粒子创建时间
    this.updateTime = Date.now(); // 上次更新时间
  }

  // 更新粒子位置
  updatePosition() {
    const time = Date.now() - this.updateTime;
    this.updateTime = Date.now();
    this.position.x += (this.speed.x * time) / 1000;
    this.position.y += (this.speed.y * time) / 1000;
    this.position.z += (this.speed.z * time) / 1000;

    if (Math.abs(this.position.x) >= this.range) {
      this.position.x = 0;
    }
    if (Math.abs(this.position.y) >= this.range) {
      this.position.y = 0;
    }
    if (Math.abs(this.position.z) >= this.range) {
      this.position.z = 0;
    }
  }
}

export default class Star {
  createPartical = () => {
    // 批量创建粒子
    const vertices = [];
    for (let i = 0; i < 400; i++) {
      vertices.push(new Point());
    }

    // 先创建一个空的缓冲几何体
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3)); // 一个顶点由3个坐标构成

    // 创建材质
    const material = new THREE.PointsMaterial({
      // color: '#00FFFF',
      color: '#FFFFFF',
      size: 30,
      //   map: textureStar, // 纹理图
      map: new THREE.TextureLoader().load(
        '/public/threeTextures/texture-smoke.png'
        // 'public/threeTextures/gradient.png'
      ), // 纹理图
      transparent: true, // 开启透明度
      depthWrite: false
    });

    // 创建点，并添加进场景
    const points = new THREE.Points(geometry, material);

    // 不间断更新粒子位置
    ThreeLoop.add(() => {
      const list = [];
      vertices.forEach((point) => {
        point.updatePosition();
        const { x, y, z } = point.position;
        list.push(x, y, z);
      });

      // 粒子位置更新入几何体
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(list), 3));
    }, 'star render');

    return points;
  };
}
