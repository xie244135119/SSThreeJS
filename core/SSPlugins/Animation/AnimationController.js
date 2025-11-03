/*
 * Author       Kayson.Wan
 * Date         2025-07-25 11:41:23
 * LastEditors  Kayson.Wan
 * LastEditTime  2025-09-16 10:43:02
 * Description  动画播放控制器
 */
import * as THREE from 'three';

export default class AnimationController {
  // this.animationController = new AnimationController(gltf.scene, gltf.animations);
  // this.animationController.playOnce('开门');

  /**
   * 根据模型初始化动画控制器
   * @param {*} model gltf.scene
   * @param {*} animations gltf.animations
   */
  constructor(model, animations = []) {
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    this.currentAction = null;
    this.currentClipName = null;
    this.loop = true;
    this.speed = 1.0;
    this._clock = new THREE.Clock();
    this._isPlaying = false;
    this._onFinishedCallback = null;

    animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      action.enabled = true;
      this.actions[clip.name] = action;
    });

    this._startLoop();
    this._setupFinishListener();
  }

  _startLoop() {
    const loop = () => {
      if (this._isPlaying) {
        const delta = this._clock.getDelta();
        this.mixer.update(delta * this.speed);
      }
      requestAnimationFrame(loop);
    };
    this._isPlaying = true;
    loop();
  }

  _setupFinishListener() {
    this.mixer.addEventListener('finished', (e) => {
      if (this._onFinishedCallback && typeof this._onFinishedCallback === 'function') {
        this._onFinishedCallback(e.action._clip.name);
      }
    });
  }

  /**
   * 设置动画完成时回调
   * @param {(clipName: string) => void} callback
   */
  onFinished(callback) {
    this._onFinishedCallback = callback;
  }

  /**
   * 播放动画（带平滑过渡）
   * @param {string} name
   * @param {number} fadeDuration
   */
  play(name, fadeDuration = 0.5) {
    const nextAction = this.actions[name];
    if (!nextAction) {
      console.warn(`Animation "${name}" not found.`);
      return;
    }

    if (this.currentClipName === name) return;

    nextAction.reset();
    nextAction.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce);
    nextAction.setEffectiveTimeScale(this.speed);
    nextAction.setEffectiveWeight(1.0);
    nextAction.clampWhenFinished = !this.loop;
    nextAction.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, fadeDuration, true);
    }

    this.currentAction = nextAction;
    this.currentClipName = name;
    this._isPlaying = true;
  }

  /**
   * 手动过渡到动画（暴露 warp 控制）
   */
  crossFadeTo(name, duration = 0.5, warp = true) {
    const nextAction = this.actions[name];
    if (!nextAction) return;

    nextAction.reset();
    nextAction.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce);
    nextAction.setEffectiveTimeScale(this.speed);
    nextAction.setEffectiveWeight(1.0);
    nextAction.clampWhenFinished = !this.loop;
    nextAction.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, duration, warp);
    }

    this.currentAction = nextAction;
    this.currentClipName = name;
    this._isPlaying = true;
  }

  /**
   * 播放一次（非循环，结束后停在最后一帧）
   */
  playOnce(name, fadeDuration = 0.5) {
    this.setLoop(false);
    this.play(name, fadeDuration);
  }

  /**
   * 顺序播放所有动画
   */
  playAllSequential(fadeDuration = 0.5) {
    const clipNames = this.getClipNames();
    if (clipNames.length === 0) return;

    let index = 0;
    this.setLoop(false);

    const playNext = () => {
      if (index >= clipNames.length) {
        console.log('所有动画播放完成');
        return;
      }
      const name = clipNames[index++];
      this.play(name, fadeDuration);
      this.onFinished(() => playNext());
    };

    playNext();
  }

  /**
   * 顺序播放指定的动画数组
   */
  playMultiple(names, fadeDuration = 0.5) {
    if (!Array.isArray(names) || names.length === 0) return;

    let index = 0;
    this.setLoop(false);

    const playNext = () => {
      if (index >= names.length) {
        console.log('指定动画序列播放完成');
        return;
      }
      const name = names[index++];
      if (!this.actions[name]) {
        console.warn(`Animation "${name}" not found.`);
        playNext(); // 跳过不存在的
        return;
      }
      this.play(name, fadeDuration);
      this.onFinished(() => playNext());
    };

    playNext();
  }

  /**
   * 同时播放所有动画
   */
  playAll() {
    this.setLoop(true);
    Object.values(this.actions).forEach((action) => {
      action.reset();
      action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce);
      action.setEffectiveTimeScale(this.speed);
      action.setEffectiveWeight(1.0);
      action.clampWhenFinished = !this.loop;
      action.play();
    });
    this.currentAction = null;
    this.currentClipName = null;
    this._isPlaying = true;
  }

  pause() {
    this._isPlaying = false;
  }

  resume() {
    this._isPlaying = true;
  }

  stop() {
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = null;
      this.currentClipName = null;
    }
    this._isPlaying = false;
  }

  setSpeed(speed) {
    this.speed = speed;
    this.mixer.timeScale = speed;
    if (this.currentAction) {
      this.currentAction.setEffectiveTimeScale(speed);
    }
  }

  setLoop(loop) {
    this.loop = loop;
    if (this.currentAction) {
      this.currentAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
    }
  }

  getClipNames() {
    return Object.keys(this.actions);
  }

  getCurrentClipName() {
    return this.currentClipName;
  }

  isPlaying() {
    return this._isPlaying;
  }

  destroy() {
    this.stop();
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.mixer.getRoot());
    this.mixer = null;
    this.actions = null;
    this._clock = null;
    this._onFinishedCallback = null;
  }
}
