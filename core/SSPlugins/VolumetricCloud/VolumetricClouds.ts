/*
 * Author  Kayson.Wan
 * Date  2024-09-11 16:13:49
 * LastEditors  Kayson.Wan
 * LastEditTime  2025-03-21 16:30:02
 * Description https://codesandbox.io/p/devbox/r3f-volumetric-clouds-forked-nkm57s?file=%2Fsrc%2Fcomponents%2FExperience.jsx%3A49%2C30
 */

import * as THREE from 'three';
import VolumetricCloudMaterial from './VolumetricCloudMaterial'; // 引入上面定义的 VolumetricCloudMaterial 类
import GUI from 'lil-gui';
import { SSThreeLoop } from '../../index';

export default class VolumetricClouds {
  // ** how to use ? **
  // this.clouds = new VolumetricClouds(this.ssThreeObject.threeScene, {
  //   threshold: 0.55,
  //   opacity: 0.2,
  //   range: 0.2,
  //   steps: 8,
  //   position: new THREE.Vector3(0, 30, 0),
  //   color: '#d6d8e1',
  //   scale: new THREE.Vector3(1200, 260, 1200),
  //   depthTest: false,
  //   side: THREE.BackSide,
  // });

  /**
   * 旋转速度
   */
  rotateSpeed: number = 0.1;

  group: THREE.Object3D;
  material: VolumetricCloudMaterial;
  mesh: THREE.Mesh<THREE.SphereGeometry, any>;
  /**
   *
   * @param {*} scene
   * @param {*} props
   */
  constructor(
    scene: THREE.Scene,
    props:
      | {
          threshold?: number | undefined; //
          opacity?: number | undefined;
          range?: number | undefined;
          side?: THREE.Side | undefined;
          depthTest?: boolean | undefined;
          color?: string | undefined;
          /**
           * 步长噪波：8 值越大采样越详细，性能越卡顿 8｜32｜64｜128
           */
          steps?: number | undefined;
          /**
           * 分辨率 64｜128
           */
          textureSize?: number | undefined;
          scale?: THREE.Vector3 | undefined;
          position?: THREE.Vector3 | undefined;
        }
      | undefined
  ) {
    this.group = new THREE.Group();
    scene.add(this.group);

    const geometry = new THREE.SphereGeometry(1.5, 16, 16);
    this.material = new VolumetricCloudMaterial(props);

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.scale.set(props.scale.x, props.scale.y, props.scale.z);
    this.mesh.position.set(props.position.x, props.position.y, props.position.z);

    this.group.add(this.mesh);
    // 动画
    SSThreeLoop.add(() => {
      this.update();
    });
    // if (window?.ENV?.DEBUG) {
    //   this.addDebug(props);
    // }
  }

  /**
   * 动画更新材质
   */
  update() {
    this.group.rotation.y += this.rotateSpeed * 0.04;
    this.mesh.material.update(this.rotateSpeed); // 更新材质
  }

  /**
   * 调试工具
   * @param props
   */
  addDebug = (
    props:
      | {
          threshold?: number | undefined;
          opacity?: number | undefined;
          range?: number | undefined;
          side?: 1 | undefined;
          depthTest?: boolean | undefined;
          color?: string | undefined;
          steps?: number | undefined;
          textureSize?: number | undefined;
        }
      | undefined
  ) => {
    const _update = () => {
      this.material.uniforms.threshold.value = props.threshold;
      this.material.uniforms.opacity.value = props.opacity;
      this.material.uniforms.range.value = props.range;
      this.material.uniforms.steps.value = props.steps;
      // this.material.uniforms.textureSize.value = props.textureSize;
      this.material.uniforms.base.value = new THREE.Color(props.color);
      // this.material.uniforms.depthTest.value = props.depthTest;
    };

    const gui = new GUI();

    const cloudFolder = gui.addFolder('VolumetricClouds');
    cloudFolder.add(props, 'threshold', 0.01, 1.0).onChange(_update);
    cloudFolder.add(props, 'opacity', 0.01, 1.0).onChange(_update);
    cloudFolder.add(props, 'range', 0.01, 1.0).onChange(_update);
    cloudFolder.add(props, 'steps', 16, 256, 1).onChange(_update);
    cloudFolder.addColor(props, 'color').onChange(_update);
    // cloudFolder.add(props, 'depthTest').onChange(_update);
    cloudFolder.open();
  };

  /**
   * 销毁
   */
  destroy = () => {
    if (this.material) {
      this.material.dispose(); // Dispose of the material
    }

    if (this.mesh) {
      // Dispose of the geometry
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose(); // Dispose of the geometry
      }

      // Remove from parent if necessary
      if (this.mesh.parent) {
        this.mesh.parent.remove(this.mesh); // Remove from the parent scene or group
      }
    }
  };
}

// // 用法示例
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// camera.position.z = 5;

// const clouds = new VolumetricClouds(scene, {
//   scale: new THREE.Vector3(1, 1, 1),
//   position: new THREE.Vector3(0, 0, 0),
// });

// function animate() {
//   requestAnimationFrame(animate);

//   const delta = 0.016; // 假设每帧16ms的时间差（约60帧每秒）
//   clouds.update(delta);

//   renderer.render(scene, camera);
// }

// animate();
