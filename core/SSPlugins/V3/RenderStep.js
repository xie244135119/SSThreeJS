/**
 * @class RenderStep
 * @author Conor.Yang
 */
class RenderStep {
  /**
   * @constructor
   * @param {WebGLRenderer} renderer
   * @param {Camera} camera
   * @param {Scene} scene
   */
  constructor(renderer, camera, scene) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
  }

  initialize() {}

  update() {}

  render() {}
}

export { RenderStep };
