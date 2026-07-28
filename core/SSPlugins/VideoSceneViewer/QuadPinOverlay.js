/*
 * QuadPinOverlay
 * 画面上拖角点的 quadCorners 可视化调试 overlay。
 *
 * 在主画面上叠加一个 2D 四边形：4 个可拖圆点 + 连线框。
 * 拖圆点改 quadCorners（投影 UV -> 视频 UV 的四角），视频采样实时透视变形。
 * 初始四角 = 投影相机视锥四角在屏幕上的投影（用 camera.unproject 反算世界点再 project 到主相机屏幕），
 * 作为 [0,1] 的参考矩形（左下 0,0 / 右下 1,0 / 右上 1,1 / 左上 0,1）。
 *
 * 渲染：独立 OrthographicCamera + 透明 Scene，由 VideoSceneViewer.render() 末尾
 * （BlendRender 上屏之后）调 renderOverlay() 直渲屏幕叠加。
 *
 * 交互：pointer 事件，命中圆点（屏幕距离阈值）进入拖拽，move 更新该角，
 * 屏幕坐标 -> quadCorners 值：相对参考矩形四角的归一化（按对角线双线性近似）。
 */
import {
  CircleGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector2,
  Vector3
} from 'three';

// 四角索引顺序与 quadCorners 一致：0=左下 1=右下 2=右上 3=左上
const CORNER_NDC = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1]
];

class QuadPinOverlay {
  /**
   * @param {WebGLRenderer} renderer
   * @param {HTMLElement} domElement renderer.domElement，用于挂 pointer 事件
   */
  constructor(renderer, domElement) {
    this.renderer = renderer;
    this.domElement = domElement;

    this.scene = new Scene();
    // 用 NDC 空间相机：正交相机 frustum 设为 [-1,1]^3，直接用 NDC 坐标定位
    this.camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);

    // 参考矩形四角的屏幕像素坐标（视锥角点投影到屏幕），作为 [0,1] 的参照
    // 初始为单位正方形占满屏幕（占位，setCorners 时会被覆盖）
    this._refScreenCorners = [
      new Vector2(0, 0),
      new Vector2(1, 0),
      new Vector2(1, 1),
      new Vector2(0, 1)
    ];

