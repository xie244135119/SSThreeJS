/*
 * Author  Kayson.Wan
 * Date  2026-08-05 17:00:00
 * Description  视频融合场景页（从 scene.tsx 迁出，与开关站基础场景解耦）。
 */

import React, { useEffect, useRef, useState } from 'react';

import MeshReflectorMaterial from '../../../core/SSMaterial/MeshReflectorMaterial';
import SSThreeJs, { THREE, SSCssRenderer, SSThreeLoop, SSThreeTool } from '../../../core/index';
import SSPickPointMode from '../../../core/SSModule/pickpoint.module';
import SSLightModule from '../../../core/SSModule/light.module';
import VideoSceneViewerManager from '../../../core/SSPlugins/VideoSceneViewer/VideoSceneViewerManager';
import { VideoSceneViewer } from '../../../core/SSPlugins/VideoSceneViewer/VideoSceneViewer';
import videoBlendImg from '../../../core/assets/default_ground1.png';
import PostProcessPlugin from '../../../core/SSPlugins/PostProcessPlugin';
import SSWatchLookModule from '../../../core/SSModule/watchlook.module';
import { SSMesh } from '../../../core/index';
import BaseLightSetting from '../../../core/SSPlugins/BaseLightSetting';

import { BlendFunction, ToneMappingMode } from 'postprocessing';
import videoConfig from './videoview.config';

