import GUI from 'lil-gui';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial, LineMaterialParameters } from 'three/examples/jsm/lines/LineMaterial';
import SSThreeObject from '../SSThreeObject';
import SSThreeLoop from '../SSThreeLoop';
import SSDispose from '../SSDispose';
import SSFileInterface from './file.interface';
import SSThreeTool from '../SSTool';
import SSEvent from '../SSEvent';

export default class SSDevelopMode extends SSFileInterface {
  /**
   * @type THREE.Group
   */
  _pathGroup = null;

  /**
   * GUI目标数据
   */
  _guiData = {};

  /**
   * @type SSEvent
   */
  _threeEvent = null;

  /**
   * @type THREE.Vector3[]
   */
  _lineVectors = [];

  /**
   * 开启选择路径模式
   */
  openChoosePathMode() {
    this.ssthreeObject.changeCameraMode(SSThreeObject.CameraType.Orthographic);
    // this.ssthreeObject.threeOrbitControl.enableRotate = false;
    //
    this._addEvent();

    // 获取几何体的大小
    const defaultMeshName = this.getDebugSelectTypes().targetMesh?.[0];
    const { targetMeshName = defaultMeshName } = this._guiData;
    const targetMesh = this.ssthreeObject.threeScene.getObjectByName(targetMeshName);
    const { min, max } = SSThreeTool.setBoundingBox(targetMesh);
    const width = (max.x - min.x) * 2;
    const height = (max.z - min.z) * 2;

    const group = new THREE.Group();
    group.position.set(0, 0, 0);
    group.name = 'debug_path_group';
    this.ssthreeObject?.threeScene.add(group);
    this._pathGroup = group;

    const material = new THREE.MeshBasicMaterial({
      color: 'blue',
      depthTest: true
    });
    const planeGeometry = new THREE.PlaneGeometry(width, height, 1);
    const mesh = new THREE.Mesh(planeGeometry, material);
    mesh.rotateX(THREE.MathUtils.degToRad(-90));
    group.add(mesh);
  }

  /**
   * 关闭选择路径模式
   */
  closeChoosePathMode() {
    this._removeEvent();
    this.ssthreeObject.changeCameraMode(SSThreeObject.CameraType.Perspective);

    const group = this.ssthreeObject.threeScene.getObjectByName('debug_path_group');
    if (group) {
      SSDispose.dispose(group);
      group.removeFromParent();
    }
  }

  /**
   * 注册事件
   */
  _addEvent() {
    const threeEvent = new SSEvent(this.ssthreeObject.threeContainer);
    this._threeEvent = threeEvent;
    threeEvent.addEventListener(SSEvent.EventType.CLICK, (e) => {
      const models = this.ssthreeObject.getModelsByPoint(
        {
          x: e.offsetX,
          y: e.offsetY
        },
        [this._pathGroup]
      );
      console.log('点击事件 ', e, models);
      if (models.length > 0) {
        const { point } = models[0];
        const boxgeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({
          color: 'red',
          depthTest: true
        });
        const box = new THREE.Mesh(boxgeo, material);
        box.position.copy(point);
        this.ssthreeObject.threeScene.add(box);

        this._lineVectors.push(point);
        this.addTempLines();
      }
    });
    // threeEvent.addEventListener(SSEvent.EventType.MOUSE_MOVE, (e) => {
    //   const models = this.ssthreeObject.getModelsByPoint(
    //     {
    //       x: e.x,
    //       y: e.y
    //     },
    //     this._pathGroup
    //   );
    //   console.log('滑动事件 ', e, models);
    // });
  }

  /**
   * 移除事件
   */
  _removeEvent() {
    this._threeEvent.destory();
    this._threeEvent = null;
  }

  /**
   *
   * @param {*} obj
   */
  addTempLines = () => {
    const originLine = this._pathGroup.getObjectByName('temp_line');
    if (originLine) {
      SSDispose.dispose(originLine);
      originLine.removeFromParent();
    }

    const points = [];
    this._lineVectors.forEach((item) => {
      points.push(item.x, item.y, item.z);
    });
    console.log('points ', points);
    // const lineGeometry = new LineGeometry();
    // lineGeometry.setPositions(points);
    // const lineMaterial = new LineMaterial({
    //   linewidth: 0.01,
    //   color: 0xffffff,
    //   depthTest: false
    // });
    // const line = new Line2(lineGeometry, lineMaterial);
    // line.name = 'temp_line';
    // this._pathGroup.add(line);
  };

  mount(obj) {
    //
  }

  unmount() {
    this._removeEvent();
  }

  getDebugConfig() {
    return {
      visible: false,
      points: '选择的点位',
      targetMeshName: this.getDebugSelectTypes().targetMeshName?.[0]
    };
  }

  /**
   * @returns {Object} 调试工具类型
   */
  getDebugSelectTypes() {
    const meshNames = this.ssthreeObject.threeScene.children.reduce((prev, cur) => {
      if (cur instanceof THREE.Mesh || cur instanceof THREE.Group) {
        return [...prev, cur.name || cur.type];
      }
      return prev;
    }, []);
    return {
      targetMeshName: meshNames
    };
  }

  import(e = {}) {
    console.log(' 导入的文件配置 import ', e);
  }

  export() {
    return {
      interinty: 10
    };
  }

  onDebugChange(params) {
    console.log(' develop change ', params);
    const { key, value, target } = params;
    this._guiData = target;
    if (key === 'visible') {
      if (value) {
        this.openChoosePathMode();
      } else {
        this.closeChoosePathMode();
      }
    }
  }
}
