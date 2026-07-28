/*
 * @Date: 2022-03-24 19:35:53
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-06-02 17:57:41
 * @FilePath: /isop-portal/src/js/ThreeJs/v3/DepthRender.js
 */
import * as THREE from 'three';
import {
  LinearFilter,
  RawShaderMaterial,
  RGBAFormat,
  Vector2,
  Vector4,
  WebGLRenderTarget
} from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { RenderStep } from './RenderStep';

/**
 * @class DepthRender
 * @author Conor.Yang
 */
class DepthRender extends RenderStep {
  /**
   * @constructor
   * @param {WebGLRenderer} renderer
   * @param {PerspectiveCamera} camera
   * @param {Scene} scene
   */
  constructor(renderer, camera, scene) {
    super(renderer, camera, scene);

    /**
     * @type {RenderPass}
     */
    this.renderPass = null;

    /**
     * @type {WebGLRenderTarget}
     */
    this.renderTarget = null;
  }

  initialize() {
    // console.log('DepthRender.initialize...');
    this.renderPass = new RenderPass(this.scene, this.camera, this.material());

    const screen = new Vector2(1024, 1024);
    // console.log('screen:', { width: screen.width, height: screen.height });
    this.renderTarget = new WebGLRenderTarget(screen.width, screen.height, {
      magFilter: LinearFilter,
      minFilter: LinearFilter,
      format: RGBAFormat
    });
    this.renderTarget.viewport = new Vector4(0, 0, screen.width, screen.height);
    // 0.172 颜色管理：DepthRender 输出的是打包的深度数据（encode(gl_FragCoord.z)），
    // 不是颜色，不应做 linear->sRGB 传输转换。标为 sRGB 会被 three 按 SRGB 内部格式处理，
    // 扭曲深度值，导致 ColorRender decode(depth) 读回偏差、投影边界误判。故保持线性。
    this.renderTarget.colorSpace = THREE.LinearSRGBColorSpace;
    this._depthDirty = true; // 初次必须渲一次
  }

  /**
   * 性能优化（脏检测）：投影相机/场景几何未变时跳过深度图重渲。
   * 深度图只依赖场景几何（mesh 的 matrixWorld）和投影相机（matrixWorld），
   * 与视频内容无关，故实时视频流场景下相机固定+场景静止时可安全复用上一帧深度。
   * 宁可多渲不漏渲：指纹任一元素变就重渲，最坏退化为每帧重渲（等于现状）。
   *
   * depthDirtyStrategy 三档（默认 'camera-only'，适合监控投静态建筑的大场景）：
   *   'camera-only'：只比对投影相机 matrixWorld，O(1) 不遍历场景。相机被拖动自动 dirty；
   *                   场景加载/替换新模型后需调用 invalidate()。投影区有动画遮挡物时不适用。
   *   'off'         ：每帧重渲（等于改造前），投影区有动画遮挡物时用。
   *   'full'        ：全量遍历场景所有 mesh 比对矩阵（最安全但贵，大场景慎用）。
   * @param {Object3D[]} ignoreObjectList 不参与投影的物体（仅 'full' 策略用）
   * @returns {boolean} 是否真正执行了渲染（供调试/统计）
   */
  render(ignoreObjectList = []) {
    const strategy = this.depthDirtyStrategy || 'camera-only';
    if (strategy !== 'off') {
      let dirty = this._depthDirty;
      if (!dirty) {
        if (strategy === 'camera-only') {
          dirty = this._isCameraDirty();
        } else if (strategy === 'full') {
          dirty = this._isFullDirty(ignoreObjectList);
        }
      }
      if (!dirty) {
        return false; // 复用上一帧深度图，跳过渲染
      }
    }
    this._depthDirty = false;
    const state = {
      background: this.scene.background,
      shadowMapEnabled: this.renderer.shadowMap.enabled
    };
    this.scene.background = null;
    this.renderer.shadowMap.enabled = false;
    this.renderPass.render(this.renderer, null, this.renderTarget);
    this.scene.background = state.background;
    this.renderer.shadowMap.enabled = state.shadowMapEnabled;
    return true;
  }

  /**
   * 强制下次 render 重渲深度图。addCamera/removeCamera/相机增删/场景加载新模型后调用。
   */
  invalidate() {
    this._depthDirty = true;
  }

