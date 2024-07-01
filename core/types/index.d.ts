

declare module '*.png' {
  const classes: string;
  export default classes;
}

export interface SSModelQueueItem { 
  type: string; 
  obj: string;
   mtl: string; 
  gltf: string;
  fbx: string; 
  draco: string;
  opt: string 
}