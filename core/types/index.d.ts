declare module '*.png' {
  const classes: string;
  export default classes;
}

declare module '*.json' {
  const classes: string;
  export default classes;
}

export interface SSModelQueueItem {
  title: string;
  type: 'obj' | 'mtl' | 'gltf' | 'fbx' | 'draco' | 'opt' | 'ply';
  url: string;
  obj: string;
  mtl: string;
  gltf: string;
  fbx: string;
  draco: string;
  opt: string;
  ply: string;
  /**
   * ply 专用：是否使用顶点色（PLY 头部含 red/green/blue 时为 true）。
   * loadModelQueue 据此决定 MeshStandardMaterial.vertexColors 初值。
   * 不传时按运行时 geometry 是否有 color 属性自动判断。
   */
  vertexColors?: boolean;
  /**
   * ply 专用：MeshStandardMaterial 的 PBR 参数初值，可选。
   * 不传则用默认（roughness 0.62 / metalness 0 / envMapIntensity 0.9 / flatShading false）。
   */
  material?: {
    color?: string | number;
    emissive?: string | number;
    emissiveIntensity?: number;
    roughness?: number;
    metalness?: number;
    envMapIntensity?: number;
    opacity?: number;
    transparent?: boolean;
    flatShading?: boolean;
    wireframe?: boolean;
  };
}
