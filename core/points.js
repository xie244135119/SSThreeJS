import * as THREE from 'three';
import ThreeLoop from './threeLoop';
import ThreeTool from './tool';

export default class Points {
  // three.js
  #threeJs = null;

  // particle
  #threePointGeomtery = null;

  // mesh
  #pointsMesh = null;

  // loop idenfiters
  #loopIdenfiters = [];

  /**
   * bind threejs
   * @param {*} aThreeJs
   */
  bindThreeJs = (aThreeJs) => {
    this.#threeJs = aThreeJs;
  };

  destroy() {
    ThreeLoop.removeIds(this.#loopIdenfiters);
    const { threeScene } = this.#threeJs;
    const object = threeScene?.getObjectByName('custom_points');
    if (object instanceof THREE.Object3D) {
      this.#threeJs.destroyObj(object);
      object.removeFromParent();
    }
  }

  /**
   * points geometry positons
   * @returns
   */
  getPointsPositions = (aObj, aTotal, speed = new THREE.Vector3(), height = 100) => {
    const group = ThreeTool.getObjectCenter(aObj);
    const groupCenter = ThreeTool.getObjectCenter(group);
    const { min, max } = ThreeTool.setBoundingBox(aObj);
    const xWidth = max.x - min.x;
    const zWidth = max.z - min.z;

    // 起点
    const startX = groupCenter.x - xWidth / 2;
    const startY = min.y;
    const startZ = groupCenter.z - zWidth / 2;

    // 分成10段
    const piecewise = 10;
    const eachCount = aTotal / piecewise;
    //
    const positions = [];
    const speeds = [];
    for (let index = 0; index < piecewise; index++) {
      for (let j = 0; j < eachCount; j++) {
        const positionx = THREE.MathUtils.randFloat(startX, startX + (index * xWidth) / piecewise);
        const positiony = THREE.MathUtils.randFloat((height + startY) / 2, height + startY);
        const positionz = THREE.MathUtils.randFloat(startZ, startZ + zWidth);
        positions.push(positionx, positiony, positionz);
        const speedclone = speed.clone();
        speeds.push(speedclone.x, speedclone.y, speedclone.z);
      }
    }
    return {
      positions,
      speeds,
      minX: startX,
      maxX: startX + xWidth,
      minY: startY,
      maxY: height + startY,
      minZ: startZ,
      maxZ: startZ + zWidth
    };
  };

  /**
   * create Snow points
   */
  createSnowPointsByObj = (aObj, aTotal = 100, aElevate = 0) => {
    if (!(aObj instanceof THREE.Object3D)) {
      return;
    }
    // positions
    const positionsData = this.getPointsPositions(
      aObj,
      aTotal,
      new THREE.Vector3(
        THREE.MathUtils.randFloat(-0.3, 0.3),
        THREE.MathUtils.randFloat(0.2, 1),
        THREE.MathUtils.randFloat(-0.5, 0.5)
      ),
      500
    );
    //
    const texure = new THREE.TextureLoader().load(
      require('./assets/material_snow_transpant.png').default
    );
    const material = new THREE.PointsMaterial({
      map: texure,
      color: '#fff',
      size: 20,
      transparent: true,
      sizeAttenuation: true
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsData.positions, 3));
    const points = new THREE.Points(geometry, material);
    points.name = 'custom_points';
    this.#threeJs.threeScene.add(points);
    this.#threePointGeomtery = geometry;
    this.#pointsMesh = points;
    points.userData.vectorData = positionsData;
    console.log(' geometry ', geometry.attributes, positionsData);

    const idenfiters = ThreeLoop.add(this.animate);
    this.#loopIdenfiters.push(idenfiters);
  };

  /**
   * create Snow points
   */
  createRainPointsByObj = (aObj, aTotal = 100, aElevate = 0) => {
    if (!(aObj instanceof THREE.Object3D)) {
      return;
    }
    // positions
    const positionsData = this.getPointsPositions(
      aObj,
      aTotal,
      new THREE.Vector3(0, THREE.MathUtils.randFloat(0.1, 5), 0),
      500
    );
    //
    const texure = new THREE.TextureLoader().load(require('./assets/material_rain.png').default);
    const material = new THREE.PointsMaterial({
      map: texure,
      color: '#fff',
      size: 20,
      transparent: true,
      sizeAttenuation: true
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsData.positions, 3));
    const points = new THREE.Points(geometry, material);
    points.name = 'custom_points';
    this.#threeJs.threeScene.add(points);
    this.#threePointGeomtery = geometry;
    this.#pointsMesh = points;
    points.userData.vectorData = positionsData;
    console.log(' geometry ', geometry.attributes, positionsData);

    const idenfiters = ThreeLoop.add(this.animate);
    this.#loopIdenfiters.push(idenfiters);
  };

  /**
   * create Snow points
   */
  createFogPointsByObj = (aObj, aTotal = 100, aElevate = 0) => {
    if (!(aObj instanceof THREE.Object3D)) {
      return;
    }
    // positions
    const positionsData = this.getPointsPositions(aObj, 200, new THREE.Vector3(-0.2, 0, 0), 150);
    //
    const texure = new THREE.TextureLoader().load(require('./assets/material_fog.png').default);
    const material = new THREE.PointsMaterial({
      map: texure,
      color: '#fff',
      size: 1000,
      transparent: true,
      sizeAttenuation: true,
      depthWrite: false
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsData.positions, 3));
    const points = new THREE.Points(geometry, material);
    points.name = 'custom_points';
    this.#threeJs.threeScene.add(points);
    this.#threePointGeomtery = geometry;
    this.#pointsMesh = points;
    points.userData.vectorData = positionsData;

    const idenfiters = ThreeLoop.add(this.animate);
    this.#loopIdenfiters.push(idenfiters);
  };

  /**
   * remove points
   * @returns
   */
  removePoints = () => {
    ThreeLoop.removeIds(this.#loopIdenfiters);
    const { threeScene } = this.#threeJs;
    const object = threeScene.getObjectByName('custom_points');
    if (object instanceof THREE.Object3D) {
      this.#threeJs.destroyObj(object);
      object.removeFromParent();
    }
  };

  /**
   * animate
   */
  animate = () => {
    if (!(this.#threePointGeomtery instanceof THREE.BufferGeometry)) {
      return;
    }
    const positions = this.#threePointGeomtery.attributes.position.array;
    const { vectorData = {} } = this.#pointsMesh.userData;
    const {
      speeds: vectorSpeeds,
      minX,
      minY,
      minZ,
      maxX,
      maxY,
      maxZ,
      positions: originPositions
    } = vectorData;
    // y 更新
    for (let index = 1; index < positions.length; index += 3) {
      const xspeed = vectorSpeeds[index - 1];
      const yspeed = vectorSpeeds[index];
      const zspeed = vectorSpeeds[index + 1];
      positions[index - 1] += xspeed * (index % 2 === 0 ? -1 : 1);
      positions[index] -= yspeed;
      positions[index + 1] += zspeed * (index % 2 === 0 ? -1 : 1);

      // y
      if (positions[index] <= minY) {
        positions[index] = maxY / 2;
      }
      // x z
      if (positions[index - 1] > maxX || positions[index - 1] < minX) {
        positions[index - 1] = originPositions[index - 1];
      }
      if (positions[index + 1] > maxZ || positions[index + 1] < minZ) {
        positions[index + 1] = originPositions[index + 1];
      }
    }
    //
    this.#threePointGeomtery.attributes.position.needsUpdate = true;
  };
}
