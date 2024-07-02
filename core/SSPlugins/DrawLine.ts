import * as THREE from 'three';
import SSDispose from '../SSDispose';
import SSEvent from '../SSEvent';
import SSThreeTool from '../SSTool/index';

export default class SSDrawLineTool {
  /**
   * @type {import('../SSThreeObject').default} 物体
   */
  ssThreeObject = null;

  /**
   * 类标题
   */
  title = '工具-路径取点';

  /**
   * @type THREE.Group
   */
  _pathGroup = null;

  /**
   * @type THREE.Group
   */
  _pointGroup = null;

  /**
   * @type {SSEvent}
   */
  _threeEvent = null;

  /**
   * @type THREE.Vector3[]
   */
  _lineVectors = null;

  /**
   * 当前点位
   */
  // _currentVector = { x: 0, y: 0, z: 0 };

  _mousePointModel = null;

  _ground = null;

  /**
   * 取点结束回调
   * @type {function (THREE.Vector3[]):void} e [ Vector3(),... ]
   */
  onComplete = null;

  /**
   * 绘制结束
   */
  _dynamicConfig = {
    pointWidth: 0.05,
    lineWidth: 0.001,
    remark: '完成(ENTER)后退(ESC)',
    points: '选择的点位',
    color: new THREE.Color(0xffffff)
  };

  constructor(ssThreeObject) {
    this.ssThreeObject = ssThreeObject;
  }

  /**
   * 开启选择路径模式
   */
  openChoosePathMode() {
    this._addDebugGround();
    this._lineVectors = [];
    console.log(' ssThreeObject xxxxx ', this.ssThreeObject);
    this._addEvent();
    const linegroup = new THREE.Group();
    linegroup.position.set(0, 0, 0);
    linegroup.name = 'debug_linepath';
    this.ssThreeObject?.threeSceneHelper.add(linegroup);
    this._pathGroup = linegroup;
    const pointgroup = new THREE.Group();
    pointgroup.position.set(0, 0, 0);
    pointgroup.name = 'debug_linepoint';
    this.ssThreeObject?.threeSceneHelper.add(pointgroup);
    this._pointGroup = pointgroup;
    console.log(' this._pointGroup', this._pointGroup);
  }

