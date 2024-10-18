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
  type: 'obj' | 'mtl' | 'gltf' | 'fbx' | 'draco' | 'opt';
  url: string;
  obj: string;
  mtl: string;
  gltf: string;
  fbx: string;
  draco: string;
  opt: string;
}
