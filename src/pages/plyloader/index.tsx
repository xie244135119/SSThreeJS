/*
 * Author  Kayson.Wan
 * Date  2026-08-05 16:30:00
 * Description  PLY 模型高保真查看器页面。
 */

import React, { useEffect, useRef, useState } from 'react';
import GUI from 'lil-gui';
import SSThreeJs, { THREE } from '../../../core/index';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import PostProcessPlugin from '../../../core/SSPlugins/PostProcessPlugin';
import BaseLightSetting from '../../../core/SSPlugins/BaseLightSetting';
import plyConfig from './plyloader.config';

/**
 * PLY 模型高保真查看器。
 * 与 scene.tsx（视频融合场景）解耦：本页只负责 PLY 扫描网格的加载与渲染。
 * PLYLoader 返回 BufferGeometry（非 glTF/Object3D），无法走 SSCore 的 modelQueue
 * （其按扩展名 .ply 命中 draco 分支会失败），故在此单独加载并自定义材质/光照/相机。
 *
 * 灯光使用 BaseLightSetting（读 plyloader.config.js 的 baseLighting），
 * 第三参数 true：保留 lil-gui 调试面板 + 阴影相机 CameraHelper，可实时调光。
 */
export default function PlyLoader() {
  const jsRef = useRef(new SSThreeJs());
  // BaseLightSetting 实例 ref：销毁时释放 gui/helper
  const lightSettingRef = useRef(null);
  // 材质调试 GUI ref：销毁时 destroy
  const materialGuiRef = useRef(null);
  // 已加载的 PLY mesh ref：材质 GUI 实时操控它
  const meshRef = useRef(null);
  // 模型加载状态：null(未完成) | error。加载进度由 SSLoadingManager 自带进度条负责，
  // 不再显示自建 loading overlay；error 仍需本页兜底显示（加载器失败不抛到 UI）。
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    jsRef.current.setup('plycontainer', { antialias: true });
    const ssObj = jsRef.current.ssThreeObject;
    // 中性深灰背景突出主体（纯黑底会被顶点色 + 环境光吞没细节）
    ssObj.threeScene.background = new THREE.Color(plyConfig.backgroundColor);
    ssObj.threeScene.fog = null;

    // 鼠标控制器：缩放/平移/阻尼（适配 0.172 OrbitControls）
    const controls = ssObj.threeOrbitControl;
    if (controls) {
      controls.enablePan = true;
      controls.screenSpacePanning = true;
      controls.enableDamping = true;
      controls.dampingFactor = 0.2;
      controls.minDistance = 1;
      controls.maxDistance = 10000;
      controls.update();
    }

    // 灯光：BaseLightSetting 读取 baseLighting 初始化环境光/平行光/阴影/雾/天空盒，
    // 第三参数 true => 保留 lil-gui 调试面板 + 阴影相机 CameraHelper（可实时调试）。
    lightSettingRef.current = new BaseLightSetting(jsRef.current, plyConfig.baseLighting, true);

    // 后处理：SMAA 抗锯齿 + ACES 色调映射 + 轻量 Bloom/晕影，提升画面质感。
    const postProcessPlugin = new PostProcessPlugin(ssObj);
    postProcessPlugin.fromJson(plyConfig.postSetting);

    // 环境光照（IBL）：RoomEnvironment 烘焙成 PMREM，给标准材质柔和反射。
    // 放在 BaseLightSetting 之后，避免其天空盒分支把 environment 覆盖为 null。
    const pmrem = new THREE.PMREMGenerator(ssObj.threeRenderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    ssObj.threeScene.environment = envTex;
    pmrem.dispose();

    // 加载 PLY
    loadGoatSkullPly().catch((e) => {
      // eslint-disable-next-line no-console
      console.error('【plyloader】Goat skull.ply 加载失败', e);
      setErrMsg(e?.message || String(e));
      setStatus('error');
    });

    return () => {
      // 材质 GUI 先销毁
      materialGuiRef.current?.destroy?.();
      materialGuiRef.current = null;
      // BaseLightSetting 先于 SSThreeJs destroy 释放 gui/helper/lightTarget
      lightSettingRef.current?.dispose?.();
      lightSettingRef.current = null;
      jsRef.current.destroy();
    };
  }, []);

  /**
   * 加载 Goat skull.ply：走核心库 loadModelQueue 的 ply 分支。
   *  - SSCore.loadPly 负责解析 + computeVertexNormals + 构造 MeshStandardMaterial（读 material 配置）
   *  - loadModelQueue 负责 traverse 加阴影 + 入场景（onAfterRender）
   *  - 此处负责：居中归一化缩放、地面、相机定格、材质 GUI
   * 灯光/阴影由 BaseLightSetting 负责，此处只补 IBL、地面与相机。
   */
  const loadGoatSkullPly = async () => {
    const ssObj = jsRef.current.ssThreeObject;
    const { threeScene } = ssObj;

    // 构造 ply 模型队列条目：字段名 ply === type 值（核心库 loadModelQueue 的隐式契约）。
    // vertexColors 不传，由 SSCore.loadPly 按 PLY 是否含 color 属性自动判断。
    const queueItem = {
      title: 'GoatSkull',
      type: 'ply',
      ply: plyConfig.modelPath
      // material: plyConfig.material
    };

    // loadModelQueue 是回调式 API，包成 Promise 取单个加载完成的 mesh。
    // onAfterRender 会在每个模型加载完成时调用一次，拿到 SSCore.loadPly 返回的 Mesh。
    const mesh: THREE.Mesh = await new Promise<THREE.Mesh>((resolve, reject) => {
      jsRef.current.loadModelQueue(
        [queueItem],
        () => resolve(null), // 全部完成（单个模型时同 onAfterRender 时序）
        undefined,
        (option, obj) => {
          // obj 是 SSCore.loadPly 返回的 Mesh（THREE.Object3D）。
          // loadModelQueue 自身只 traverse 加 castShadow/receiveShadow，不 add 到场景；
          // 调用方负责入场景（见 scene.tsx 同名回调）。此处 add 并 resolve。
          if (obj instanceof THREE.Object3D) {
            if (!obj.parent) threeScene.add(obj);
            resolve(obj as THREE.Mesh);
          } else {
            reject(new Error('PLY 加载返回非 Object3D'));
          }
        }
      );
    });

    if (!(mesh instanceof THREE.Mesh)) return;
    meshRef.current = mesh;

    // 居中 + 归一化缩放（统一尺寸，与原始扫描坐标解耦）
    const box = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = (plyConfig.targetSize || 10) / maxDim;
    mesh.scale.setScalar(scale);
    mesh.position.sub(center.multiplyScalar(scale));
    // 落到地面：缩放后底面对齐 y=0
    const boxScaled = new THREE.Box3().setFromObject(mesh);
    mesh.position.y -= boxScaled.min.y;

    // 地面（只接收阴影，给 skull 一个落点）
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: plyConfig.groundShadowOpacity ?? 0.28 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    threeScene.add(ground);

    // 定格相机到正面特写视角
    frameCameraOnObject(mesh, { distanceFactor: plyConfig.cameraDistanceFactor });

    // 材质调试 GUI：加载完成后挂载，实时调 PBR 参数
    addMaterialGui();

    setStatus('done');
    // eslint-disable-next-line no-console
    console.log('【plyloader】Goat skull.ply 加载完成', {
      verts: mesh.geometry.getAttribute('position')?.count,
      hasColor: mesh.geometry.getAttribute('color') != null,
      size: size.toArray(),
      scale
    });
  };

  /**
   * 按 Object 包围盒定格相机：放在物体正前方斜上方，注视点为包围盒中心。
   * @param obj 目标
   * @param opts.distanceFactor 距离 = maxDim * factor（factor 越大越远）
   */
  const frameCameraOnObject = (obj: THREE.Object3D, opts?: { distanceFactor?: number }) => {
    const ssObj = jsRef.current.ssThreeObject;
    const { threeCamera, threeOrbitControl } = ssObj;
    const box = new THREE.Box3().setFromObject(obj);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = maxDim * (opts?.distanceFactor ?? 2);
    const { x, y, z } = plyConfig.cameraDir || { x: 0.5, y: 0.35, z: 1 };
    const dir = new THREE.Vector3(x, y, z).normalize();
    threeCamera.position.copy(center).add(dir.multiplyScalar(dist));
    threeCamera.near = Math.max(0.05, dist / 100);
    threeCamera.far = dist * 100;
    threeCamera.updateProjectionMatrix();
    threeCamera.lookAt(center);
    if (threeOrbitControl) {
      threeOrbitControl.target.copy(center);
      threeOrbitControl.update();
    }
  };

  /**
   * 材质调试 GUI：lil-gui 面板挂右上角（避开右侧的 BaseLightSetting 面板），
   * 实时改 mesh.material 的 PBR 参数。
   *  - 粗糙度/金属度/IBL 强度（envMapIntensity=0 => 不反射环境，配合环境光+平行光=0 可全黑）
   *  - 顶点色开关 / 平面着色 / 线框
   *  - 自发光颜色+强度（无灯时最低可见度来源）
   *  - 基础色/透明度
   * 「保存设置」输出当前材质参数 JSON，可粘回 plyloader.config.js 的 material 字段持久化。
   */
  const addMaterialGui = () => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;

    const gui = new GUI();
    materialGuiRef.current = gui;
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.left = '0rem';
    gui.domElement.style.top = '0rem';
    gui.domElement.style.zIndex = 100;
    gui.title('材质调试 GoatSkull');
    gui.width = 300;

    const params = {
      savePreset() {
        const out = JSON.stringify({
          color: `#${mat.color.getHexString()}`,
          emissive: `#${mat.emissive.getHexString()}`,
          emissiveIntensity: mat.emissiveIntensity,
          roughness: mat.roughness,
          metalness: mat.metalness,
          envMapIntensity: mat.envMapIntensity,
          opacity: mat.opacity,
          transparent: mat.transparent,
          vertexColors: mat.vertexColors,
          flatShading: mat.flatShading,
          wireframe: mat.wireframe
        });
        // eslint-disable-next-line no-console
        console.log('【plyloader】material 设置:', out);
        params.outPutSetting = out;
      },
      outPutSetting: ''
    };

    gui.add(params, 'savePreset').name('保存设置');
    gui.add(params, 'outPutSetting').name('输出设置').listen();

    const pbr = gui.addFolder('PBR');
    pbr.add(mat, 'roughness', 0, 1, 0.01).name('粗糙度');
    pbr.add(mat, 'metalness', 0, 1, 0.01).name('金属度');
    pbr
      .add(mat, 'envMapIntensity', 0, 3, 0.01)
      .name('IBL 强度')
      .onChange(() => (mat.needsUpdate = true));

    const render = gui.addFolder('着色/显示');
    render
      .add(mat, 'vertexColors')
      .name('顶点色')
      .onChange(() => (mat.needsUpdate = true));
    render
      .add(mat, 'flatShading')
      .name('平面着色')
      .onChange(() => {
        mat.needsUpdate = true;
        geometry_needsUpdate(mesh);
      });
    render.add(mat, 'wireframe').name('线框');

    const emis = gui.addFolder('自发光');
    emis.addColor(mat, 'emissive').name('自发光颜色');
    emis.add(mat, 'emissiveIntensity', 0, 5, 0.01).name('自发光强度');

    const base = gui.addFolder('基础色/透明');
    base.addColor(mat, 'color').name('基础色');
    base
      .add(mat, 'transparent')
      .name('透明')
      .onChange(() => (mat.needsUpdate = true));
    base.add(mat, 'opacity', 0, 1, 0.01).name('不透明度');
  };

  /**
   * 切换 flatShading 时需重建法线属性（平滑法线 vs 面法线）才生效。
   * MeshStandardMaterial.flatShading 内部按是否有法线决定，three 需要重新计算并标记 needsUpdate。
   */
  const geometry_needsUpdate = (mesh: THREE.Mesh) => {
    const geo = mesh.geometry;
    if (!geo) return;
    geo.computeVertexNormals();
    geo.attributes.normal.needsUpdate = true;
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div id="plycontainer" style={{ position: 'absolute', inset: 0 }} />
      {status === 'error' && (
        <div style={overlayStyle}>
          <span
            style={{ ...badgeStyle, color: '#ffb3b3', borderColor: 'rgba(255, 100, 100, 0.6)' }}
          >
            PLY 加载失败：{errMsg}
          </span>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 24,
          color: '#7df9ff',
          fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div style={{ fontSize: 18, color: '#ffffff' }}>Goat Skull · PLY Viewer</div>
        <div style={{ marginTop: 4, opacity: 0.8 }}>顶点色 · PBR 环境 · 三点光 · 阴影</div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 10
};

const badgeStyle: React.CSSProperties = {
  padding: '8px 18px',
  fontSize: 13,
  letterSpacing: 2,
  color: '#7df9ff',
  background: 'rgba(0, 30, 40, 0.6)',
  border: '1px solid rgba(0, 229, 255, 0.45)',
  borderRadius: 4,
  backdropFilter: 'blur(6px)'
};
