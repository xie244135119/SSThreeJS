import * as THREE from 'three';
import SSThreeJs from './SSCore';
import SSThreeTool from './SSTool/index';
import SSThreeLoop from './SSThreeLoop';
import SSEvent from './SSEvent';
import SSCssRenderer, { CSS2DObject, CSS3DObject } from './SSCssRenderer';
import * as SSMaterial from './SSMaterial/index';
import * as SSMesh from './SSMesh/index';
import SSPostProcess from './SSPostProcess';
import SSFileSetting from './SSModule';
import SSThreeObject from './SSThreeObject';
import SSDispose from './SSDispose';

export default SSThreeJs;
export {
  THREE,
  // ssthree 事件
  SSEvent,
  // css2d, css3d 面板渲染
  SSCssRenderer,
  // base tool
  SSThreeTool,
  // three loop
  SSThreeLoop,
  // three object
  SSThreeObject,
  //
  SSMaterial,
  SSMesh,
  SSPostProcess,
  SSFileSetting,
  SSDispose,
  CSS2DObject,
  CSS3DObject
};
