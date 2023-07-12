import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class SSThreeObject {
  /**
   * @type HTMLElement three dom
   */
  threeContainer = null;

  /**
   * @type THREE.Scene
   */
  threeScene = null;

  /**
   * @type THREE.Camera
   */
  threeCamera = null;

  /**
   * @type THREE.WebGLRenderer
   */
  threeRenderer = null;

  /**
   * @type OrbitControls
   */
  threeOrbitControl = null;

  /**
   * @type EffectComposer
   */
  threeEffectComposer = null;

  /**
   * @param {{ container: HTMLElement, threeScene: THREE.Scene, threeOrbitControl: OrbitControls, threeCamera: THREE.Camera, threeRender: THREE.WebGLRenderer ,EffectComposer}} param0 构造参数
   */
  constructor({
    container,
    threeScene,
    threeOrbitControl,
    threeCamera,
    threeRenderer,
    threeEffectComposer
  } = {}) {
    this.threeContainer = container;
    this.threeScene = threeScene;
    this.threeOrbitControl = threeOrbitControl;
    this.threeCamera = threeCamera;
    this.threeRenderer = threeRenderer;
    this.threeEffectComposer = threeEffectComposer;
  }
}
