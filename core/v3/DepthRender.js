/*
 * @Date: 2022-03-24 19:35:53
 * @LastEditors: Kayson.Wan
 * @LastEditTime: 2022-03-25 19:23:11
 * @FilePath: /isop-portal/src/js/ThreeJs/v3/DepthRender.js
 */
import * as THREE from 'three';
import { LinearFilter, RawShaderMaterial, RGBAFormat, Vector2, Vector4, WebGLRenderTarget } from 'three';
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
    this.renderTarget.encoding = THREE.sRGBEncoding;
  }

  render() {
    // console.log("DepthRender.render...");
    const state = {
      background: this.scene.background,
      shadowMapEnabled: this.renderer.shadowMap.enabled
    };
    this.scene.background = null;
    this.renderer.shadowMap.enabled = false;
    this.renderPass.render(this.renderer, null, this.renderTarget);
    this.scene.background = state.background;
    this.renderer.shadowMap.enabled = state.shadowMapEnabled;
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
