import * as THREE from 'three';
import SSCssRenderer from '../SSCssRenderer';
import SSThreeObject from '../SSThreeObject';
import SSDispose from '../SSDispose';
import SSModuleInterface from './module.interface';
import SSEvent from '../SSEvent';

export default class SSDevelopMode extends SSModuleInterface {
  /**
   * 类标题
   */
  title = '路径取点工具';

  /**
   * @type THREE.Group
   */
  _pathGroup = null;

  /**
   * @type THREE.Group
   */
  _pointGroup = null;

  /**
   * @type SSEvent
   */
  _threeEvent = null;

  /**
   * @type THREE.Vector3[]
   */
  _lineVectors = null;

  /**
   * 当前点位
   */
  _currentVector = { x: 0, y: 0, z: 0 };

  /**
   * 绘制结束
   */
  _dynamicConfig = {
    pointWidth: 0.05,
    lineWidth: 0.001,
    enable: false,
    remark: '完成(ENTER)后退(ESC)',
    points: '选择的点位',
    color: new THREE.Color(0xffffff)
  };

  /**
   * 开启选择路径模式
   */
  openChoosePathMode() {
    this._lineVectors = [];
    this.ssthreeObject.changeCameraMode(SSThreeObject.CameraType.Orthographic);
    this._addEvent();

    // 获取几何体的大小
    /* const defaultMeshName = this.getModuleConfigSource().targetMesh?.[0];
    const { targetMeshName = defaultMeshName } = this._guiData;
    const targetMesh = this.ssthreeObject.threeScene.getObjectByName(targetMeshName);
    const { min, max } = SSThreeTool.setBoundingBox(targetMesh);
    const width = (max.x - min.x) * 2;
    const height = (max.z - min.z) * 2;

    const material = new THREE.MeshBasicMaterial({
      color: 'blue',
      depthTest: true
    });
    const planeGeometry = new THREE.PlaneGeometry(width, height, 1);
    const mesh = new THREE.Mesh(planeGeometry, material);
    mesh.rotateX(THREE.MathUtils.degToRad(-90));
    group.add(mesh); */

    const linegroup = new THREE.Group();
    linegroup.position.set(0, 0, 0);
    linegroup.name = 'debug_linepath';
    this.ssthreeObject?.threeScene.add(linegroup);
    this._pathGroup = linegroup;
    const pointgroup = new THREE.Group();
    pointgroup.position.set(0, 0, 0);
    pointgroup.name = 'debug_linepoint';
    this.ssthreeObject?.threeScene.add(pointgroup);
    this._pointGroup = pointgroup;
  }

  /**
   * 关闭选择路径模式
   */
  closeChoosePathMode() {
    this._removeEvent();
    this.ssthreeObject.changeCameraMode(SSThreeObject.CameraType.Perspective);

    if (this._pathGroup) {
      SSDispose.dispose(this._pathGroup);
      this._pathGroup.removeFromParent();
    }
    if (this._pointGroup) {
      SSDispose.dispose(this._pointGroup);
      this._pointGroup.removeFromParent();
    }
  }

  /**
   * 注册事件
   */
  _addEvent() {
    const threeEvent = new SSEvent(this.ssthreeObject.threeContainer);
    this._threeEvent = threeEvent;
    threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (e) => {
      if (!this._dynamicConfig.enable) {
        return;
      }
      const models = this.ssthreeObject.getModelsByPoint({
        x: e.offsetX,
        y: e.offsetY
      });
      if (models.length === 0) return;

      // 目标点位
      const { point } = models[0];
      this._lineVectors.push(point);
      this._currentVector = point;
      // 目标几何体
      const boxgeo = new THREE.SphereGeometry(this._dynamicConfig.pointWidth);
      const material = new THREE.MeshBasicMaterial({
        color: this._dynamicConfig.color,
        depthTest: true
      });
      const box = new THREE.Mesh(boxgeo, material);
      box.position.copy(point);
      this._pointGroup.add(box);
      //
      if (this._lineVectors.length < 2) return;
      // 移除时刻渲染的一条
      this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
      //
      this._pathGroup.add(
        SSCssRenderer.addLine(
          this._lineVectors[this._lineVectors.length - 2],
          this._lineVectors[this._lineVectors.length - 1],
          {
            linewidth: this._dynamicConfig.lineWidth,
            color: this._dynamicConfig.color
          },
          false
        ).group
      );
    });

