/*
 * @Author: Kayson.Wan
 * @Date: 2022-11-18 10:02:10
 * @LastEditors: Kayson.Wan
 * @LastEditTime: 2022-11-18 10:02:11
 * @Description:
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
 * @class ColorRender
 * @author Conor.Yang
 */
class ColorRender extends RenderStep {
  /**
     * @constructor
     * @param {WebGLRenderer} renderer
     * @param {Camera} camera
     * @param {Scene} scene
     */
  constructor(renderer, camera, scene) {
    super(renderer, camera, scene);

    /**
         * @type {Matrix4[] 投影矩阵*视图矩阵}
         */
    this.projScreenMatrixArray = [];

    /**
         * @type {Texture[]}
         */
    this.depthTextureArray = [];

    /**
         * @type {Texture[]}
         */
    this.videoTextureArray = [];

    /**
         * @type {Texture[]}
         */
    this.bgTexture = null;
  }

  initialize() {
    this.renderPass = new RenderPass(this.scene, this.camera, this.material());

    const screen = new Vector2();
    this.renderer.getSize(screen);
    // console.log("screen:", { width: screen.width, height: screen.height });
    this.renderTarget = new WebGLRenderTarget(screen.width, screen.height, {
      magFilter: LinearFilter,
      minFilter: LinearFilter,
      format: RGBAFormat
    });

    // this.renderTarget.viewport = new Vector4(0, 0, screen.width, screen.height);
    this.renderTarget.encoding = THREE.sRGBEncoding;
  }

  update() {
    this.renderPass.overrideMaterial = this.material();
  }

  render() {
    // console.log("ColorRender.render...");
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
      uniforms: {
        uProjScreenMatrix: {
          value: this.projScreenMatrixArray
        },
        uDepthTexture: {
          value: this.depthTextureArray
        },
        uVideoTexture: {
          value: this.videoTextureArray
        },
        uBgTexture: {
          value: this.bgTexture
        }
      },
      vertexShader: ((n) => {
        const src = [
          'attribute vec3 position;',
          'uniform   mat4 modelMatrix;',
          'uniform   mat4 modelViewMatrix;',
          'uniform   mat4 projectionMatrix;',
          `uniform   mat4 uProjScreenMatrix[${n}];`,
          `varying   vec4 uProjScreenPosition[${n}];`,
          'void main() {',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);'
        ];
        for (let i = 0; i < n; i++) {
          src.push(
            '  '.concat(
              `uProjScreenPosition[${i}] `,
              `= uProjScreenMatrix[${i}] `,
              '* modelMatrix * vec4(position, 1.0);'
            )
          );
        }
        src.push('}');
        // console.log("ColorRender.vertex-shader:", src.join("\n"));
        return src.join('\n');
      })(this.depthTextureArray.length),
      fragmentShader: ((n) => {
        const src = [
          'precision mediump float;',
          'uniform sampler2D uBgTexture;',
          `uniform sampler2D uDepthTexture[${n}];`,
          `uniform sampler2D uVideoTexture[${n}];`,
          `varying vec4      uProjScreenPosition[${n}];`,
          'float decode(const in vec4 color) {',
          '    const vec4 a = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));',
          '    float  value = dot(color, a);',
          '    return value;',
          '}',
          'vec4 visible(const in sampler2D tex, const in sampler2D img, const in vec4 position , const in sampler2D bgimg) {',
          '    vec3 fragCoord = (position.xyz / position.w) / 2.0 + 0.5;',
          '    if (fragCoord.x >= 0.0 && fragCoord.y >= 0.0 && fragCoord.z >= 0.0 &&',
          '        fragCoord.x <= 1.0 && fragCoord.y <= 1.0 && fragCoord.z <= 1.0) {',
          '        vec4  color = texture2D(tex, fragCoord.xy);',
          '        float depth = decode(color);',
          '        if (fragCoord.z < depth + 0.0015) {',
          '          vec4 vc = texture2D(img, fragCoord.xy);',
          '          vec4 bg = texture2D(bgimg, fragCoord.xy);',
          '          return vec4( vc.rgb , bg.a);',
          // '          return vec4( vc.rgba* bg.rgba);',
          // '          return vec4(vc.rgb, 1.0);',
          '        }',
          '    }',
          '    return vec4(0.0, 0.0, 0.0, 0.0);',
          '}',
          'void main() {',
          '  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);',
          '  vec4 color = vec4(0.0, 0.0, 0.0, 0.0);'
        ];
        for (let i = 0; i < n; i++) {
          src.push(
            '  '.concat(
              'color += visible(',
              `uDepthTexture[${i}], `,
              `uVideoTexture[${i}], `,
              `uProjScreenPosition[${i}],`,
              'uBgTexture);'
            )
          );
        }
        src.push(
          '  if (color.a > 0.0) {',
          `  float count = float(${n});`,
          '     gl_FragColor = vec4(color.rgba );',
          // '     gl_FragColor = vec4(color.rgb / count, color.a );',
          // '     gl_FragColor = vec4(color.rgb / count, color.a / count );',
          // '     gl_FragColor = vec4(color.rgb / color.a, 1.0 );',
          '  }',
          '  else{ gl_FragColor = vec4(0.,0.,0.,0.);}',
          '}'
        );
        // console.log("ColorRender.fragment-shader:", src.join("\n"));
        return src.join('\n');
      })(this.depthTextureArray.length)
      // depthWrite: false
    });
  }

  /**
     * @returns {Texture}
     */
  texture() {
    return this.renderTarget.texture;
  }
}

export { ColorRender };
