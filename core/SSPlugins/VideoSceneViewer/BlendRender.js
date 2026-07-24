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
     * @type {Texture}
     */
    this.shadow = null;

    /**
     * @type {Texture}
     */
    this.diffuse = null;

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
    this.composer.render();
  }

  update() {
    this.composer.removePass(this.shaderPass);

    this.shaderPass = new ShaderPass(this.material());
    this.shaderPass.renderToScreen = true;

    this.composer.addPass(this.shaderPass);
  }

  render() {
    // console.log("BlendRender.render...");
    this.composer.render();
  }

  /**
   * @returns {ShaderMaterial}
   */
  material() {
    // 0.172 颜色管理默认开启后，原 RawShaderMaterial 不注入 colorspace chunk，
    // 导致上屏缺 linear->sRGB 编码，画面发暗发黑。改用 ShaderMaterial：
    // 末尾由内置 chunk 自动做 linear->sRGB 颜色编码。
    // 注意 toneMapped=false：不在 BlendRender 内做 tone mapping。
    // 0.172 渲染到 RT 时 renderer.toneMapping 本就不生效（仅直接渲染到屏幕才生效），
    // 场景材质写入 tDiffuse 时是 linear（未 tone map）。tone mapping 统一由外层
    // PostProcessPlugin 的 ToneMappingEffect 在更外层完成（见 scene.tsx postSetting）。
    // 此处若加 tonemapping_fragment 会对已 tone map 的 Sky 二次压暗。
    return new ShaderMaterial({
      toneMapped: false,
      uniforms: {
        tDiffuse: { value: null },
        uShadow: { value: this.shadow },
        uMixing: { value: this.mixing }
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D tDiffuse;',
        'uniform sampler2D uShadow;',
        'uniform float     uMixing;',
        'varying vec2      vUv;',
        'void main() {',
        '  gl_FragColor = texture2D(tDiffuse, vUv);',
        '  float _mix;',
        '  vec4 color = texture2D(uShadow, vUv);',
        '  if (color.a > 0.0) {',
        '    _mix = color.a;',
        '    gl_FragColor = vec4(mix(gl_FragColor.rgb, color.rgb, _mix * uMixing), gl_FragColor.a);',
        '  }',
        // 0.172：composer 内部全程 linear，上屏统一做 linear->sRGB 编码。
        '  #include <colorspace_fragment>',
        '}'
      ].join('\n')
      // depthWrite: false
    });
  }
}

export { BlendRender };