    threeEvent.addEventListener(SSEvent.SSEventType.MOUSEMOVE, (e) => {
      if (!this._dynamicConfig.enable) {
        return;
      }
      if (this._lineVectors.length === 0) {
        return;
      }
      const models = this.ssthreeObject.getModelsByPoint({
        x: e.x,
        y: e.y
      });
      if (models.length === 0) return;
      this._currentVector = models[0].point;
      // 移除时刻渲染的一条
      this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
      // 新增一条
      const { group } = SSCssRenderer.addLine(
        this._lineVectors[this._lineVectors.length - 1],
        models[0].point,
        {
          linewidth: this._dynamicConfig.lineWidth,
          color: this._dynamicConfig.color
        },
        false
      );
      group.name = 'debug_line_moveline';
      this._pathGroup.add(group);
    });

    threeEvent.addEventListener(SSEvent.SSEventType.KEYDOWN, (e) => {
      switch (e.key) {
        case 'Escape':
          // 回退
          if (this._lineVectors.length === 0) {
            return;
          }
          this._lineVectors.pop();
          // 移除绘制的一条
          this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
          this._pathGroup.children.pop();
          this._pointGroup.children.pop();
          break;
        case 'Enter':
          if (this._lineVectors.length === 0) {
            return;
          }
          this.closeChoosePathMode();
          this._dynamicConfig.enable = false;
          this._dynamicConfig.points = JSON.stringify(this._lineVectors);
          this.moduleUpdateGuiValue('points', JSON.stringify(this._lineVectors));
          this.moduleUpdateGuiValue('enable', false);
          break;
        default:
          break;
      }
    });
  }

  /**
   * 移除事件
   */
  _removeEvent() {
    this._threeEvent?.destory();
    this._threeEvent = null;
  }

  moduleMount(obj) {
    //
  }

  moduleUnmount() {
    this._removeEvent();
  }

  getModuleConfig() {
    return this._dynamicConfig;
    // points: this._lineVectors.length > 0 ? JSON.stringify(this._lineVectors) : '选择的点位',
    // targetMeshName: this.getModuleConfigSource().targetMeshName?.[0]
  }

  // /**
  //  * @returns {Object} 调试工具类型
  //  */
  // getModuleConfigSource() {
  //   const meshNames = this.ssthreeObject.threeScene.children.reduce((prev, cur) => {
  //     if (cur instanceof THREE.Mesh || cur instanceof THREE.Group) {
  //       return [...prev, cur.name || cur.type];
  //     }
  //     return prev;
  //   }, []);
  //   return {
  //     targetMeshName: meshNames
  //   };
  // }

  moduleGuiChange(params) {
    const { key, value, target } = params;
    this._dynamicConfig = target;
    this._dynamicConfig.color = new THREE.Color(
      this._dynamicConfig.color.r,
      this._dynamicConfig.color.g,
      this._dynamicConfig.color.b
    );
    if (key === 'enable') {
      if (value) {
        this.openChoosePathMode();
      } else {
        this.closeChoosePathMode();
      }
    }

    if (!this._dynamicConfig.enable) {
      return;
    }
    if (key === 'color') {
      this._pathGroup.traverse((e) => {
        if (e instanceof THREE.Mesh) {
          e.material?.color?.set(this._dynamicConfig.color);
        }
      });
      this._pointGroup.traverse((e) => {
        if (e instanceof THREE.Mesh) {
          e.material?.color?.set(this._dynamicConfig.color);
        }
      });
    }
  }
}