    // 4 个角点当前的 quadCorners 值（[0,1]×2）
    this._quad = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ];

    // 画布像素尺寸（含 DPR）
    this._size = new Vector2(1, 1);

    // 圆点 + 连线
    this._pinMeshes = [];
    this._lineLoop = null;
    this._buildObjects();

    this._visible = false;
    this._draggingIndex = -1;

    // 绑定方法，便于 removeEventListener
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    this._enabled = false;
  }

  _buildObjects() {
    // 连线框：动态 positions，初始全 0，_updateObjects 里刷新
    const lineMat = new LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false
    });
    this._lineMat = lineMat;
    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute('position', new Float32BufferAttribute(new Float32Array(12), 3));
    this._lineLoop = new LineLoop(lineGeo, lineMat);
    this._lineLoop.frustumCulled = false;
    this._lineLoop.renderOrder = 999;
    this.scene.add(this._lineLoop);

    // 4 个圆点（共享 geometry，各自 material 以便单独高亮）
    const pinGeo = new CircleGeometry(0.025, 24);
    for (let i = 0; i < 4; i++) {
      const mat = new MeshBasicMaterial({
        color: 0xffd400,
        transparent: true,
        opacity: 1.0,
        depthTest: false,
        depthWrite: false
      });
      const mesh = new Mesh(pinGeo, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 1000;
      mesh.userData.cornerIndex = i;
      this._pinMeshes.push(mesh);
      this.scene.add(mesh);
    }
  }

  // （保留旧方法名占位，避免外部引用报错；逻辑已并入 _buildObjects）
  _buildLineGeometry() {
    return this._lineLoop ? this._lineLoop.geometry : null;
  }

  /**
   * 设置参考四角（投影相机视锥四角的屏幕像素坐标）与初始 quadCorners。
   * @param {Vector2[]} screenCorners 4 个屏幕像素坐标（左下/右下/右上/左上，y 轴向下为正，屏幕像素）
   * @param {number[][]} quadCorners 4 个 [x,y] ∈ [0,1]
   */
  setCorners(screenCorners, quadCorners) {
    if (screenCorners) {
      this._refScreenCorners = screenCorners.map((p) => new Vector2(p.x, p.y));
    }
    if (quadCorners) {
      this._quad = quadCorners.map((q) => [q[0], q[1]]);
    }
    this._updateObjects();
  }

  /**
   * 用新 quadCorners 更新（GUI 滑条改动时调用，单向刷新 overlay 位置）。
   * @param {number[][]} quadCorners
   */
  setQuad(quadCorners) {
    this._quad = quadCorners.map((q) => [q[0], q[1]]);
    this._updateObjects();
  }

  // 把 quadCorners 值映射到屏幕像素坐标：参考四角构成的双线性插值
  // quad=[x,y] 在 [0,1]，x 沿 左下->右下 方向，y 沿 左下->左上 方向
  _quadToScreen(x, y) {
    const [bl, br, tr, tl] = this._refScreenCorners;
    // 双线性：底部边 bl->br 按 x；顶部边 tl->tr 按 x；再按 y 插值
    const bottom = bl.clone().lerp(br, x);
    const top = tl.clone().lerp(tr, x);
    return bottom.lerp(top, y);
  }

  // 屏幕 px -> quad 值：在参考四边形内反求 [0,1]
  // 简单近似：按参考四边形为轴对齐矩形（视锥角点投影通常近似矩形）做归一化；
  // 若拖出框则 clamp。够用于调试。
  _screenToQuad(px, py) {
    const [bl, br, tr, tl] = this._refScreenCorners;
    // 用左下为原点，右下方向为 x 轴，左上方向为 y 轴
    const ex = br.clone().sub(bl); // x 轴向量
    const ey = tl.clone().sub(bl); // y 轴向量
    const v = new Vector2(px - bl.x, py - bl.y);
    // 投影到 ex/ey（近似正交时的归一化）
    const lenX = ex.length() || 1;
    const lenY = ey.length() || 1;
    let x = v.dot(ex.clone().normalize());
    let y = v.dot(ey.clone().normalize());
    x = x / lenX;
    y = y / lenY;
    return [x, y];
  }

  _updateObjects() {
    // 圆点尺寸自适应：以参考框（投影区四角）屏幕短边的一定比例为 pin 像素半径，
    // 远看投影区小时点也小，但有最小下限（10px）保证远也能抓。
    const w = this._size.x || 1;
    const h = this._size.y || 1;
    const [bl, br, tr, tl] = this._refScreenCorners;
    const refW = Math.abs(br.x - bl.x);
    const refH = Math.abs(tl.y - bl.y);
    const refMin = Math.min(refW, refH);
    const pinPx = Math.max(10, refMin * 0.06);
    // pin 原始半径=0.025(NDC)，scale = 目标 NDC 半径 / 0.025
    const pinNDC = (pinPx / w) * 2; // px->NDC 的 x 方向跨度（半径），2 是 [-1,1] 宽度
    const pinScale = pinNDC / 0.025;

    // 圆点位置：_quad 值 -> 屏幕 px -> NDC
    for (let i = 0; i < 4; i++) {
      const screen = this._quadToScreen(this._quad[i][0], this._quad[i][1]);
      const ndc = this._screenToNDC(screen.x, screen.y);
      this._pinMeshes[i].position.set(ndc.x, ndc.y, 0);
      this._pinMeshes[i].scale.setScalar(pinScale);
    }
    // 连线：4 个圆点位置连成环
    const pos = this._lineLoop.geometry.attributes.position;
    for (let i = 0; i < 4; i++) {
      const p = this._pinMeshes[i].position;
      pos.setXYZ(i, p.x, p.y, 0);
    }
    pos.needsUpdate = true;
  }

  // 屏幕 px(原点左上, y向下) -> NDC [-1,1]
  _screenToNDC(px, py) {
    const w = this._size.x || 1;
    const h = this._size.y || 1;
    return new Vector2((px / w) * 2 - 1, -((py / h) * 2 - 1));
  }

  _ndcToScreen(ndcX, ndcY) {
    const w = this._size.x || 1;
    const h = this._size.y || 1;
    return new Vector2(((ndcX + 1) / 2) * w, ((1 - ndcY) / 2) * h);
  }

  _updateSize() {
    this.renderer.getSize(this._size);
  }

  /**
   * 由投影相机 + 主相机计算视锥四角屏幕坐标，作为参考矩形。
   * @param {PerspectiveCamera} projCamera 投影相机
   * @param {PerspectiveCamera} mainCamera 主相机
   */
  updateRefFromFrustum(projCamera, mainCamera) {
    this._updateSize();
    const screenCorners = [];
    const v = new Vector3();
    for (let i = 0; i < 4; i++) {
      // NDC 四角，深度取 1.0（far 平面）：把 pin 摆在投影区靠 far 端，而非贴着相机 near。
      v.set(CORNER_NDC[i][0], CORNER_NDC[i][1], 1.0);
      v.unproject(projCamera); // -> 世界坐标
      v.project(mainCamera); // -> 主相机 NDC [-1,1]
      screenCorners.push(this._ndcToScreen(v.x, v.y));
    }
    this._refScreenCorners = screenCorners;
    this._updateObjects();
  }

  show() {
    if (this._visible) return;
    this._visible = true;
    this._enableEvents(true);
    this._updateSize();
    this._updateObjects();
  }

  hide() {
    this._visible = false;
    this._enableEvents(false);
    this._draggingIndex = -1;
  }

  _enableEvents(on) {
    if (on && !this._enabled) {
      this.domElement.addEventListener('pointerdown', this._onPointerDown);
      window.addEventListener('pointermove', this._onPointerMove);
      window.addEventListener('pointerup', this._onPointerUp);
      this._enabled = true;
    } else if (!on && this._enabled) {
      this.domElement.removeEventListener('pointerdown', this._onPointerDown);
      window.removeEventListener('pointermove', this._onPointerMove);
      window.removeEventListener('pointerup', this._onPointerUp);
      this._enabled = false;
    }
  }

  _getPointerScreen(e) {
    const rect = this.domElement.getBoundingClientRect();
    return new Vector2(e.clientX - rect.left, e.clientY - rect.top);
  }

  _onPointerDown(e) {
    if (!this._visible) return;
    this._updateSize();
    const p = this._getPointerScreen(e);
    // 命中阈值随 pin 像素半径自适应（与 _updateObjects 的 pinPx 公式一致）+ 6px padding
    const [bl, br, tr, tl] = this._refScreenCorners;
    const refMin = Math.min(Math.abs(br.x - bl.x), Math.abs(tl.y - bl.y));
    const pinPx = Math.max(10, refMin * 0.06);
    const threshold = pinPx + 6;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < 4; i++) {
      const sp = this._quadToScreen(this._quad[i][0], this._quad[i][1]);
      const d = sp.distanceTo(p);
      if (d < threshold && d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (best >= 0) {
      this._draggingIndex = best;
      e.preventDefault();
      e.stopPropagation();
    }
  }

  _onPointerMove(e) {
    if (this._draggingIndex < 0) return;
    const p = this._getPointerScreen(e);
    const [x, y] = this._screenToQuad(p.x, p.y);
    // 允许超界（-0.5~1.5），便于调平行四边形/梯形
    this._quad[this._draggingIndex] = [x, y];
    this._updateObjects();
    if (this.onChange) {
      this.onChange(this._quad.map((q) => [q[0], q[1]]));
    }
  }

  _onPointerUp() {
    this._draggingIndex = -1;
  }

  /**
   * 由 VideoSceneViewer.render() 末尾调用，把 overlay 叠到已上屏的画面之上。
   * 关键：renderer.render 默认 autoClear=true 会清掉颜色缓冲，把 BlendRender 刚上屏的
   * 画面清成黑。overlay 圆点/连线均 depthTest:false，无需清色也无需清深度，
   * 故关闭 autoClear，直接在现有画面上叠加绘制。
   */
  renderOverlay() {
    if (!this._visible) return;
    const prevRT = this.renderer.getRenderTarget();
    const prevAutoClear = this.renderer.autoClear;
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = false;
    this.renderer.render(this.scene, this.camera);
    this.renderer.autoClear = prevAutoClear;
    this.renderer.setRenderTarget(prevRT);
  }

  dispose() {
    this.hide();
    this._pinMeshes.forEach((m) => {
      m.geometry?.dispose?.();
      m.material?.dispose?.();
    });
    this._pinMeshes = [];
    this._lineLoop?.geometry?.dispose?.();
    this._lineMat?.dispose?.();
    this._lineLoop = null;
    this.scene = null;
    this.camera = null;
  }
}

export { QuadPinOverlay };
export default QuadPinOverlay;
