import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import ThreeLoop from './SSThreeLoop';

export default class ThreeControls {
  // 相机
  threeCamera = null;

  // webgl渲染上下文
  threeGlRender = null;

  // scene
  threeScene = null;

  //
  #threeJs = null;

  // 闹钟
  _flyClock = new THREE.Clock();

  // 飞行控制器
  _threeFlyControl = null;

  // 第一人称控制器
  _threeFirstPersonControl = null;

  // 轨迹控制器
  _trackballControl = null;

  // transform control
  transformControl = null;

  destory() {
    ThreeLoop.removeIds([
      'fly control render',
      'fly person control render',
      'fly ball control render',
      'transformControls render'
    ]);
    this._flyClock.stop();
    this._flyClock = null;
    this._removeFlyControl();
    this._removeFlyPersonControl();
    this.removeTransformControl();
  }

  /**
   * 绑定相机 渲染上下文
   */
  bindCamera = (aCamera, aWebglRender, aScene) => {
    this.threeCamera = aCamera;
    this.threeGlRender = aWebglRender;
    this.threeScene = aScene;
  };

  /**
   * bind threejs
   */
  bindThreeJs = (aThreeJs) => {
    this.#threeJs = aThreeJs;
  };

  /**
   * 增加飞行控制器
   */
  addFlyControl = () => {
    const flycontrol = new FlyControls(this.threeCamera, this.threeGlRender.domElement);
    // 翻滚速度
    flycontrol.rollSpeed = Math.PI / 24;
    // 自动向前移动
    flycontrol.autoForward = true;
    // 拖动
    flycontrol.dragToLook = false;
    // 移动速度
    flycontrol.movementSpeed = 25;
    //
    this._threeFlyControl = flycontrol;
    //
    ThreeLoop.add(() => {
      flycontrol.update(this._flyClock.getDelta());
    }, 'fly control render');
  };

  /**
   * 移除飞行控制器
   */
  _removeFlyControl = () => {
    if (this._threeFlyControl !== null) {
      this._threeFlyControl.dispose();
      this._threeFlyControl = null;
    }
  };

  /**
   * 增加第一人称控制器
   */
  addFlyPersonControl = () => {
    const flycontrol = new FirstPersonControls(this.threeCamera, this.threeGlRender.domElement);
    // 鼠标移动查看的速度
    // flycontrol.lookSpeed = 1;
    // // 相机移动的速度
    // flycontrol.movementSpeed = 20;
    // // 约束垂直
    // flycontrol.constrainVertical = true;
    // //
    // flycontrol.verticalMin = 1;
    // //
    // flycontrol.verticalMax = 2;
    //
    this._threeFirstPersonControl = flycontrol;

    // const render = () => {
    //   this._firstpersonFrameHandle = window.requestAnimationFrame(() => {
    //     console.log(' 第一人称控制器 动画更新 ');
    //     flycontrol.update(this._flyClock.getDelta());
    //     render();
    //   });
    // };
    // render();
    ThreeLoop.add(() => {
      flycontrol.update(this._flyClock.getDelta());
    }, 'fly person control render');
  };

  /**
   * 移除飞行控制器
   */
  _removeFlyPersonControl = () => {
    window.cancelAnimationFrame(this._firstpersonFrameHandle);
    if (this._threeFirstPersonControl !== null) {
      this._threeFirstPersonControl.dispose();
      this._threeFirstPersonControl = null;
    }
  };

  /**
   * 增加轨迹球控制器
   */
  addTrackballControls = () => {
    const control = new TrackballControls(this.threeCamera, this.threeGlRender.domElement);
    this._trackballControl = control;

    ThreeLoop.add(() => {
      control.update();
    }, 'fly ball control render');
  };

  /**
   * 移除飞行控制器
   */
  _removeTrackballControl = () => {
    if (this._trackballControl !== null) {
      ThreeLoop.removeId('fly ball control render');
      this._trackballControl.dispose();
      this._trackballControl = null;
    }
  };

  /**
   * add transform控制器
   */
  addTransformControls = (obj) => {
    const control = new TransformControls(this.threeCamera, this.threeGlRender.domElement);
    if (obj instanceof THREE.Object3D) {
      control.attach(obj);
    }
    this.threeScene.add(control);
    control.addEventListener('change', () => {
      this.#threeJs.threeOrbitControl.enabled = !control.dragging;
    });
    return control;
  };

  /**
   * remove control
   */
  removeTransformControl = (control) => {
    if (control instanceof TransformControls) {
      control.reset();
      control.dispose();
    } else {
      this.threeScene?.remove(
        ...this.threeScene.children.filter((item) => item instanceof TransformControls)
      );
    }
  };
}
