/*
 * @Author: Kayson.Wan
 * @Date: 2022-11-18 10:12:48
 * LastEditors  Kayson.Wan
 * LastEditTime  2025-11-04 09:37:11
 * @Description:
 */
import * as THREE from 'three';

import { ShaderMaterial } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderStep } from './RenderStep';

/**
 * @class BlendRender
 * @author Conor.Yang
 */
class BlendRender extends RenderStep {
  /**
   * @constructor
   * @param {WebGLRenderer} renderer
   * @param {Camera} camera
   * @param {Scene} scene
   */
  constructor(renderer, camera, scene) {
    super(renderer, camera, scene);

    /**
     * @type {Texture[]} 各批 ColorRender 的输出 RT（视频投影层），按 Porter-Duff over 合成。
     * 单批时长度 1，行为与改造前一致。
     */
    this.shadowTextures = [];

    /**
     * @type {number}
     */
    this.mixing = 0.85;

    /**
     * @type {EffectComposer}
     */
    this.composer = null;

    /**
     * @type {RenderPass}
     */
    this.renderPass = null;

    /**
     * @type {ShaderPass}
     */
    this.shaderPass = null;
  }

  /**
   * 兼容旧接口：单个 shadow 设置时转为 shadowTextures[0]。
   */
  set shadow(tex) {
    this.shadowTextures = tex ? [tex] : [];
  }
  get shadow() {
    return this.shadowTextures[0] || null;
  }

  initialize() {
    // console.log("BlendRender.initialize...");
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.renderPass.clearDepth = true;

    this.shaderPass = new ShaderPass(this.material());
    this.shaderPass.renderToScreen = true;

    this.composer = new EffectComposer(this.renderer);
    // 0.172 颜色管理默认开启：EffectComposer 默认 HalfFloat 中间缓冲，
    // RenderPass 渲染时 three 不对 RT 做 toneMapping（仅直接渲染到屏幕才生效），
    // 故 composer 内部全程按 linear 流转，由 BlendRender 片元着色器统一做
    // toneMapping + linear->sRGB 编码后上屏。中间缓冲保持线性。
    this.composer.renderTarget1.texture.colorSpace = THREE.LinearSRGBColorSpace;
    this.composer.renderTarget2.texture.colorSpace = THREE.LinearSRGBColorSpace;

    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.shaderPass);
    this._lastK = this.shadowTextures.length; // initialize 已建 shader，同步 K 避免首次 update 误判
    this.composer.render();
  }

  render() {
    // console.log("BlendRender.render...");
    this.composer.render();
  }

  /**
   * 释放资源：EffectComposer（含两个中间 RenderTarget）、ShaderPass 材质。
   * 反复开关融合时，每次 initialize 都会新建一整套，旧的若不 dispose 会泄漏 GPU 程序与显存。
   */
  dispose() {
    if (this.shaderPass?.material) {
      this.shaderPass.material.dispose?.();
    }
    if (this.composer) {
      // EffectComposer.dispose 释放内部 renderTarget1/renderTarget2/copyPass
      this.composer.dispose?.();
      // 兜底显式释放（部分 three 版本 composer.dispose 不释放 pass material）
      this.composer.renderTarget1?.dispose?.();
      this.composer.renderTarget2?.dispose?.();
    }
    this.renderPass = null;
    this.shaderPass = null;
    this.composer = null;
    this._lastK = undefined;
  }

  update() {
    // 性能优化：只有批数 K 变化（shader 里 uShadows[K] 数组长度变）才重建 ShaderPass，
    // 否则只更新 uniform 引用（shadowTextures 数组引用不变，three 自动上传新内容）。
    const k = this.shadowTextures.length;
    if (this._lastK !== k) {
      this.composer.removePass(this.shaderPass);
      this.shaderPass = new ShaderPass(this.material());
      this.shaderPass.renderToScreen = true;
      this.composer.addPass(this.shaderPass);
      this._lastK = k;
    }
  }

  /**
   * @returns {ShaderMaterial}
   */
  material() {
    // 0.172 颜色管理下 BlendRender 上屏颜色处理：
    // 视频融合开启后，VideoSceneViewerManager.cancelRenderLoop() 停掉主渲染循环，
    // 画面完全由 BlendRender 的 EffectComposer 渲染。composer RT 为 Linear，
    // RenderPass 渲染场景到 RT 时 renderer.toneMapping 不生效（仅直接渲染到屏幕才生效），
    // 故场景是 linear 未 tone map 的 HDR 值。末尾须补 tonemapping_fragment(ACES)
    // + colorspace_fragment(linear->sRGB)，否则场景偏暗、HDR 高光区发白。
    // Sky 等场景材质在 RT 路径下未做 tone map，此处做一次是正确的（非双重压暗）。
    return new ShaderMaterial({
      toneMapped: false,
      uniforms: {
        tDiffuse: { value: null },
        uShadows: { value: this.shadowTextures },
        uMixing: { value: this.mixing }
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      // 多批 ColorRender 输出（shadowTextures）按 Porter-Duff over 算子合成后再叠到场景：
      // 各批内已在 ColorRender 片元里 over 合成好了，这里只把 K 批结果再 over 一次。
      // over 结合律保证：分批合成 ≡ 单批全 N 路 over 合成，画面零差异。
      // 合成后的视频层用 alpha 作 mix 权重叠到场景色（uMixing 控制融合强度）。
      fragmentShader: ((k) => {
        const src = [
          'uniform sampler2D tDiffuse;',
          `uniform sampler2D uShadows[${k}];`,
          'uniform float     uMixing;',
          'varying vec2      vUv;',
          'void main() {',
          '  gl_FragColor = texture2D(tDiffuse, vUv);',
          '  vec4 color = vec4(0.0, 0.0, 0.0, 0.0);'
        ];
        for (let i = 0; i < k; i++) {
          src.push(
            '  '.concat(
              `vec4 layer${i} = texture2D(uShadows[${i}], vUv);`,
              `  float a${i} = clamp(layer${i}.a, 0.0, 1.0);`,
              `  color.rgb = layer${i}.rgb * a${i} + color.rgb * (1.0 - a${i});`,
              `  color.a = a${i} + color.a * (1.0 - a${i});`
            )
          );
        }
        src.push(
          '  if (color.a > 0.0) {',
          '    float _mix = color.a;',
          '    gl_FragColor = vec4(mix(gl_FragColor.rgb, color.rgb, _mix * uMixing), gl_FragColor.a);',
          '  }',
          '  #include <tonemapping_fragment>',
          '  #include <colorspace_fragment>',
          '}'
        );
        return src.join('\n');
      })(Math.max(1, this.shadowTextures.length))
      // depthWrite: false
    });
  }
}

export { BlendRender };
