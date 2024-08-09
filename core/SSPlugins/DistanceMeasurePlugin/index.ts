/**
 * 标准化 测距组件
 */
import * as THREE from 'three';
import SSThreeTool from '../../SSTool/index';
import SSThreeObject from '../../SSThreeObject';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import FontJson from './assets/helvetiker_regular.typeface.json';

export default class SSDistanceMeasurePlugin {
  /**
   * 目标物体
   */
  ssThreeObject: SSThreeObject = null;

  //
  font: Font = null;

  //
  groupList = [];

  constructor(ssThreeObject: SSThreeObject) {
    this.ssThreeObject = ssThreeObject;
  }

  /**
   * @description 根据object的中心向mesh的左右前后方向 各发射一条射线检测碰撞的物体
   * @param {*} object
   */
  measure(object: THREE.Object3D) {
    this.removeMeasure();
    object = SSThreeTool.getOriginObject(object);
    // console.log('object', object);
    let center = SSThreeTool.getBoundingBox(object).getCenter(new THREE.Vector3());
    const { LocalXDirection, LocalYDirection, LocalZDirection } =
      SSThreeTool.getLocalDirection2(object);

    // 获取物体的世界变换矩阵
    const worldMatrix = new THREE.Matrix4();
    worldMatrix.copy(object.matrixWorld);

    const box = SSThreeTool.setBoundingBox(object);
    // box.applyMatrix4(worldMatrix);

    const x = (box.max.x - box.min.x) / 2 + 0.01;
    // const y = (box.max.y - box.min.y) / 2;
    const z = (box.max.z - box.min.z) / 2 + 0.01;

    const centerX = center.clone();
    centerX.x += x;

    const centerZ = center.clone();
    centerZ.z += z;

    const centerX_ = center.clone();
    centerX_.x -= x;

    const centerZ_ = center.clone();
    centerZ_.z -= z;

    // x,z
    this._addMeasure(object, centerX, LocalXDirection, 'x');
    this._addMeasure(object, centerZ, LocalZDirection, 'z');

    // -x,-z
    this._addMeasure(object, centerX_, LocalXDirection.multiply(new THREE.Vector3(-1, 1, 1)), '-x');
    this._addMeasure(object, centerZ_, LocalZDirection.multiply(new THREE.Vector3(1, 1, -1)), '-z');

    this.ssThreeObject.renderOnce();
  }

  /**
   * 移除测量
   */
  removeMeasure = () => {
    if (this.groupList.length !== 0) {
      this.groupList.forEach((group) => {
        group.traverse((e) => {
          (this.ssThreeObject.sceneHelper || this.ssThreeObject.threeScene).remove(e);
        });
      });
      this.groupList = [];
      this.ssThreeObject.renderOnce();
    }
  };

  _addMeasure = (
    object: THREE.Object3D,
    center: THREE.Vector3,
    direction: THREE.Vector3,
    dirStr: 'x' | '-x' | 'z' | '-z' | 'y' | '-y'
  ) => {
    const group = new THREE.Group();
    // this.ssThreeObject.threeScene.add(group);
    (this.ssThreeObject.sceneHelper || this.ssThreeObject.threeScene).add(group);
    const raycaster = new THREE.Raycaster(center, direction);
    raycaster.camera = this.ssThreeObject.threeCamera;
    const intersects = raycaster.intersectObjects(this.ssThreeObject.threeScene.children, true);
    if (intersects.length === 0) return;
    // console.log('intersects', intersects[0]);
    const endPoint = intersects[0].point;

    // 画线
    const { line } = SSThreeTool.addLineByPoints([center, endPoint], { linewidth: 0.002 });
    group.add(line);
    this.groupList.push(group);

    // 中间点
    const labelCenter = new THREE.Vector3(
      (center.x + endPoint.x) / 2,
      (center.y + endPoint.y) / 2,
      (center.z + endPoint.z) / 2
    );

    const distance = endPoint.distanceTo(center);
    // 文字
    if (!this.font) {
      this.font = new FontLoader().parse(FontJson);
    }
    const text = this._createTextLabel(this.font, distance.toFixed(2) + 'm', 0.3);
    text.position.copy(labelCenter);
    group.add(text);

    // 吸附
    if (distance <= 0.2) {
      this.align(object, endPoint, dirStr);
    }
  };

  /**
   * 创建文字
   */
  _createTextLabel(font: Font, label: string, size?: number) {
    const textGeometry = new TextGeometry(label, {
      font: font,
      size: size || 80,
      height: (size || 0) / 8,
      curveSegments: 1,
      bevelEnabled: false,
      bevelThickness: 0,
      bevelSize: 0,
      bevelSegments: 1
    });

    // 将文字几何体居中
    textGeometry.computeBoundingBox();
    var textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textGeometry.translate(-textWidth / 2, 0, 0);

    const textMat = new THREE.MeshBasicMaterial({ color: 'white', depthTest: false });
    const obj = new THREE.Mesh(textGeometry, textMat);
    return obj;
  }

  /**
   * 对齐吸附
   * @param {*} object
   * @param {*} endPoint
   * @param {*} dirStr
   */
  align = (
    object: THREE.Object3D,
    endPoint: THREE.Vector3,
    dirStr: 'x' | '-x' | 'z' | '-z' | 'y' | '-y'
  ) => {
    const box = SSThreeTool.setBoundingBox(object);
    const x = (box.max.x - box.min.x) / 2;
    // const y = (box.max.y - box.min.y) / 2 ;
    const z = (box.max.z - box.min.z) / 2;
    let dirRadius = new THREE.Vector3().copy(endPoint);
    // console.log('dirStr', dirStr);
    if (dirStr === 'x') {
      dirRadius.x -= x;
    } else if (dirStr === '-x') {
      dirRadius.x += x;
    }
    // else if (dirStr === 'y') {
    //   dirRadius.y -= y;
    // } else if (dirStr === '-y') {
    //   dirRadius.y += y;
    // }
    else if (dirStr === 'z') {
      dirRadius.z -= z;
    } else if (dirStr === '-z') {
      dirRadius.z += z;
    }
    object.position.copy(dirRadius);
  };

  // /**
  //  * 获取射线穿过的所有物体
  //  * @param {this} _this
  //  * @param {摄像机model模型位置} campos
  //  * @param {点击位置} clickpos
  //  * @returns 返回看中的第一个物体
  //  */
  // _rayCastObjs = (campos: THREE.Vector3, clickpos: ) => {
  //   const dir = new THREE.Vector3(
  //     clickpos.x - campos.x,
  //     clickpos.y - campos.y,
  //     clickpos.z - campos.z
  //   );
  //   const rayCaster = new THREE.Raycaster(campos, dir.normalize(), 0, 1000);
  //   rayCaster.camera = this.ssThreeObject.threeCamera;
  //   const objs = rayCaster.intersectObjects(this.ssThreeObject.threeScene.children, true);
  //   return objs;
  // };
}
