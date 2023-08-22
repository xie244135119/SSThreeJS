import * as THREE from 'three';
import SSThreeObject from '../SSThreeObject';
import SSDispose from '../SSDispose';
import SSModuleInterface from './module.interface';
import SSEvent from '../SSEvent';
import SSThreeTool from '../SSTool';

export default class SSPickPointMode extends SSModuleInterface {
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
    remark: '完成(ENTER)后退(ESC)',
    points: '选择的点位',
    color: new THREE.Color(0xffffff)
  };

  /**
   * 开启选择路径模式
   */
  openChoosePathMode() {
    this._lineVectors = [];
    this.ssThreeObject.changeCameraMode(SSThreeObject.CameraType.Orthographic);
    this._addEvent();

    // 获取几何体的大小
    /* const defaultMeshName = this.getModuleConfigSource().targetMesh?.[0];
    const { targetMeshName = defaultMeshName } = this._guiData;
    const targetMesh = this.ssThreeObject.threeScene.getObjectByName(targetMeshName);
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
    this.ssThreeObject?.threeScene.add(linegroup);
    this._pathGroup = linegroup;
    const pointgroup = new THREE.Group();
    pointgroup.position.set(0, 0, 0);
    pointgroup.name = 'debug_linepoint';
    this.ssThreeObject?.threeScene.add(pointgroup);
    this._pointGroup = pointgroup;
  }

  /**
   * 关闭选择路径模式
   */
  closeChoosePathMode() {
    this._removeEvent();
    this.ssThreeObject.changeCameraMode(SSThreeObject.CameraType.Perspective);

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
    const threeEvent = new SSEvent(this.ssThreeObject.threeContainer);
    this._threeEvent = threeEvent;
    threeEvent.addEventListener(SSEvent.SSEventType.CLICK, (e) => {
      const models = this.ssThreeObject.getModelsByPoint(e);
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
        SSThreeTool.addLine(
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
      if (this._lineVectors.length === 0) {
        return;
      }
      const models = this.ssThreeObject.getModelsByPoint(e);
      if (models.length === 0) return;
      this._currentVector = models[0].point;
      // 移除时刻渲染的一条
      this._pathGroup.getObjectByName('debug_line_moveline')?.removeFromParent();
      // 新增一条
      const { group } = SSThreeTool.addLine(
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
    });

    // 确认
    threeEvent.addEventListener(SSEvent.SSEventType.CONFIRM, (e) => {
      if (this._lineVectors.length === 0) {
        return;
      }
      this._dynamicConfig.points = JSON.stringify(this._lineVectors);
      this.moduleUpdateGuiValue('points', JSON.stringify(this._lineVectors));
      this._lineVectors = [];
      const pathmeshs = [...this._pathGroup.children];
      pathmeshs.forEach((e) => {
        e.removeFromParent();
      });
      const pointmeshs = [...this._pointGroup.children];
      pointmeshs.forEach((e) => {
        e.removeFromParent();
      });
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
  }

  // /**
  //  * @returns {Object} 调试工具类型
  //  */
  // getModuleConfigSource() {
  //   const meshNames = this.ssThreeObject.threeScene.children.reduce((prev, cur) => {
  //     if (cur instanceof THREE.Mesh || cur instanceof THREE.Group) {
  //       return [...prev, cur.name || cur.type];
  //     }
  //     return prev;
  //   }, []);
  //   return {
  //     targetMeshName: meshNames
  //   };
  // }

  moduleOpenDebug() {
    this.openChoosePathMode();
  }

  moduleCloseDebug() {
    this.closeChoosePathMode();
  }

  moduleGuiChange(params) {
    const { key, value, target } = params;
    this._dynamicConfig = target;
    this._dynamicConfig.color = new THREE.Color(
      this._dynamicConfig.color.r,
      this._dynamicConfig.color.g,
      this._dynamicConfig.color.b
    );
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
