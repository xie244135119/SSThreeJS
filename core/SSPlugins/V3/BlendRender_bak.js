import * as THREE from 'three';

import { RawShaderMaterial } from 'three';
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
     * @type {number}
     */
    this.mixing = 1;

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
    this.composer.renderTarget1.texture.encoding = THREE.sRGBEncoding;
    this.composer.renderTarget2.texture.encoding = THREE.sRGBEncoding;

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
   * @returns {RawShaderMaterial}
   */
  material() {
    return new RawShaderMaterial({
      uniforms: {
        tDiffuse: {
          value: null
        },
        uShadow: {
          value: this.shadow
        },
        uMixing: {
          value: this.mixing
        }
      },
      vertexShader: [
        'attribute vec3 position;',
        'attribute vec2 uv;',
        'uniform   mat4 modelViewMatrix;',
        'uniform   mat4 projectionMatrix;',
        'varying   vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;',
        'uniform sampler2D tDiffuse;',
        'uniform sampler2D uShadow;',
        'uniform float     uMixing;',
        'varying vec2      vUv;',
        'void main() {',
        '  gl_FragColor = texture2D(tDiffuse, vUv);',
        '  vec4 color   = texture2D(uShadow, vUv);',
        '  if (color.a > 0.0) {',
        '     gl_FragColor = vec4(mix(gl_FragColor.rgb, color.rgb, uMixing), gl_FragColor.a);',
        '  }',
        '}'
      ].join('\n')
    });
  }
}

export { BlendRender };
