/*
 * @Author: Kayson.Wan
 * @Date: 2022-11-18 10:02:10
 * LastEditors  Kayson.Wan
 * LastEditTime  2025-11-04 09:37:30
 * @Description:
 */
import * as THREE from 'three';
import {
  LinearFilter,
  Matrix3,
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

    /**
     * @type {Matrix3[]} 每路视频一个 Homography（投影 UV -> 视频 UV），用于四点透视校正。
     */
    this.quadHomographyArray = [];
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
    // ColorRender 用 RawShaderMaterial 写入视频的 sRGB 字节（不注入编码转换）。
    // RT 标为 sRGB：纹理内部格式 SRGB8_ALPHA8，BlendRender(ShaderMaterial) 采样时
    // 由硬件自动做 sRGB->linear 解码，得到正确的 linear 视频色参与混合。
    // 若标 Linear 会跳过解码，sRGB 字节被当 linear -> 视频偏亮、投影边缘出现白边。
    this.renderTarget.colorSpace = THREE.SRGBColorSpace;
  }

  update() {
    // 释放上一份 overrideMaterial，避免反复 update 累积 RawShaderMaterial(GPU program)
    this.renderPass.overrideMaterial?.dispose?.();
    this.renderPass.overrideMaterial = this.material();
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
  }

  render() {
    // console.log("ColorRender.render...");
    const state = {
      background: this.scene.background,
      shadowMapEnabled: this.renderer.shadowMap.enabled,
      clearAlpha: this.renderer.getClearAlpha()
    };
    this.scene.background = null;
    this.renderer.shadowMap.enabled = false;
    // 0.172：渲染到 RT 时默认按 clearAlpha=1 清屏，导致 ColorRender 输出的 (0,0,0,0)（无投影）
    // 被不透明黑色覆盖，uShadow 在非投影区 alpha=1，BlendRender 中 color.a>0 误判，
    // 把未投影的 Sky 等背景区域 mix 成黑色。故清屏 alpha 设为 0（透明清屏），
    // 让无投影区保持 alpha=0，BlendRender 才不会误覆盖背景。
    this.renderer.setClearAlpha(0);
    this.renderPass.render(this.renderer, null, this.renderTarget);
    this.scene.background = state.background;
    this.renderer.shadowMap.enabled = state.shadowMapEnabled;
    this.renderer.setClearAlpha(state.clearAlpha);
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
        },
        // 四点透视校正 Homography（投影 UV -> 视频 UV），每路视频一个 Matrix3。
        uQuadHomography: {
          value: this.quadHomographyArray
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
          `uniform mat3      uQuadHomography[${n}];`,
          `varying vec4      uProjScreenPosition[${n}];`,
          'float decode(const in vec4 color) {',
          '    const vec4 a = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));',
          '    float  value = dot(color, a);',
          '    return value;',
          '}',
          'vec4 visible(const in sampler2D tex, const in sampler2D img, const in vec4 position , const in sampler2D bgimg, const in mat3 homog) {',
          '    vec3 fragCoord = (position.xyz / position.w) / 2.0 + 0.5;',
          '    if (fragCoord.x >= 0.0 && fragCoord.y >= 0.0 && fragCoord.z >= 0.0 &&',
          '        fragCoord.x <= 1.0 && fragCoord.y <= 1.0 && fragCoord.z <= 1.0) {',
          '        vec4  color = texture2D(tex, fragCoord.xy);',
          '        float depth = decode(color);',
          '        if (fragCoord.z < depth + 0.0015) {',
          // 四点透视校正：用 Homography 把投影 UV(fragCoord.xy) 变换到视频纹理 UV。
          // 默认 quadCorners 为单位正方形时 H=I，warpedUV=fragCoord.xy，行为与改造前一致。
          // bg(VideoMask) 同步用 warpedUV 采样，让圆形虚化遮罩跟随校正后的视频区域。
          '          vec3 hw = homog * vec3(fragCoord.xy, 1.0);',
          '          vec2 warpedUV = hw.xy / hw.z;',
          '          if (warpedUV.x < 0.0 || warpedUV.x > 1.0 || warpedUV.y < 0.0 || warpedUV.y > 1.0) {',
          '            return vec4(0.0, 0.0, 0.0, 0.0);',
          '          }',
          '          vec4 vc = texture2D(img, warpedUV);',
          '          vec4 bg = texture2D(bgimg, warpedUV);',
          // 白边根因：投影区是视频相机视锥的矩形投影，边界处 alpha 从 VideoMask 高值
          // 突变到 0(矩形外不命中)，形成锐角矩形描边(视频边缘色)。
          // 在矩形边界 0~0.04 内对 bg.a 做 smoothstep 衰减，让边界 alpha 平滑淡出，
          // 消除锐角白边；内圈 VideoMask 圆形虚化保留。edge = 距 [0,1] 四边的最近距离。
          '          vec2 ed = min(fragCoord.xy, 1.0 - fragCoord.xy);',
          '          float edge = min(ed.x, ed.y);',
          '          float fade = smoothstep(0.0, 0.04, edge);',
          '          return vec4( vc.rgb , bg.a * fade);',
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
              'vec4 layer',
              `${i}`,
              ' = visible(',
              `uDepthTexture[${i}], `,
              `uVideoTexture[${i}], `,
              `uProjScreenPosition[${i}],`,
              'uBgTexture,',
              `uQuadHomography[${i}]);`,
              // 多路视频重叠：用 Porter-Duff over 算子按 alpha 加权合成，而非 RGB 直接相加。
              // 直接相加会让重叠区 RGB 相加 >1 过曝变亮；over 合成 = 前景*前景a + 背景*(1-前景a)，
              // 重叠区取最上层视频色，alpha 不会超过 1，亮度正常。
              `  float a${i} = clamp(layer${i}.a, 0.0, 1.0);`,
              `  color.rgb = layer${i}.rgb * a${i} + color.rgb * (1.0 - a${i});`,
              `  color.a = a${i} + color.a * (1.0 - a${i});`
            )
          );
        }
        src.push(
          '  if (color.a > 0.0) {',
          '     gl_FragColor = vec4(color.rgba);',
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
