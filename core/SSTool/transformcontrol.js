import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import SSEvent from '../SSEvent';
import SSThreeObject from '../SSThreeObject';

export default class SSTransformControl {
  /**
   * 函数构造 t：平移，r：旋转，s：放大缩小
   * @type {function ({ target: THREE.Object3D,position: THREE.Vector3, rotation: THREE.Vector3, scale: THREE.Vector3, delete: boolean }):void}
   */
  onControlChange = null;

  /**
   * @type {SSThreeObject} 物体
   */
  _ssThreeObject = null;

  /**
   * @type {TransformControls} 控制器
   */
  _control = null;

  /**
   * @type {SSEvent} 交互事件
   */
  _event = null;

  /**
   * 构造函数
   * @param {SSThreeObject} ssThreeObject 绑定的物体
   * @param {function ({ position: THREE.Vector3, rotation: THREE.Vector3, scale: THREE.Vector3, name: string, uuid: string, delete: boolean }):void} callBack 回调事件
   */
  constructor(ssThreeObject, callBack) {
    this._ssThreeObject = ssThreeObject;
    this.onControlChange = callBack;
  }

  destory() {
    this._event?.destory();
    this._event = null;
    this._ssThreeObject = null;
    this._control?.removeFromParent();
    this._control?.dispose();
    this.onControlChange = null;
    this._control = null;
  }

  /**
   * 追踪某个物体
   * @param {THREE.Object3D} object3d 目标物体
   */
  attach(object3d) {
    if (!this._control) {
      this._control = new TransformControls(
        this._ssThreeObject.threeCamera,
        this._ssThreeObject.threeContainer
      );
      this._ssThreeObject.threeScene.add(this._control);
      this._control.addEventListener('change', (e) => {
        // 禁用轨道控制器
        this._ssThreeObject.threeOrbitControl.enabled = !this._control.dragging;
        //
        if (!this._control.object) {
          return;
        }
        this.onControlChange?.({
          name: this._control.object.name,
          uuid: this._control.object.uuid,
          target: this._control.object,
          position: {
            x: this._control.object.position.x,
            y: this._control.object.position.y,
            z: this._control.object.position.z
          },
          rotation: {
            x: THREE.MathUtils.radToDeg(this._control.object.rotation.x),
            y: THREE.MathUtils.radToDeg(this._control.object.rotation.y),
            z: THREE.MathUtils.radToDeg(this._control.object.rotation.z)
          },
          scale: this._control.object.scale
        });
      });
      this._control.addEventListener('objectChange', (e) => {
        // console.log(' 选中的物体改变的时候 ', e);
      });
      this._event = new SSEvent(this._ssThreeObject.threeContainer);
      this._event.addEventListener(SSEvent.SSEventType.KEYDOWN, (e) => {
        if (!this._control.object) {
          return;
        }
        // tranlate 平移 t
        // rotate 旋转 r
        // scale 放大缩小 s
        switch (e.key) {
          case 'q': // 转换坐标系
            this._control.setSpace(this._control.space === 'world' ? 'local' : 'world');
            break;
          case 'e': // 旋转
            this._control.setMode('rotate');
            break;
          case 'w': // 平移----
            this._control.setMode('translate');
            break;
          case 'r': // 放大
            this._control.setMode('scale');
            break;
          case 'x': // x轴隐藏
            this._control.showX = !this._control.showX;
            break;
          case 'y': // y轴隐藏
            this._control.showY = !this._control.showY;
            break;
          case 'z': // z轴隐藏
            this._control.showZ = !this._control.showZ;
            break;
          case 'Escape': // 取消选中
            this._control.detach();
            break;
          case '_':
          case '-': // size大小减小
            this._control.setSize(this._control.size * 0.9);
            break;
          case '=': // size大小增大
          case '+': // size大小增大
            this._control.setSize(this._control.size * 1.1);
            break;
          // case 'Backspace': // 删除
          //   if (this._control.object) {
          //     this.onControlChange?.({
          //       name: this._control.object.name,
          //       uuid: this._control.object.uuid,
          //       target: this._control.object,
          //       delete: true
          //     });
          //     this._control.object.removeFromParent();
          //     this._control.detach();
          //   }
          //   break;
          case 'ArrowRight': // x 轴左移
            break;
          case 'ArrowLeft': // 右移
            break;
          case 'ArrowUp': // 上移
            break;
          case 'ArrowDown': // 下移
            break;
          default:
            break;
        }
      });
    }
    this._control.attach(object3d);
    // 选中
    const oldboxHelper = this._ssThreeObject.threeScene.getObjectByName('boxhelper');
    oldboxHelper?.removeFromParent();
    const boxHelper = new THREE.BoxHelper(object3d);
    boxHelper.name = 'boxhelper';
    this._ssThreeObject.threeScene.add(boxHelper);
  }

  /**
   * 取消追踪
   */
  detach() {
    this._control.detach();
    const boxHelper = this._ssThreeObject.threeScene.getObjectByName('boxhelper');
    boxHelper?.removeFromParent();
  }
}