  _addDebugGround = () => {
    const geometries = new THREE.PlaneGeometry();
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: '#000', // '#216E73',
      opacity: 0.1
    });
    const planeMesh = new THREE.Mesh(geometries, material);
    planeMesh.scale.set(1000, 1000, 1000);
    planeMesh.rotateX((Math.PI / 180) * -90);
    this._ground = planeMesh;
    this.ssThreeObject?.threeSceneHelper.add(planeMesh);
    console.log('_ground', this._ground);
  };

  /**
   * 关闭选择路径模式
   */
  closeChoosePathMode() {
    this._removeEvent();
    // this.ssThreeObject.changeCameraMode(SSThreeObject.CameraType.Perspective);

    if (this._pathGroup) {
      SSDispose.dispose(this._pathGroup);
      this._pathGroup.removeFromParent();
    }
    if (this._pointGroup) {
      SSDispose.dispose(this._pointGroup);
      this._pointGroup.removeFromParent();
    }

    if (this._mousePointModel) {
      SSDispose.dispose(this._mousePointModel);
      this._mousePointModel.removeFromParent();
      this._mousePointModel = null;
    }

    if (this._ground) {
      SSDispose.dispose(this._ground);
      this._ground.removeFromParent();
      this._ground = null;
    }
    this.ssThreeObject.update();
  }

  pointGroup = [];

  pointMeshGroup = [];

  /**
   * 取点
   * @param {*} e
   */
  addPointDebug = (e) => {
    const models = this.ssThreeObject.getModelsByPoint(e);
    const pos = models[0].point;

    const geo = new THREE.SphereGeometry(0.2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'debug_sphere';
    mesh.scale.set(0.2, 0.2, 0.2);
    mesh.scale.set(0.2, 0.2, 0.2);
    mesh.position.copy(pos);
    this.ssThreeObject.threeScene.add(mesh);
    this.pointMeshGroup.push(mesh);
    this.pointGroup.push(pos);
    console.log('点位列表', JSON.stringify(this.pointGroup));
  };

  /**
   * 注册事件
   */
  _addEvent() {
    const sphereGeometry = new THREE.SphereGeometry(this._dynamicConfig.pointWidth);
    const material = new THREE.MeshBasicMaterial({
      color: 'white',
      depthTest: true
    });
    this._mousePointModel = new THREE.Mesh(sphereGeometry, material);
    this.ssThreeObject.threeSceneHelper?.add(this._mousePointModel);

    const threeEvent = new SSEvent(this.ssThreeObject.threeContainer);
    this._threeEvent = threeEvent;

    // // ---------取点调试----------
    // threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (e) => {
    //   this.addPointDebug(e);
    //   this.ssThreeObject.update();
    // });

    // // 后退
    // window.addEventListener('keydown', (e) => {
    //   switch (e.key) {
    //     case 'Escape':
    //       // 移除绘制的一条
    //       this.pointMeshGroup[this.pointMeshGroup.length - 1]?.removeFromParent();
    //       this.pointMeshGroup.pop();
    //       this.pointGroup.pop();
    //       this.ssThreeObject.update();
    //       console.log('pointGroup', JSON.stringify(this.pointGroup));
    //       break;

    //     default:
    //       break;
    //   }
    // });
    // // ------------------------------

    threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (e) => {
      const models = this.ssThreeObject.getModelsByPoint(
        e,
        this.ssThreeObject.threeSceneHelper.children || this.ssThreeObject.threeScene
      );
      if (models.length === 0) return;
      // 目标点位
      const currentVector = this.getOverlapsPointByPoint(models[0].point);
      // console.log(' 选中的目标点位 ', currentVector);
      this._lineVectors.push(currentVector);
      // this._currentVector = point;
      // 目标几何体
      const boxgeo = new THREE.SphereGeometry(this._dynamicConfig.pointWidth);
      const material = new THREE.MeshBasicMaterial({
        color: this._dynamicConfig.color,
        depthTest: true
      });
      const box = new THREE.Mesh(boxgeo, material);
      box.position.copy(currentVector);
      this._pointGroup.add(box);
      //
      if (this._lineVectors.length < 2) return;
      // 移除时刻渲染的一条
      this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
      //
      this._pathGroup.add(
        SSThreeTool.addLineByPoints(
          [
            this._lineVectors[this._lineVectors.length - 2],
            this._lineVectors[this._lineVectors.length - 1]
          ],
          {
            linewidth: this._dynamicConfig.lineWidth,
            color: this._dynamicConfig.color.getHex()
          },
          false
        ).group
      );

      this.ssThreeObject.update();
    });

    threeEvent.addEventListener(SSEvent.SSEventType.MOUSEMOVE, (e) => {
      if (this._lineVectors.length === 0) {
        return;
      }
      const models = this.ssThreeObject.getModelsByPoint(
        e,
        this.ssThreeObject.threeSceneHelper.children
      );

      // console.log(' 点位 ', e, models, this.ssThreeObject.threeSceneHelper.children);
      if (models.length === 0) return;
      // this._currentVector = models[0].point;
      // const currentVector = models[0].point;
      // 当前的点位 与 已有的点位中 是否重合
      const currentVector = this.getOverlapsPointByPoint(models[0].point);

      // 与现有的点位队列判断是否重叠
      // this._mousePointModel.position.copy(currentVector);
      // 移除时刻渲染的一条
      this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
      // 新增一条
      const { group } = SSThreeTool.addLineByPoints(
        [this._lineVectors[this._lineVectors.length - 1], currentVector],
        {
          linewidth: this._dynamicConfig.lineWidth,
          color: this._dynamicConfig.color.getHex()
        },
        false
      );
      group.name = 'debug_line_moveline';
      this._pathGroup.add(group);
      this.ssThreeObject.update();
    });

    // 后退
    threeEvent.addEventListener(SSEvent.SSEventType.REVOKE, (e) => {
      // 回退
      if (this._lineVectors.length === 0) {
        return;
      }
      this._lineVectors.pop();
      // 移除绘制的一条
      this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
      this._pathGroup.children.pop();
      this._pointGroup.children.pop();
      this.ssThreeObject.update();
    });

    // 确认
    threeEvent.addEventListener(SSEvent.SSEventType.CONFIRM, (e) => {
      if (this._lineVectors.length === 0) {
        return;
      }
      this.onComplete?.(this._lineVectors);
      this._dynamicConfig.points = JSON.stringify(this._lineVectors);
      // this.moduleUpdateGuiValue('points', JSON.stringify(this._lineVectors));
      this._lineVectors = [];
      const pathmeshs = [...this._pathGroup.children];
      pathmeshs.forEach((e) => {
        e.removeFromParent();
      });
      const pointmeshs = [...this._pointGroup.children];
      pointmeshs.forEach((e) => {
        e.removeFromParent();
      });
      this._mousePointModel.removeFromParent();
    });
  }

  /**
   * 移除事件
   */
  _removeEvent() {
    this._threeEvent?.destory();
    this._threeEvent = null;
  }

  /**
   * 获取是否存在与原路径重合的点
   * @param {THREE.Vector3} aTargetVector 目标点位
   */
  getOverlapsPointByPoint = (aTargetVector) => {
    if (this._lineVectors.length === 0) {
      return aTargetVector;
    }

    // 最短校验距离
    const MinOverlapsDistance = 0.2;
    let minPoint = null;
    let minDistance = null;
    for (let index = 0; index < this._lineVectors.length; index++) {
      const element = this._lineVectors[index];
      const distance = element.distanceTo(aTargetVector);
      if (distance <= MinOverlapsDistance) {
        if (minDistance === null) {
          minPoint = element;
          minDistance = distance;
        } else if (minDistance > distance) {
          minPoint = element;
          minDistance = distance;
        }
      }
    }
    // console.log(' 当前滑块距离处理 ', minPoint, minDistance, this._lineVectors);
    return minPoint || aTargetVector;
  };
}
