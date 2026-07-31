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
  Vector4,
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
     * 原始视频流地址（初始化时从配置 item.video.stream 存一份）。
     * 导出配置时用，避免从 video.src 读（运行时可能被浏览器规范化成绝对 URL，且
     * addCamera 路径会清空 video.src）。poster 同理。
     * @type {string}
     */
    this.stream = '';
    this.poster = '';

    /**
     * 是否参与视频投影。false 时该路投影矩阵置零（不命中视锥=贡献0=隐藏），
     * 不重建 shader，实时切换可见性。
     * @type {boolean}
     */
    this.visible = true;

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

    /**
     * 鱼眼/广角畸变校正参数（Brown 径向多项式）。
     * @type {{ enabled: boolean, k1: number, k2: number, cx: number, cy: number, scale: number }}
     * - enabled：是否启用畸变校正。false 时返回全 0 uniform，shader 恒等映射，零行为变化。
     * - k1/k2：径向畸变系数。枪机广角桶形畸变通常 k1>0（把弯曲采样点向中心拉，显示上拉直直线）。
     * - cx/cy：畸变中心相对纹理中心的偏移，归一化 [-1,1]，纹理中心为 0。多数镜头 ≈0。
     * - scale：整体缩放。>1 放大采样区把边缘拉进画面，<1 缩小。默认 1。
     * 配置示例：distortion: { enabled: true, k1: 0.15, k2: 0, cx: 0, cy: 0, scale: 1 }
     */
    this.distortion = { enabled: false, k1: 0, k2: 0, cx: 0, cy: 0, scale: 1 };

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
        // ── 颜色管理契约（勿动 colorSpace）──────────────────────────────
        // 此处【故意不设】 this.texture.colorSpace，保持默认 NoColorSpace。
        // 视频帧像素本身就是 sRGB 字节，NoColorSpace 让 three 在采样时不解码，
        // ColorRender 片元直接拿到 sRGB 原始字节写入 RT；再由 ColorRender 的
        // renderTarget 标记 SRGBColorSpace，BlendRender 采样该 RT 时由硬件
        // 自动做一次 sRGB→linear 解码。整条链路正好【一次解码】，颜色正确。
        //
        // 若给此处设 colorSpace = SRGBColorSpace，则采样 VideoTexture 时先解码一次，
        // 写入 SRGB RT 后 BlendRender 采样又解码一次 → 【双重解码】→ 画面整体偏暗、
        // 视频边缘淡出带发灰（与“alpha 平方”灰底叠加后尤其明显）。
        // 故：无论 three 版本如何变化，此处 colorSpace 必须保持 NoColorSpace。
        // 同理 poster 静态纹理（VideoSceneViewer.initialize 里 TextureLoader.load）也
        // 走默认 SRGBColorSpace，但因 poster 仅是加载前占位、视频就绪后即被替换，
        // 其解码路径不影响实际融合画面。

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
   *
   * quadCorners[i] 语义：投影角 i 处应采样视频纹理的 UV（"投影角 -> 视频 UV"对应关系）。
   * computeQuadHomographyElements(corners, 'sample') 求出的是正向 H_s：
   *   H_s · 投影角i = corners[i]   （即 H_s·fragCoord = 采样位置）
   *
   * 但 ColorRender 片元用的是【逆向】采样才符合"拖 pin 同向变形"的直觉（MadMapper 式）：
   *   warpedUV = H_s⁻¹ · fragCoord  ⟺  视频角 i 出现在投影角 corners[i] 处
   *   → pin 往右上拖，视频对应角也往右上走（同向）。
   * 若直接用正向 H_s，投影角采样的是 corners[i] 处的视频，pin 右上拖反而把视频右上方内容
   * 拉到投影左下 → 视频内容【反向】移动（即圆点方向正常、视频变形反向的 bug）。
   *
   * 故此处固定返回 H_s.invert()。显式传 'sample' 给 computeQuadHomographyElements，
   * 绕过其 window.__HOMO_DIR 分支——该开关的 'pin' 分支会先求 H_s⁻¹ 再被这里的 .invert()
   * 抵消回 H_s，等于失效，保留只会制造"拨了开关却不变"的困惑。
   *
   * @returns {Matrix3}
   */
  calcQuadHomography() {
    const elements = computeQuadHomographyElements(this.quadCorners, 'sample');
    const H = new Matrix3().fromArray(elements);
    return H.invert();
  }

  /**
   * 计算畸变校正 uniform，供 ColorRender 片元着色器 uDistortion[i] / uDistortion2[i] 使用。
   * 返回 { vec4: Vector4(k1,k2,cx,cy), scaleVec: Vector4(scale,0,0,0) }。
   * 用两个 vec4 数组承载，避开 GLSL ES 1.0 下独立 float 数组声明在某些驱动上的编译问题。
   * enabled=false 或全 0 时返回零 Vector4 + scale 1，shader applyDistortion 恒等退化。
   * 每帧调一次（updateCameraData 里），返回新对象避免 three 缓存旧引用。
   * @returns {{ vec4: Vector4, scaleVec: Vector4 }}
   */
  calcDistortionUniforms() {
    const d = this.distortion;
    if (!d || !d.enabled) {
      return { vec4: new Vector4(0, 0, 0, 0), scaleVec: new Vector4(1, 0, 0, 0) };
    }
    return {
      vec4: new Vector4(d.k1 || 0, d.k2 || 0, d.cx || 0, d.cy || 0),
      scaleVec: new Vector4(d.scale == null ? 1 : d.scale, 0, 0, 0)
    };
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
