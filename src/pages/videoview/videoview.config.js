/*
 * Author  Kayson.Wan
 * Date  2026-08-05 17:00:00
 * Description  视频融合页面配置：机位/楼层、视频融合标定、模型队列、光照、后处理。
 * 与 scene.config.js（开关站基础场景）完全解耦，各自维护一份。
 */
import { BlendFunction } from 'postprocessing';

export default {
  // 视频融合实体模型镜头初始视角位置
  entityCameraInitialPosition: {
    x: 2499259.7150648776,
    y: 153.71003485381038,
    z: 5849079.669596614
  },

  // 视频融合实体模型场景中心目标位置
  entiySceneInitialPosition: { x: 37.34309912655562, y: 22.80866533381508, z: 5.801774535538348 },

  /**
   * 视频融合配置：多路监控视频流投射到 3D 场景。
   * poster 在 videoview/index.tsx 用统一封面图填充（这里留空，避免耦合资源 import）。
   * stream 指向 public/videos/110kv 下的 mp4；position/rotation 定义投影相机，
   * 开启融合时由 manager.focusCamera 自动算正前方注视点拉近视角。
   * 超过 maxBatchSize（运行时按 GPU 纹理单元自动算）路时自动分批，突破单 shader 纹理单元上限。
   * 每路显式带 rotation（不依赖 defaults 兜底，便于单路独立调整）。
   */
  /**
   * 视频来源支持两种（在 video 字段区分）：
   *   - URL/RTSP：写 video.stream（HTTP mp4 / RTSP），融合靠 video.src + canplaythrough 建纹理。
   *   - h5s：写 video.token（非空即走 h5s）+ video.h5sHost + video.session，
   *     融合由 H5sStream 接管 video，WebSocket + MediaSource 喂帧，不设 video.src。
   *   两种可混用；同一物理摄像头的机位标定（position/rotation/quadCorners/distortion）可复用。
   *
   * h5s 示例路（与下方 110kV1Fmen 同一物理机位，标定复用；填入真实 host/token/session 后启用）：
   * {
   *   camera: {
   *     name: '110kV1Fmen-h5s',
   *     fov: 40, aspect: 1.7, near: 0.1, far: 10,
   *     position: { x: -25.174694, y: 2.69667, z: -6.528583 },
   *     rotation: { x: -2.735928, y: 0.017867, z: 3.132658 },
   *     quadCorners: [[0, 0], [1, 0], [1, 1], [0, 1]],
   *     distortion: { enabled: true, k1: -0.04, k2: 0, cx: 0, cy: 0, scale: 1 }
   *   },
   *   video: {
   *     poster: '/core/assets/default_ground1.png',
   *     h5sHost: 'http://127.0.0.1:8080',  // h5s 服务地址（含端口）
   *     token: '<h5s-token>',               // h5s 摄像头 token（token 非空即识别为 h5s 流）
   *     session: '<h5s-session>'           // h5s 登录 session，无登录可留空串
   *   }
   * },
   */
  videoFusion: {
    // 统一相机参数（个别路可在 cameras[] 里覆盖）
    defaults: {
      fov: 34,
      aspect: 2,
      near: 0.1,
      far: 10
    },
    // 110kv 视频融合：public/videos/110kv/ 下 9 路全部接入。
    // 标定参数（position/rotation）暂复用 A0 占位，quadCorners 全部保持默认
    // （省略 => viewer 内置单位正方形 [[0,0],[1,0],[1,1],[0,1]]，见 VideoCamera.js）。
    // 后续在调试 GUI 里按 110kv 实际机位逐路校正 position/rotation/quadCorners。
    cameras: [
      {
        camera: {
          name: '110kV1Fmen-h5s',
          fov: 40,
          aspect: 1.7,
          near: 0.1,
          far: 10,
          position: { x: -25.174694, y: 2.69667, z: -6.528583 },
          rotation: { x: -2.735928, y: 0.017867, z: 3.132658 },
          quadCorners: [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1]
          ],
          distortion: { enabled: true, k1: -0.04, k2: 0, cx: 0, cy: 0, scale: 1 }
        },
        video: {
          // 'ws://???/api/v1/h5swsapi?token=???'
          poster: '/core/assets/default_ground1.png',
          h5sHost: '', // h5s 服务地址（含端口）
          token: '', // h5s 摄像头 token（token 非空即识别为 h5s 流）
          session: '<h5s-session>' // h5s 登录 session，无登录可留空串
        }
      },
      // {
      //   camera: {
      //     name: '110kV1Fmen',
      //     fov: 40,
      //     aspect: 1.7,
      //     near: 0.1,
      //     far: 10,
      //     position: { x: -25.174694, y: 2.69667, z: -6.528583 },
      //     rotation: { x: -2.735928, y: 0.017867, z: 3.132658 },
      //     quadCorners: [
      //       [0, 0],
      //       [1, 0],
      //       [1, 1],
      //       [0, 1]
      //     ],
      //     distortion: { enabled: true, k1: -0.04, k2: 0, cx: 0, cy: 0, scale: 1 }
      //   },
      //   video: {
      //     poster: '/core/assets/default_ground1.png',
      //     stream: '/videos/110kv/GJHZZX110KV_110kV1Fmen--0-02b49f7c-aa5c-4d33-a2c5-fb4f9500374c.mp4'
      //   }
      // },
      // {
      //   camera: {
      //     name: '110kV1Ftd1',
      //     fov: 60,
      //     aspect: 2,
      //     near: 0.1,
      //     far: 10,
      //     position: { x: -27.127718024876476, y: 2.051834746223898, z: -8.679582869171377 },
      //     rotation: { x: -1.4396795963623796, y: -1.0636035048646815, z: -1.4239107968043077 }
      //   },
      //   video: {
      //     poster: '',
      //     stream: '/videos/110kv/GJHZZX110KV_110kV1Ftd1--0-140ed2f2-4ee5-4626-b51d-0ce5e0123612.mp4'
      //   }
      // },
      {
        camera: {
          name: '110kV1Ftd2',
          fov: 45,
          aspect: 2,
          near: 0.1,
          far: 10,
          position: {
            x: 8.427829,
            y: 1.957324,
            z: -8.228352
          },
          rotation: {
            x: -1.400071,
            y: 1.060243,
            z: 1.372856
          },
          quadCorners: [
            [-0.086994, -0.17522],
            [1.001052, 0.024751],
            [1.005713, 1.157147],
            [-0.055722, 1.094419]
          ],
          distortion: {
            enabled: true,
            k1: -0.08,
            k2: 0,
            cx: 0.04,
            cy: 0.03,
            scale: 1
          }
        },
        video: {
          poster: '/core/assets/default_ground1.png',
          stream: '/videos/110kv/GJHZZX110KV_110kV1Ftd2--0-前半段.mp4'
        }
      },
      // {
      //   camera: {
      //     name: 'camera2',
      //     fov: 40,
      //     aspect: 1.7,
      //     near: 0.1,
      //     far: 10,
      //     position: {
      //       x: -21.349927,
      //       y: 2.194242,
      //       z: -8.717794
      //     },
      //     rotation: {
      //       x: -1.787421,
      //       y: 1.206494,
      //       z: 1.805098
      //     },
      //     quadCorners: [
      //       [0, 0],
      //       [0.89814, -0.145512],
      //       [1, 1],
      //       [0, 1]
      //     ]
      //   },
      //   video: {
      //     poster: '/core/assets/default_ground1.png',
      //     stream: '/videos/110kv/GJHZZX110KV_camera2--1-026f72ba-c822-4884-936a-b8625b87129c.mp4'
      //   }
      // },
      {
        camera: {
          name: 'camera4',
          fov: 38,
          aspect: 1.7,
          near: 0.1,
          far: 20,
          position: {
            x: -11.456274,
            y: 2.059205,
            z: -8.730338
          },
          rotation: {
            x: -1.833723,
            y: 1.18704,
            z: 1.856113
          },
          quadCorners: [
            [0, 0],
            [1.012312, 0.001894],
            [1.038055, 0.993432],
            [-0.068211, 1.034305]
          ],
          distortion: {
            enabled: true,
            k1: 0,
            k2: 0,
            cx: 0.16,
            cy: 0,
            scale: 1
          }
        },
        video: {
          poster: '/core/assets/default_ground1.png',
          stream: '/videos/110kv/GJHZZX110KV_camera4--1-2f1c70eb-0c12-4b7f-ac53-23e4d40e0f9c.mp4'
        }
      },
      {
        camera: {
          name: 'camera5',
          fov: 36,
          aspect: 1.7,
          near: 0.1,
          far: 10,
          position: {
            x: -7.181355,
            y: 2.059205,
            z: -8.884353
          },
          rotation: {
            x: -1.561185,
            y: 1.196856,
            z: 1.566544
          },
          quadCorners: [
            [0.003665, 0.139971],
            [0.878528, 0.227035],
            [0.89252, 1.159263],
            [-0.101753, 1.083187]
          ],
          distortion: {
            enabled: true,
            k1: 0,
            k2: 0,
            cx: 0.2,
            cy: 0,
            scale: 1
          }
        },
        video: {
          poster: '/core/assets/default_ground1.png',
          stream: '/videos/110kv/GJHZZX110KV_camera5--1-bae0b21d-0f6f-4bbb-975e-c041aaefcc25.mp4'
        }
      },
      // {
      //   camera: {
      //     name: 'camera6',
      //     fov: 40,
      //     aspect: 1.7,
      //     near: 0.1,
      //     far: 10,
      //     position: { x: -2.9623139307497, y: 2.05920538484054, z: -8.730338459627369 },
      //     rotation: { x: -0.463663, y: 0.007805, z: 0.003903 }
      //   },
      //   video: {
      //     poster: '',
      //     stream: '/videos/110kv/GJHZZX110KV_camera6--1-510cfe66-e380-4d69-a54b-96edd143b1cd.mp4'
      //   }
      // },
      {
        camera: {
          name: 'camera7',
          fov: 34,
          aspect: 1.7,
          near: 0.1,
          far: 11,
          position: {
            x: 1.641391,
            y: 2.059205,
            z: -8.730338
          },
          rotation: {
            x: -1.512588,
            y: 1.147557,
            z: 1.503733
          },
          quadCorners: [
            [0.002078, 0.026513],
            [0.953398, -0.007513],
            [0.815973, 0.957584],
            [0.120654, 1.009897]
          ]
        },
        video: {
          poster: '/core/assets/default_ground1.png',
          stream: '/videos/110kv/GJHZZX110KV_camera7--1-c57b92c4-1f4e-4379-8ce3-b9e091c24f38.mp4'
        }
      },
      {
        camera: {
          name: 'camera8',
          fov: 43,
          aspect: 1.7,
          near: 0.1,
          far: 8,
          position: {
            x: 5.746045,
            y: 2.059205,
            z: -8.730338
          },
          rotation: {
            x: -1.548786,
            y: 1.107027,
            z: 1.546188
          },
          quadCorners: [
            [-0.03295, -0.014208],
            [1, 0],
            [0.896671, 0.873047],
            [0.039931, 0.983082]
          ]
        },
        video: {
          poster: '/core/assets/default_ground1.png',
          stream: '/videos/110kv/GJHZZX110KV_camera8--1-1e1dd161-0587-4681-b11e-2337d77a7d25.mp4'
        }
      }
    ]
  },

  // 模型队列：开关站配电房（视频融合投射到其上）
  modelQueue: [
    {
      title: '开关站',
      // path: '/models/A0开关站.glb'
      path: '/models/10kV配电房0724.glb'
    }
  ],

  /**
   * 后处理配置（与 scene 页各自一份，便于独立调整）。
   */
  postSetting: {
    bloomEffect: {
      blendFunction: 28,
      inverted: false,
      ignoreBackground: true,
      opacity: 1,
      threshold: 0.2,
      smoothing: 0.9,
      // intensity: 10
      intensity: 0
    },
    outlineEffect: {
      blendFunction: 28,
      visibleEdgeColor: '#00ffff',
      hiddenEdgeColor: '#00ffff',
      pulseSpeed: 0.7,
      edgeStrength: 2,
      blur: false
    },
    lut3DEffect: { blendFunction: BlendFunction.SOFT_LIGHT, tetrahedralInterpolation: false },
    vignetteEffect: {
      blendFunction: 23,
      technique: 0,
      offset: 0.5,
      darkness: 0.5
    },
    smaaEffect: { preset: 1, edgeDetectionMode: 2, predicationMode: 0 },
    hueSaturationEffect: { blendFunction: 9, hue: 0, saturation: 0.25 },
    brightnessContrastEffect: { blendFunction: 23, brightness: 0, contrast: 0 }
  },

  /**
   * 灯光配置（BaseLightSetting 读取）
   */
  baseLighting: {
    controllers: {
      输出设置: ''
    },
    folders: {
      环境: { controllers: { tone曝光度: 1, toneMapping: 4 }, folders: {} },
      灯光: {
        controllers: {
          环境光强度: 2,
          环境光颜色: '#ffffff',
          启用平行光: true,
          平行光强度: 2,
          平行光颜色: '#fffbe5',
          平行光位置x: 10,
          平行光位置y: 10,
          平行光位置z: 10
        },
        folders: {}
      },
      阴影: {
        controllers: {
          接收阴影: true,
          阴影分辨率: 2048,
          阴影范围上下宽度: 30,
          阴影范围左右宽度: 30,
          阴影贴图偏差: -0.0008,
          shadowCamera最远距离: 100,
          shadowCamera最近距离: 0
        },
        folders: {}
      },
      雾: {
        controllers: { 启用雾: true, 雾颜色: '#aed8ff', 雾最近距离: 0, 雾最远距离: 5427 },
        folders: {}
      },
      天空盒: {
        controllers: { 启用背景: false, environment: { none: 'none', blueSky: 'blueSky' } },
        folders: {}
      }
    }
  },
  lightTarget: { x: 0, y: 0, z: 0 }
};
