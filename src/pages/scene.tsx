import React, { useEffect, useRef } from 'react';

import SSThreeJs, { THREE, SSCssRenderer, SSThreeLoop, SSThreeTool } from '../../core/index';
import BaseLightSetting from '../../core/SSPlugins/BaseLightSetting';
import PostProcessPlugin from '../../core/SSPlugins/PostProcessPlugin';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import sceneConfig from './scene.config';

export default function ParentIndex(props) {
  const jsRef = useRef(new SSThreeJs());

  useEffect(() => {
    jsRef.current.setup('threecontainer', {
      antialias: true
    });
    jsRef.current.ssThreeObject.threeScene.background = new THREE.Color(0, 0, 0);
    updateOrbitControlSetting();

    // 第三参数 false：不建光照调试 GUI、不加阴影相机 CameraHelper（避免白线框）
    const lightSetting = new BaseLightSetting(jsRef.current, sceneConfig.baseLighting, false);

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

    const modelQueue = normalizeModelQueue(sceneConfig?.modelQueue);
    jsRef.current.loadModelQueue(
      modelQueue,
      (objs) => {
        console.log('【scene】modelQueue 加载完成', objs?.length);
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

    return () => {
      jsRef.current.destroy();
    };
  }, []);

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

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div id="threecontainer" style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
}
