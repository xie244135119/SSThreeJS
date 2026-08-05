/*
 * Author  Kayson.Wan
 * Date  2026-08-05 16:30:00
 * Description  PLY 查看器配置：光照(GUI 调试)、后处理、模型参数。
 * baseLighting 结构与 scene.config.js 一致，由 BaseLightSetting 读取初始化
 * 环境光/平行光/阴影/雾/天空盒，并生成 lil-gui 调试面板。
 */
import { BlendFunction, ToneMappingMode } from 'postprocessing';

export default {
  /**
   * 基础光照配置（BaseLightSetting 读取）。
   * 阴影范围/距离按 skull 归一化后 ~10 单位尺寸调小，保证阴影贴图精度。
   * 平行光位置/强度作为主光；环境光作底光。PLY 顶点色 + PBR 在此光照下出层次。
   */
  baseLighting: {
    controllers: { 输出设置: '' },
    folders: {
      环境: { controllers: { tone曝光度: 1, toneMapping: 4 }, folders: {} },
      灯光: {
        controllers: {
          环境光强度: 0.6,
          环境光颜色: '#ffffff',
          启用平行光: true,
          平行光强度: 2.4,
          平行光颜色: '#fffbe5',
          平行光位置x: 8,
          平行光位置y: 14,
          平行光位置z: 10
        },
        folders: {}
      },
      阴影: {
        controllers: {
          接收阴影: true,
          阴影分辨率: 2048,
          阴影范围上下宽度: 20,
          阴影范围左右宽度: 20,
          阴影贴图偏差: -0.0004,
          shadowCamera最远距离: 60,
          shadowCamera最近距离: 1
        },
        folders: {}
      },
      雾: {
        controllers: { 启用雾: false, 雾颜色: '#0a0c10', 雾最近距离: 0, 雾最远距离: 5427 },
        folders: {}
      },
      天空盒: {
        controllers: { 启用背景: false, environment: { none: 'none', blueSky: 'blueSky' } },
        folders: {}
      }
    }
  },

  /**
   * 后处理：SMAA 抗锯齿 + ACES 色调映射 + 轻量 Bloom/晕影，提升画面质感。
   * toneMappingEffect 必需：渲染到 EffectComposer 时 renderer.toneMapping 不生效（见 three 0.172）。
   */
  postSetting: {
    toneMappingEffect: {
      blendFunction: BlendFunction.NORMAL,
      mode: ToneMappingMode.ACES_FILMIC
    },
    bloomEffect: {
      blendFunction: 28,
      inverted: false,
      ignoreBackground: true,
      opacity: 1,
      threshold: 0.6,
      smoothing: 0.9,
      intensity: 0.35
    },
    vignetteEffect: { blendFunction: 23, technique: 0, offset: 0.5, darkness: 0.45 },
    smaaEffect: { preset: 1, edgeDetectionMode: 2, predicationMode: 0 }
  },

  // PLY 模型路径
  modelPath: '/models/Goat skull.ply',
  // 模型归一化后的目标最大边长（统一尺寸，与原始扫描坐标解耦）
  targetSize: 10,
  // 相机定格距离因子（distance = maxDim * factor，factor 越大越远）
  cameraDistanceFactor: 1.8,
  // 相机注视方向（正前方斜上方：+z 前、+y 上）
  cameraDir: { x: 0.5, y: 0.35, z: 1 },
  // 背景色（中性深灰，突出顶点色主体）
  backgroundColor: 0x0a0c10,
  // 地面阴影不透明度
  groundShadowOpacity: 0.28,

  /**
   * PLY 模型材质参数（MeshStandardMaterial）。
   * GUI 调试面板读这里做初始值，调好后可把输出粘回此处持久化。
   *  - roughness/metalness：PBR 粗糙度/金属度
   *  - envMapIntensity：环境贴图(IBL)贡献强度，0 => 完全不反射环境（环境光+平行光=0 时全黑）
   *  - vertexColors：是否启用 PLY 顶点色（扫描原色）
   *  - flatShading：平面着色（true => 多边形块面感，false => 平滑）
   *  - wireframe：线框
   *  - emissive/emissiveIntensity：自发光颜色/强度（无 IBL/灯光时的最低可见度来源）
   *  - color/opacity/transparent：基础色叠加/透明
   */
  material: {
    color: '#ffffff',
    emissive: '#000000',
    emissiveIntensity: 0,
    roughness: 0.62,
    metalness: 0.0,
    envMapIntensity: 0.9,
    opacity: 1,
    transparent: false,
    vertexColors: true,
    flatShading: false,
    wireframe: false
  }
};