  // 'camera-only' 策略：只比对投影相机 matrixWorld（O(1)，不遍历场景）。
  // 适合监控投静态建筑的大场景：相机固定+建筑静态时深度永不变，命中缓存跳过渲染。
  _isCameraDirty() {
    const cam = this.camera;
    cam.updateMatrixWorld(true);
    const e = cam.matrixWorld.elements;
    let cache = this._camCache;
    if (!cache || cache.length !== 16) {
      this._camCache = new Float64Array(e);
      return true;
    }
    for (let i = 0; i < 16; i++) {
      if (cache[i] !== e[i]) {
        this._camCache = new Float64Array(e);
        return true;
      }
    }
    return false;
  }

  // 'full' 策略：全量遍历场景 mesh 比对 matrixWorld（最安全，但大场景贵）。
  // 用扁平 Float64Array 缓存，逐元素比对，遇到第一个不同立即返回。
  // 一次全树 updateMatrixWorld(true) 保证子级也最新（无参 updateWorldMatrix 只更自己，
  // 子级动会漏判），再只读 matrixWorld，避免每 mesh 一次 update 的重复开销。
  _isFullDirty(ignoreObjectList) {
    // 先比投影相机
    const cam = this.camera;
    cam.updateMatrixWorld(true);
    const camE = cam.matrixWorld.elements;
    let cache = this._camCache;
    if (!cache || cache.length !== 16) {
      this._camCache = new Float64Array(camE);
      return true;
    }
    for (let i = 0; i < 16; i++) {
      if (cache[i] !== camE[i]) {
        this._camCache = new Float64Array(camE);
        return true;
      }
    }

    // 全树更新一次矩阵（含子级），之后只读，避免每 mesh 重复 update + 子级漏判
    this.scene.updateMatrixWorld(true);

    // 收集当前非 ignore 的 mesh（与 renderPass 渲染范围一致）
    const ignoreSet = ignoreObjectList && ignoreObjectList.length ? new Set(ignoreObjectList) : null;
    const meshes = [];
    this.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      if (ignoreSet && ignoreSet.has(obj)) return;
      if (obj.isCameraHelper || obj.userData?.isOverlay) return;
      meshes.push(obj);
    });

    const prevMeshes = this._meshCache;
    if (!prevMeshes || prevMeshes.length !== meshes.length) {
      this._meshCache = meshes.map((m) => new Float64Array(m.matrixWorld.elements));
      this._meshCacheRefs = meshes;
      return true;
    }

    for (let i = 0; i < meshes.length; i++) {
      const e = meshes[i].matrixWorld.elements;
      const c = prevMeshes[i];
      for (let j = 0; j < 16; j++) {
        if (c[j] !== e[j]) {
          this._meshCache = meshes.map((mm) => new Float64Array(mm.matrixWorld.elements));
          this._meshCacheRefs = meshes;
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 释放资源：renderTarget + overrideMaterial(RawShaderMaterial)。
   * 反复开关融合时，每次 initialize 都新建，旧的若不 dispose 会泄漏 GPU 程序与显存。
   */
  dispose() {
    if (this.renderPass?.overrideMaterial) {
      this.renderPass.overrideMaterial.dispose?.();
      this.renderPass.overrideMaterial = null;
    }
    this.renderTarget?.dispose?.();
    this.renderTarget = null;
    this.renderPass = null;
    this._camCache = null;
    this._meshCache = null;
    this._meshCacheRefs = null;
    this._depthDirty = true;
  }

  /**
   * @returns {RawShaderMaterial}
   */
  material() {
    return new RawShaderMaterial({
      vertexShader: [
        'attribute vec3 position;',
        'uniform   mat4 modelViewMatrix;',
        'uniform   mat4 projectionMatrix;',
        'void main() {',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;',
        'vec4 encode(const in float value) {',
        '    const vec4 a = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);',
        '    const vec4 b = vec4(1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0, 0.0);',
        '    vec4 color = fract(value * a);',
        '    color -= color.gbaa * b;',
        '    return color;',
        '}',
        'void main() {',
        '  gl_FragColor = encode(gl_FragCoord.z);',
        '}'
      ].join('\n')
    });
  }

  /**
   * @returns {Texture}
   */
  texture() {
    return this.renderTarget.texture;
  }
}

export { DepthRender };
