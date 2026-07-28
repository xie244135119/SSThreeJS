/*
 * computeQuadHomographyElements
 * 由四组对应点求解 3x3 Homography 单应矩阵的 9 个元素。
 *
 * 两种映射模型（由 mode 参数选择，运行时可用 window.__HOMO_DIR 切换实机测试）：
 *
 * mode = 'sample'（采样模型，原 vid3d 语义）：
 *   源 = 投影矩形角(SRC)，目标 = corners(视频角)。
 *   H · SRC = corners  =>  H · fragCoord = warpedUV(采样位置)。
 *   shader: warpedUV = H · fragCoord。
 *
 * mode = 'pin'（pin 模型，MadMapper 式，拖角点同方向变形）：
 *   源 = corners(视频角)，目标 = 投影矩形角(SRC)。
 *   H · corners = SRC  =>  视频角点出现在投影矩形角处。
 *   shader 需用逆：warpedUV = H⁻¹ · fragCoord。
 *
 * 返回：长度 9，列主序，可直接喂 THREE.Matrix3.fromArray。
 */

// 8x8 高斯消元解线性方程组 A·x = b，返回长度 8 的解向量。
function solveLinearSystem8(A, b) {
  // 增广矩阵 [A | b]，9 列
  const m = [];
  for (let i = 0; i < 8; i++) {
    m.push(A[i].slice(0, 8));
    m[i].push(b[i]);
  }
  // 前向消元（部分主元）
  for (let col = 0; col < 8; col++) {
    // 选主元
    let pivot = col;
    let maxAbs = Math.abs(m[col][col]);
    for (let r = col + 1; r < 8; r++) {
      const v = Math.abs(m[r][col]);
      if (v > maxAbs) {
        maxAbs = v;
        pivot = r;
      }
    }
    if (maxAbs < 1e-12) {
      // 奇异，返回单位矩阵对应的解（兜底，理论上四点不共线不会触发）
      return null;
    }
    if (pivot !== col) {
      const tmp = m[pivot];
      m[pivot] = m[col];
      m[col] = tmp;
    }
    // 消元
    const pivVal = m[col][col];
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const factor = m[r][col] / pivVal;
      if (factor === 0) continue;
      for (let c = col; c < 9; c++) {
        m[r][c] -= factor * m[col][c];
      }
    }
  }
  // 回代（此时已是对角阵）
  const x = new Array(8);
  for (let i = 0; i < 8; i++) {
    x[i] = m[i][8] / m[i][i];
  }
  return x;
}

// 源四角（投影 UV 空间，固定为单位正方形四角，顺序与 corners 对齐）：
// 左下 [0,0]、右下 [1,0]、右上 [1,1]、左上 [0,1]
const SRC = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1]
];

/**
 * @param {number[][]} corners 四角 [[x0,y0],...]，顺序左下/右下/右上/左上，坐标域[0,1]
 * @param {'sample'|'pin'} [mode] 映射模型，缺省读 window.__HOMO_DIR，再缺省 'sample'
 * @returns {number[]} 长度 9，列主序
 */
export function computeQuadHomographyElements(corners, mode) {
  const dir = mode || (typeof window !== 'undefined' && window.__HOMO_DIR) || 'sample';
  // sample: 源=SRC(投影角), 目标=corners(视频角)  => H·fragCoord=采样位置，shader 正用 H
  // pin:    源=corners(视频角), 目标=SRC(投影角) => 视频角出现在投影角处，shader 用 H⁻¹
  const src = dir === 'pin' ? corners : SRC;
  const dst = dir === 'pin' ? SRC : corners;
  // 构建 8x8 方程组，求 h0..h7（h8 = 1）
  // 对每组对应点 (x,y) -> (u,v)：
  //   h0*x + h1*y + h2        - h6*x*u - h7*y*u = u
  //                h3*x + h4*y + h5 - h6*x*v - h7*y*v = v
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }
  const h = solveLinearSystem8(A, b);
  if (!h) {
    // 兜底：单位矩阵列主序
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }
  const h0 = h[0];
  const h1 = h[1];
  const h2 = h[2];
  const h3 = h[3];
  const h4 = h[4];
  const h5 = h[5];
  const h6 = h[6];
  const h7 = h[7];
  const h8 = 1;
  // 3x3 行主序：
  //   [ h0 h1 h2 ]
  //   [ h3 h4 h5 ]
  //   [ h6 h7 h8 ]
  // three.js Matrix3.fromArray 取列主序：列优先
  //   [ h0, h3, h6,  h1, h4, h7,  h2, h5, h8 ]
  return [h0, h3, h6, h1, h4, h7, h2, h5, h8];
}

export default computeQuadHomographyElements;
