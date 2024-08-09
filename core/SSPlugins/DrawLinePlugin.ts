/**
 * @description 取点插件
 */
import * as THREE from 'three';
import { SSDispose, SSThreeEvent, SSThreeTool, SSThreeObject } from '../index';

export default class SSDrawLinePlugin {
  /**
   * @description 物体
   */
  ssThreeObject: SSThreeObject = null;

  /**
   * 类标题
   */
  title = '工具-路径取点';

  /**
   * @description 路径分组
   */
  _pathGroup: THREE.Group = null;

  /**
   * @description 取点分组
   */
  _pointGroup: THREE.Group = null;

  /**
   * @description 事件通道
   */
  _threeEvent: SSThreeEvent = null;

  /**
   * @description 线变量
   */
  _lineVectors: THREE.Vector3[] = null;

  /**
   * @description 点位模型
   */
  _mousePointModel: THREE.Mesh = null;

  /**
   * @description 虚拟地板
   */
  _ground: THREE.Mesh = null;

  /**
   * @description 取点结束回调
   */
  onComplete: (e?: THREE.Vector3[]) => void = null;

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
    this._addEvent();
    const linegroup = new THREE.Group();
    linegroup.position.set(0, 0, 0);
    linegroup.name = 'debug_linepath';
    this.ssThreeObject.sceneHelper.add(linegroup);
    this._pathGroup = linegroup;
    const pointgroup = new THREE.Group();
    pointgroup.position.set(0, 0, 0);
    pointgroup.name = 'debug_linepoint';
    this.ssThreeObject.sceneHelper.add(pointgroup);
    this._pointGroup = pointgroup;
  }

  /**
   * 关闭选择路径模式
   */
  closeChoosePathMode() {
    this._removeEvent();

    if (this._pathGroup) {
      SSDispose.dispose(this._pathGroup);
      this._pathGroup.removeFromParent();
      this._pathGroup = null;
    }
    if (this._pointGroup) {
      SSDispose.dispose(this._pointGroup);
      this._pointGroup.removeFromParent();
      this._pointGroup = null;
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
    this.renderOnce();
  }

  _addDebugGround = () => {
    const geometries = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: '#000', // '#216E73',
      opacity: 0.1
    });
    const planeMesh = new THREE.Mesh(geometries, material);
    planeMesh.scale.set(1000, 1000, 1000);
    planeMesh.position.y = 0;
    planeMesh.rotateX((Math.PI / 180) * -90);
    this._ground = planeMesh;
    this.ssThreeObject?.sceneHelper.add(planeMesh);
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
    this.ssThreeObject.sceneHelper?.add(this._mousePointModel);

    const threeEvent = new SSThreeEvent(this.ssThreeObject.threeContainer);
    this._threeEvent = threeEvent;

    threeEvent.addEventListener(SSThreeEvent.SSEventType.CLICK, (e) => {
      const models = this.ssThreeObject.getModelsByPoint(
        e,
        this.ssThreeObject.sceneHelper.children,
        ['GridHelper']
      );
      if (models.length === 0) return;
      // 目标点位
      const currentVector = this.getOverlapsPointByPoint(models[0].point);
      this._lineVectors.push(currentVector);
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

      this.renderOnce();
    });

    threeEvent.addEventListener(SSThreeEvent.SSEventType.MOUSEMOVE, (e) => {
      if (this._lineVectors.length === 0) {
        return;
      }
      const models = this.ssThreeObject.getModelsByPoint(
        e,
        this.ssThreeObject.sceneHelper.children,
        ['GridHelper']
      );

      // console.log(' 点位 ', e, models, this.ssThreeObject.sceneHelper.children);
      if (models.length === 0) return;
      // 当前的点位 与 已有的点位中 是否重合
      const currentVector = this.getOverlapsPointByPoint(models[0].point);

      // 与现有的点位队列判断是否重叠
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
      this.renderOnce();
    });

    // 后退
    threeEvent.addEventListener(SSThreeEvent.SSEventType.REVOKE, (e) => {
      // 回退
      if (this._lineVectors.length === 0) {
        return;
      }
      this._lineVectors.pop();
      // 移除绘制的一条
      this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
      this._pathGroup.children.pop();
      this._pointGroup.children.pop();
      this.renderOnce();
    });

    // 确认
    threeEvent.addEventListener(SSThreeEvent.SSEventType.CONFIRM, (e) => {
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

  /**
   * 页面渲染
   */
  renderOnce() {
    this.ssThreeObject.threeRenderer.render(
      this.ssThreeObject.threeScene,
      this.ssThreeObject.threeCamera
    );
    if (this.ssThreeObject.sceneHelper) {
      this.ssThreeObject.threeRenderer.autoClear = false;
      this.ssThreeObject.threeRenderer.render(
        this.ssThreeObject.sceneHelper,
        this.ssThreeObject.threeCamera
      );
      this.ssThreeObject.threeRenderer.autoClear = true;
    }
  }
}
