import {
  CameraHelper,
  ClampToEdgeWrapping,
  EventDispatcher,
  LinearFilter,
  Matrix3,
  Matrix4,
  PerspectiveCamera,
  RGBAFormat,
  Texture,
  TextureLoader,
  VideoTexture
} from 'three';
import { computeQuadHomographyElements } from './computeQuadHomographyElements';

/**
 * @class BlendRender
 * @author Conor.Yang
 */
class VideoCamera extends EventDispatcher {
  static TEXTURE_UPDATED = 'textureUpdated';

  constructor() {
    super();

    /**
     * @type {PerspectiveCamera}
     */
    this.camera = new PerspectiveCamera(15, 1.0, 0.1, 1000);

    /**
     * @type {CameraHelper}
     */
    this.helper = new CameraHelper(this.camera);

    /**
     * @type {Texture | VideoTexture | CanvasText}
     */
    this.texture = new Texture();
    // this.texture = new TextureLoader().load(require('./icon2.png').default);

    /**
     * @type {HTMLVideoElement}
     */
    this.video = document.createElement('video');

    /**
     * 四点透视校正角点（quadCorners），移植自 vid3d-projection。
     * 顺序：[左下, 右下, 右上, 左上]，每项 [x, y]，坐标域 [0,1]。
     * 语义：目标点 = 视频纹理 UV，源点 = 投影 UV（片元 fragCoord.xy）。
     * 默认单位正方形 => Homography 为单位矩阵，warpedUV = uv，行为与改造前一致。
     * 配置示例：item.camera.quadCorners = [[0,0],[1,0],[1,1],[0,1]]
     */
    this.quadCorners = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ];

    this.video.crossOrigin = 'anonymous'; // anonymous、use-credentials
    this.video.autoplay = true;
    this.video.preload = 'auto'; // none、metadata、auto
    this.video.muted = true;
    this.video.loop = true;
    // if ("requestVideoFrameCallback" in this.video) {
    //   console.log("video.requestVideoFrameCallback() ok");
    // }

    this.video.addEventListener(
      'play',
      () => {
        // console.log('play...', event);
      },
      false
    );
    this.video.addEventListener(
      'pause',
      () => {
        // console.log('pause...', event);
      },
      false
    );
    this.video.addEventListener(
      'playing',
      () => {
        // console.log('playing...', event);
      },
      false
    );
    this.video.addEventListener(
      'canplay',
      () => {
        // console.log('canplay...', event);
        this.video.play().then().catch();
      },
      false
    );
    this.video.addEventListener(
      'canplaythrough',
      () => {
        // console.log('canplaythrough...', event);
        // 释放上一份 poster 静态纹理，避免反复开关融合累积泄漏
        this.texture?.dispose?.();
        this.texture = new VideoTexture(this.video);
        this.texture.wrapS = ClampToEdgeWrapping;
        this.texture.wrapT = ClampToEdgeWrapping;
        this.texture.minFilter = LinearFilter;
        this.texture.magFilter = LinearFilter;
        this.texture.format = RGBAFormat;
        this.texture.needsUpdate = true;

        this.dispatchEvent({
          type: VideoCamera.TEXTURE_UPDATED,
          texture: this.texture
        });
      },
      false
    );
  }

  /**
   * 释放资源：texture(含 poster 与 canplaythrough 后的 VideoTexture)、helper、video 元素。
   * 反复开关融合时，每个 VideoCamera 不 dispose 会累积 video 元素、纹理、CameraHelper 资源。
   */
  dispose() {
    // 释放纹理（poster 或 VideoTexture，两者都通过 this.texture 引用）
    this.texture?.dispose?.();
    this.texture = null;
    // 释放 CameraHelper（LineSegments：geometry + material）
    this.helper?.dispose?.();
    // PerspectiveCamera 无显式 dispose，置空即可
    this.camera = null;
    // 停止并清理 video 元素：removeAttribute('src') + load() 中断解码释放网络/解码资源，
    // DOM 事件监听随 video 置空失去引用而被 GC 回收
    if (this.video) {
      try {
        this.video.pause();
      } catch (e) {}
      try {
        this.video.removeAttribute('src');
        this.video.load();
      } catch (e) {}
      this.video = null;
    }
  }

  /**
   * 由当前 quadCorners 计算 3x3 Homography 矩阵，供 ColorRender 片元着色器采样。
   * 模型由 window.__HOMO_DIR 控制（实机测试用）：
   *   'sample'(默认)：H·fragCoord=采样位置，直接返回 H。
   *   'pin'：视频角出现在投影角处，shader 用 H⁻¹，这里返回 H.invert()。
   * @returns {Matrix3}
   */
  calcQuadHomography() {
    const dir = (typeof window !== 'undefined' && window.__HOMO_DIR) || 'sample';
    const elements = computeQuadHomographyElements(this.quadCorners);
    const H = new Matrix3().fromArray(elements);
    return dir === 'pin' ? H.invert() : H;
  }

  /**
   * @returns {Matrix4}
   */
  calcProjScreenMatrix() {
    const matrix = new Matrix4();
    this.camera.updateMatrixWorld(true);
    this.camera.updateProjectionMatrix();
    matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    return matrix;
  }
}

export { VideoCamera };