export default function VideoView() {
  const jsRef = useRef(new SSThreeJs());
  // 视频融合管理器与配置：提到组件作用域，按按钮开关复用，避免每次都 new
  const videoBlendRef = useRef<VideoSceneViewerManager | null>(null);
  const videoFusionDataRef = useRef<any[] | null>(null);
  const [videoFusionOn, setVideoFusionOn] = useState(false);
  // 选中的融合相机名（用于下拉框 + 只开此路开启），'' 表示未选
  const [selectedCamName, setSelectedCamName] = useState('');
  // 开启时是否只开选中的这一路（否则开全部）
  const [onlySelected, setOnlySelected] = useState(false);
  // 相机名列表 state：useEffect 设置 ref 后回填，触发重渲染让下拉框有内容
  const [camNames, setCamNames] = useState<string[]>([]);

  // --------反射---------
  const reflectorTest = () => {
    const { ssThreeObject } = jsRef.current;
    const geometry2 = new THREE.PlaneGeometry(60, 60, 1, 1);
    const material2 = new THREE.MeshBasicMaterial();
    const mesh2 = new THREE.Mesh(geometry2, material2);
    const fadingReflectorOptions = {
      mixBlur: 2,
      mixStrength: 1.5,
      resolution: 2048,
      blur: [0, 0],
      minDepthThreshold: 0.7,
      maxDepthThreshold: 2,
      depthScale: 2,
      depthToBlurRatioBias: 2,
      mirror: 0,
      distortion: 2,
      mixContrast: 2,
      reflectorOffset: 0,
      bufferSamples: 8
    };
    mesh2.material = new MeshReflectorMaterial(
      ssThreeObject.threeRenderer,
      ssThreeObject.threeCamera,
      ssThreeObject.threeScene,
      mesh2,
      fadingReflectorOptions
    );
    ssThreeObject.threeScene.add(mesh2);
    mesh2.position.y = 0.1;
    mesh2.position.x = 5;
    mesh2.rotateX(Math.PI * -0.5);
  };

  // 测试 360全景相机
  const test360Video = () => {
    const video = document.createElement('video');
    video.preload = true;
    video.autoplay = true;
    video.loop = true;
    video.src = '/360video.mp4';

    setTimeout(() => {
      video.play();
      console.log(' 视频开始播放 ');
    }, 5000);
    const videotexture = new THREE.VideoTexture(video);
    videotexture.minFilter = THREE.LinearFilter;
    videotexture.colorSpace = THREE.SRGBColorSpace;
    window.videotexture = videotexture;

    const materialArray = [];
    const material = new THREE.MeshBasicMaterial({
      map: videotexture,
      side: THREE.DoubleSide
    });
    materialArray.push(material);

    const geo = new THREE.SphereGeometry(5);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(1, 5, 1);
    mesh.name = '360全景视频';
    jsRef.current.ssThreeObject.threeScene.add(mesh);

    jsRef.current.setModelPosition(mesh.position, mesh.position);
  };

  useEffect(() => {
    jsRef.current.setup('threecontainer', {
      antialias: true
    });
    jsRef.current.ssThreeObject.threeScene.background = new THREE.Color(0, 0, 0);
    updateOrbitControlSetting();

    // 第三参数 false：不建光照调试 GUI、不加阴影相机 CameraHelper（避免白线框）
    const lightSetting = new BaseLightSetting(jsRef.current, videoConfig.baseLighting, false);

    jsRef.current.addSun();

    // modelQueue 简化写法归一化：支持 { title, path } 简写，按扩展名自动识别 type，
    // 并把 path 填到 loadModelQueue 按 type 读取的字段。
    type ModelQueueItemInput = Partial<Record<string, any>> & { path?: string };
    const EXT_TO_FIELD: Record<string, string> = {
      fbx: 'fbx',
      obj: 'obj',
      opt: 'opt',
      ply: 'ply'
    };
    const normalizeModelQueue = (list?: ModelQueueItemInput[]) =>
      (list || []).map((item: ModelQueueItemInput) => {
        if (!item || typeof item !== 'object') return item;
        if (item.type) return item;
        if (!item.path) return item;
        const ext = item.path
          .split('?')[0]
          .split('#')[0]
          .toLowerCase()
          .match(/\.([a-z0-9]+)$/);
        const extName = ext?.[1] || '';
        const type = EXT_TO_FIELD[extName] || 'draco';
        const field = type;
        return { ...item, type, [field]: item.path };
      });

    const modelQueue = normalizeModelQueue(videoConfig?.modelQueue);
    jsRef.current.loadModelQueue(
      modelQueue,
      (objs) => {
        console.log('【videoview】modelQueue 加载完成', objs?.length);
      },
      undefined,
      (option, obj) => {
        if (obj instanceof THREE.Object3D) {
          jsRef.current.ssThreeObject.threeScene.add(obj);
        } else if (obj?.scene instanceof THREE.Object3D) {
          jsRef.current.ssThreeObject.threeScene.add(obj.scene);
        }
      }
    );

    //  后处理
    const postSetting = {
      toneMappingEffect: {
        blendFunction: BlendFunction.NORMAL,
        mode: ToneMappingMode.ACES_FILMIC
      },
      bloomEffect: {
        blendFunction: 28,
        inverted: false,
        ignoreBackground: true,
        opacity: 1,
        threshold: 0.2,
        smoothing: 0.9,
        intensity: 2
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
      vignetteEffect: { blendFunction: 23, technique: 0, offset: 0.5, darkness: 0.5 },
      smaaEffect: { preset: 1, edgeDetectionMode: 2, predicationMode: 0 },
      hueSaturationEffect: { blendFunction: 9, hue: 0, saturation: 0.25 },
      brightnessContrastEffect: { blendFunction: 23, brightness: 0, contrast: 0 }
    };
    const postProcessPlugin = new PostProcessPlugin(jsRef.current.ssThreeObject);
    // postProcessPlugin.fromJson(postSetting);
    // postProcessPlugin.addDebug();

    // reflectorTest();

    // 视频融合Data：从 videoview.config.js 的 videoFusion 展开。
    // config 支持两种格式（兼容 GUI 导出的完整结构 + 简化的扁平结构）：
    //   1) 完整结构（GUI 导出可直接粘）：{ camera: {name,fov,...,position,rotation,quadCorners?}, video: {stream,...} }
    //   2) 扁平结构（共享 defaults 省略重复字段）：{ name, position, rotation, stream, ... }
    // 两种可混用；扁平结构用 defaults 兜底，完整结构直接用。poster 统一用封面图填充（空时）。
    const vf = videoConfig.videoFusion || {};
    const dft: any = vf.defaults || {};
    const videoFusionData = (vf.cameras || []).map((c) => {
      const item: any = c;
      const d: any = dft;
      if (item.camera) {
        // 完整结构：video 字段整体透传（含 token/h5sHost/session 等 h5s 字段），
        // poster 空时用统一封面图填充
        const video = { ...(item.video || {}) };
        if (!video.poster) video.poster = videoBlendImg;
        return { camera: item.camera, video };
      }
      // 扁平结构：把 h5s 字段一并收进 video（与完整结构对齐，供 viewer 分流）
      return {
        camera: {
          name: item.name,
          fov: item.fov ?? d.fov,
          aspect: item.aspect ?? d.aspect,
          near: item.near ?? d.near,
          far: item.far ?? d.far,
          position: item.position,
          rotation: item.rotation ?? d.rotation,
          ...(item.quadCorners ? { quadCorners: item.quadCorners } : {})
        },
        video: {
          poster: videoBlendImg,
          stream: item.stream,
          ...(item.token ? { token: item.token } : {}),
          ...(item.h5sHost ? { h5sHost: item.h5sHost } : {}),
          ...(item.session ? { session: item.session } : {})
        }
      };
    });
    // 管理器与配置存到 ref，由按钮开关复用，不在此自动开启
    videoFusionDataRef.current = videoFusionData;
    videoBlendRef.current = new VideoSceneViewerManager(
      jsRef.current,
      videoFusionData,
      window.ENV.DEBUG
    );
    setCamNames(videoFusionData.map((d) => d.camera?.name).filter(Boolean));

    return () => {
      videoBlendRef.current?.destroy?.();
      jsRef.current.destroy();
    };
  }, []);

  // 视频融合总开关：开启/关闭全部视频融合渲染。本身不影响视角，拉近由下拉框选择触发。
  const toggleVideoFusion = () => {
    const videoBlend = videoBlendRef.current;
    const data = videoFusionDataRef.current;
    if (!videoBlend || !data) return;
    setVideoFusionOn((on) => {
      if (on) {
        videoBlend.closeVideoFusion();
        return false;
      }
      videoBlend.openVideoFusion(data);
      return true;
    });
  };

  // 下拉框选相机：更新 state + 总是调用 focusCamera（重复选同一项也触发拉近，因为每次都重新调 setEye）。
  // 切换选中相机时，重置"隐藏当前"勾选状态（隐藏是针对选中路的，换路后该开关不适用旧路）。
  const onSelectCam = (e) => {
    const name = e.target.value;
    setSelectedCamName(name);
    setOnlySelected(false);
    if (!name) return;
    const vsv = videoBlendRef.current?.videoSceneView;
    const isFusionRunning = vsv?._mode === VideoSceneViewer.FUSION && vsv?.cameras?.length > 0;
    if (isFusionRunning) {
      videoBlendRef.current?.focusCamera?.(name, 0.1);
    }
  };

  // "隐藏当前"复选框：勾选 -> 隐藏选中这一路视频；取消 -> 显示这一路。
  const onToggleOnlySelected = (e) => {
    const checked = e.target.checked;
    setOnlySelected(checked);
    const vb = videoBlendRef.current;
    const vsv = vb?.videoSceneView;
    const running = vsv?._mode === VideoSceneViewer.FUSION && vsv?.cameras?.length > 0;
    if (!running || !selectedCamName) return;
    vb?.setCameraVisible?.(selectedCamName, !checked);
  };

  // 鼠标控制器设置
  const updateOrbitControlSetting = () => {
    const controls = jsRef.current.ssThreeObject.threeOrbitControl;
    if (!controls) return;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.minDistance = 1;
    controls.maxDistance = 10000;
    controls.update();
  };

  /**
   * 测试水材质
   */
  const testWater = () => {
    const water = SSMesh.WaterMesh.fromOptions(100, 100);
    jsRef.current.ssThreeObject.threeScene.add(water);
    jsRef.current.ssTransformControl.attach(water);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div id="threecontainer" style={{ position: 'absolute', inset: 0 }} />
      <div
        style={{
          position: 'absolute',
          right: 'calc(24px + 180px)',
          bottom: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 10
        }}
      >
        <select
          value={selectedCamName}
          onChange={onSelectCam}
          onClick={(e) => {
            // 点击下拉时临时把 value 置空，保证再次点击同一项也能触发 onChange（重复拉近）。
            e.currentTarget.value = '';
          }}
          style={{
            padding: '6px 10px',
            fontSize: 13,
            color: '#7df9ff',
            background: 'rgba(0, 30, 40, 0.6)',
            border: '1px solid rgba(0, 229, 255, 0.45)',
            borderRadius: 4,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="">选择相机…</option>
          {camNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: '#7df9ff',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <input
            type="checkbox"
            checked={onlySelected}
            onChange={onToggleOnlySelected}
            style={{ cursor: 'pointer' }}
            disabled={!videoFusionOn || !selectedCamName}
            title={
              !videoFusionOn
                ? '先开启视频融合'
                : !selectedCamName
                ? '先在下拉框选择相机'
                : '勾选隐藏当前选中相机视频，取消则显示'
            }
          />
          隐藏当前
        </label>
      </div>
      <button
        type="button"
        onClick={toggleVideoFusion}
        className={videoFusionOn ? 'vf-toggle vf-toggle--active' : 'vf-toggle'}
        title={videoFusionOn ? '关闭视频融合' : '开启视频融合'}
      >
        <span className="vf-toggle__dot" />
        <span className="vf-toggle__label">{videoFusionOn ? '关闭视频融合' : '开启视频融合'}</span>
        <span className="vf-toggle__bracket vf-toggle__bracket--tl" />
        <span className="vf-toggle__bracket vf-toggle__bracket--tr" />
        <span className="vf-toggle__bracket vf-toggle__bracket--bl" />
        <span className="vf-toggle__bracket vf-toggle__bracket--br" />
      </button>
      <style>{`
        .vf-toggle {
          position: absolute;
          right: 24px;
          bottom: 24px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 22px 10px 16px;
          font-family: 'Rajdhani', 'Orbitron', 'Segoe UI', sans-serif;
          font-size: 14px;
          letter-spacing: 2px;
          color: #7df9ff;
          text-transform: uppercase;
          cursor: pointer;
          background: linear-gradient(
            135deg,
            rgba(0, 20, 30, 0.55),
            rgba(0, 40, 60, 0.35)
          );
          border: 1px solid rgba(0, 229, 255, 0.45);
          border-radius: 4px;
          backdrop-filter: blur(6px);
          box-shadow:
            0 0 12px rgba(0, 229, 255, 0.25),
            inset 0 0 12px rgba(0, 229, 255, 0.08);
          clip-path: polygon(
            0 0, calc(100% - 10px) 0, 100% 10px,
            100% 100%, 10px 100%, 0 calc(100% - 10px)
          );
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .vf-toggle:hover {
          color: #ffffff;
          border-color: rgba(0, 229, 255, 0.9);
          box-shadow:
            0 0 22px rgba(0, 229, 255, 0.55),
            inset 0 0 18px rgba(0, 229, 255, 0.18);
          transform: translateY(-1px);
        }
        .vf-toggle:active {
          transform: translateY(0);
        }
        .vf-toggle--active {
          color: #ffb84d;
          border-color: rgba(255, 184, 77, 0.7);
          box-shadow:
            0 0 18px rgba(255, 184, 77, 0.4),
            inset 0 0 14px rgba(255, 184, 77, 0.12);
          background: linear-gradient(
            135deg,
            rgba(30, 18, 0, 0.55),
            rgba(60, 36, 0, 0.35)
          );
        }
        .vf-toggle--active:hover {
          color: #ffffff;
          border-color: rgba(255, 184, 77, 1);
          box-shadow:
            0 0 26px rgba(255, 184, 77, 0.65),
            inset 0 0 18px rgba(255, 184, 77, 0.2);
        }
        .vf-toggle__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00e5ff;
          box-shadow: 0 0 8px #00e5ff, 0 0 14px rgba(0, 229, 255, 0.6);
          animation: vf-pulse 1.6s ease-in-out infinite;
        }
        .vf-toggle--active .vf-toggle__dot {
          background: #ffb84d;
          box-shadow: 0 0 8px #ffb84d, 0 0 14px rgba(255, 184, 77, 0.6);
        }
        @keyframes vf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .vf-toggle__label {
          position: relative;
          z-index: 1;
        }
        .vf-toggle__bracket {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: currentColor;
          opacity: 0.85;
          pointer-events: none;
        }
        .vf-toggle__bracket--tl { top: 3px; left: 3px; border-top: 2px solid; border-left: 2px solid; }
        .vf-toggle__bracket--tr { top: 3px; right: 3px; border-top: 2px solid; border-right: 2px solid; }
        .vf-toggle__bracket--bl { bottom: 3px; left: 3px; border-bottom: 2px solid; border-left: 2px solid; }
        .vf-toggle__bracket--br { bottom: 3px; right: 3px; border-bottom: 2px solid; border-right: 2px solid; }
      `}</style>
    </div>
  );
}
