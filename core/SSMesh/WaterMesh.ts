import * as THREE from 'three';
import { Water, Water2Options } from 'three/examples/jsm/objects/Water2';
import waterNormal1Img from '../assets/textures/water/Water_1_M_Normal.jpg';
import waterNormal2Img from '../assets/textures/water/Water_2_M_Normal.jpg';

export default class SSWaterMesh {
  /**
   * 元素创建
   * @param width
   * @param height
   * @param waterOptions
   * @returns
   */
  static fromOptions = (width: number, height: number, waterOptions?: Water2Options) => {
    const waterGeometry = new THREE.PlaneGeometry(width, height);
    const plane = new THREE.PlaneGeometry(width, height);
    const planematerial = new THREE.MeshBasicMaterial({
      color: '#fff'
    });
    const planeMesh = new THREE.Mesh(plane, planematerial);
    planeMesh.rotateX(THREE.MathUtils.degToRad(-90));

    const water = new Water(waterGeometry, {
      color: '#0689a0',
      scale: 10,
      flowDirection: new THREE.Vector2(0, 0),
      textureWidth: 256,
      textureHeight: 256,
      normalMap0: new THREE.TextureLoader().load(waterNormal1Img, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      normalMap1: new THREE.TextureLoader().load(waterNormal2Img, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      ...(waterOptions || {})
    });
    water.position.z = 0.1;
    planeMesh.add(water);
    // water.rotation.x = Math.PI * -0.5;
    return planeMesh;
  };
}
