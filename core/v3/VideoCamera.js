import {
  CameraHelper,
  ClampToEdgeWrapping,
  EventDispatcher,
  LinearFilter,
  Matrix4,
  PerspectiveCamera,
  RGBAFormat,
  Texture,
  TextureLoader,
  VideoTexture
} from 'three';

/**
 * @class BlendRender
 * @author Conor.Yang
 */
class VideoCamera extends EventDispatcher {
  static TEXTURE_UPDATED = 'textureUpdated';

  constructor() {
    super();

    /**
     * @type {PerspectiveCamera}
     */
    this.camera = new PerspectiveCamera(15, 1.0, 0.1, 1000);

    /**
     * @type {CameraHelper}
     */
    this.helper = new CameraHelper(this.camera);

    /**
     * @type {Texture | VideoTexture | CanvasText}
     */
    this.texture = new Texture();
    this.texture = new TextureLoader().load(require('./icon2.png').default);

    /**
     * @type {HTMLVideoElement}
     */
    this.video = document.createElement('video');
    this.video.crossOrigin = 'anonymous'; // anonymous、use-credentials
    this.video.autoplay = true;
    this.video.preload = 'auto'; // none、metadata、auto
    this.video.muted = true;
    this.video.loop = true;
    // if ("requestVideoFrameCallback" in this.video) {
    //   console.log("video.requestVideoFrameCallback() ok");
    // }

    this.video.addEventListener(
      'play',
      () => {
        // console.log('play...', event);
      },
      false
    );
    this.video.addEventListener(
      'pause',
      () => {
        // console.log('pause...', event);
      },
      false
    );
    this.video.addEventListener(
      'playing',
      () => {
        // console.log('playing...', event);
      },
      false
    );
    this.video.addEventListener(
      'canplay',
      () => {
        // console.log('canplay...', event);
        this.video.play().then().catch();
      },
      false
    );
    this.video.addEventListener(
      'canplaythrough',
      () => {
        // console.log('canplaythrough...', event);
        this.texture = new VideoTexture(this.video);
        this.texture.wrapS = ClampToEdgeWrapping;
        this.texture.wrapT = ClampToEdgeWrapping;
        this.texture.minFilter = LinearFilter;
        this.texture.magFilter = LinearFilter;
        this.texture.format = RGBAFormat;
        this.texture.needsUpdate = true;

        this.dispatchEvent({
          type: VideoCamera.TEXTURE_UPDATED,
          texture: this.texture
        });
      },
      false
    );
  }

  /**
   * @returns {Matrix4}
   */
  calcProjScreenMatrix() {
    const matrix = new Matrix4();
    this.camera.updateMatrixWorld(true);
    this.camera.updateProjectionMatrix();
    matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    return matrix;
  }
}

export { VideoCamera };
