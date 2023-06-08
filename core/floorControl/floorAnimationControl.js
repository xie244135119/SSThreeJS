/*
 * Author  Kayson.Wan
 * Date  2022-09-15 10:51:16
 * LastEditors  xie244135119
 * LastEditTime  2022-10-07 10:52:54
 * Description
 */
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { Mesh, Scene } from 'three';
import TWEEN from '@tweenjs/tween.js';
import ThreeLoop from '../threeLoop';

export default class floorAnimationControl {
  //   _scene = null;
  //   _camera = null;
  //   _container = null;
  //   constructor({ scene, camera, container }) {
  //     this._scene = scene;
  //     this._camera = camera;
  //     this._container = container;
  //   }

  objectList = null;

  #tweenParams = [];

  // /**
  //  * @param {*} objectList [{}]
  //  */
  // constructor(objectList) {
  //   this.objectList = objectList;
  //   if (!Array.isArray(this.objectList)) {
  //     this.objectList = [this.objectList];
  //   }
  //   for (let i = 0; i < this.objectList.length; i++) {
  //     const object = this.objectList[i];
  //     let tween = new TWEEN.Tween();
  //     let params = { object: object, tween: tween };
  //     this.#tweenParams.push(params);
  //   }
  // }
  initControl = (objectList) => {
    this.objectList = objectList;
    if (!Array.isArray(this.objectList)) {
      this.objectList = [this.objectList];
    }
    for (let i = 0; i < this.objectList.length; i++) {
      const object = this.objectList[i];
      object.userData.position = new THREE.Vector3(
        object.position.x,
        object.position.y,
        object.position.z
      );
      // console.log(object);
      const tween = new TWEEN.Tween();
      const params = { object, tween };
      this.#tweenParams.push(params);
    }
  };

  playAnimation = (index, isBack = false) => {
    // for (let i = 0; i < this.#tweenParams.length; i++) {
    //     const { object, tween } = this.#tweenParams[i];
    //     this._modelAnimation(
    //       tween,
    //       object,
    //       new THREE.Vector3(object.position.x, object.position.y, object.position.z),
    //       new THREE.Vector3(object.position.x, object.position.y + 200, object.position.z),
    //       () => {
    //         // clearTimeout(timeout1);
    //       },
    //       1,
    //       isBack
    //     );
    // }
    const { object, tween } = this.#tweenParams[index];
    this._modelAnimation(
      tween,
      object,
      new THREE.Vector3(
        object.userData.position.x,
        object.userData.position.y,
        object.userData.position.z
      ),
      new THREE.Vector3(
        object.userData.position.x,
        object.userData.position.y + 200,
        object.userData.position.z
      ),
      () => {
        // clearTimeout(timeout1);
        console.log(object.userData.position);
      },
      1,
      isBack
    );
  };

  /**
   * 模型动画
   * @param {Tween} tweenAnimate tween
   * @param {THREE.Mesh} obj 操作的模型Mesh
   * @param {THREE.Vector3} startPos 结束位置
   * @param {THREE.Vector3} endPos 结束位置
   * @param {*} onComplete 回调
   * @param {float} speed 速度 1
   * @param {boolean} playBack 倒放 false
   * @param {float} delayTime 延迟 0mm
   */
  _modelAnimation = (
    tweenAnimate,
    obj,
    startPos,
    endPos,
    onComplete,
    speed,
    playBack,
    delayTime
  ) => {
    const aStartPoint = {
      pos_x: startPos.x,
      pos_y: startPos.y,
      pos_z: startPos.z,
      alpha: 1
    };
    const aEndPoint = {
      pos_x: endPos.x,
      pos_y: endPos.y,
      pos_z: endPos.z,
      alpha: 0
    };
    // 修改 material
    const materialList = [];
    obj.traverse((item) => {
      if (
        item instanceof THREE.Mesh ||
        item instanceof THREE.Points ||
        item instanceof THREE.Sprite
      ) {
        const _material = item.material;
        _material.transparent = true;
        materialList.push(_material);
      }
    });
    // tween
    this._useTweenAnimate(
      tweenAnimate,
      aStartPoint,
      aEndPoint,
      (e) => {
        obj.position.set(e.pos_x, e.pos_y, e.pos_z);
        materialList.forEach((material) => {
          // material.transparent = e.alpha != 1;
          // material.opacity = e.alpha;
        });
      },
      () => {
        // console.log('obj', obj);
        // obj.visible = false;
        onComplete();
      },
      speed,
      playBack,
      delayTime
    );
  };

  //
  /**
   * tween动画
   * @param {TWEEN} tweenAnimate tween
   * @param {*} aStartPoint start {}
   * @param {*} aEndPoint end {}
   * @param {*} onUpdate update function
   * @param {*} onComplete complete function
   * @param {float} speed 速度:1
   * @param {boolean} playBack 回放: false
   * @param {float} delayTime 延迟: 0mm
   */
  _useTweenAnimate = (
    tweenAnimate,
    aStartPoint = {},
    aEndPoint = {},
    onUpdate = () => {},
    onComplete = () => {},
    speed = 1,
    playBack = false,
    delayTime = 0
  ) => {
    const _tweenAnimateFrame = null;
    // if (!this.tweenAnimate) {
    //   this.tweenAnimate = new TWEEN.Tween(aStartPoint);
    // }
    console.log(playBack);
    tweenAnimate._object = aStartPoint;
    tweenAnimate._reversed = playBack;

    tweenAnimate.to(aEndPoint, speed * 1000);
    tweenAnimate.delay(delayTime);

    tweenAnimate.onUpdate(onUpdate);
    tweenAnimate.onStop(() => {
      tweenAnimate.stop();
      TWEEN.remove(tweenAnimate);
      window.cancelAnimationFrame(_tweenAnimateFrame);
    });
    tweenAnimate.onComplete(() => {
      tweenAnimate.stop();
      TWEEN.remove(tweenAnimate);
      window.cancelAnimationFrame(_tweenAnimateFrame);
      onComplete();
    });
    tweenAnimate.easing(TWEEN.Easing.Quintic.Out);
    tweenAnimate.start();

    this._tweenAnimateFrame = ThreeLoop.add(() => {
      if (tweenAnimate.isPlaying()) {
        TWEEN.update();
      }
    }, 'flooranimate render');
  };
}
