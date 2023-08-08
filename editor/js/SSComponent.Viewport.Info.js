import SSComponent from './SSComponent.js';
import { UIPanel, UIBreak, UIText } from './libs/ui.js';

export default class SSViewportInfo extends SSComponent {
  /**
   * 物体数量
   * @@type {UIText}
   */
  objectsText = null;

  /**
   * 物体数量
   * @@type {UIText}
   */
  verticesText = null;

  /**
   * 物体数量
   * @@type {UIText}
   */
  trianglesText = null;

  /**
   * 物体数量
   * @@type {UIText}
   */
  frametimeText = null;

  constructor(controller) {
    const container = new UIPanel();
    container.setId('info');
    container.setPosition('absolute');
    container.setLeft('10px');
    container.setBottom('10px');
    container.setFontSize('12px');
    container.setColor('#fff');
    super(controller, container.dom);

    this.objectsText = new UIText('0').setMarginLeft('6px');
    this.verticesText = new UIText('0').setMarginLeft('6px');
    this.trianglesText = new UIText('0').setMarginLeft('6px');
    this.frametimeText = new UIText('0').setMarginLeft('6px');

    container.add(new UIText('objects').setTextTransform('lowercase'));
    container.add(this.objectsText, new UIBreak());
    container.add(new UIText('vertices').setTextTransform('lowercase'));
    container.add(this.verticesText, new UIBreak());
    container.add(new UIText('triangles').setTextTransform('lowercase'));
    container.add(this.trianglesText, new UIBreak());
    container.add(new UIText('frametime').setTextTransform('lowercase'));
    container.add(this.frametimeText, new UIBreak());

    this.controller.signalController.objectAdded.add(this.update);
    this.controller.signalController.objectRemoved.add(this.update);
    // this.controller.signalController.geometryChanged.add(this.update);
    this.controller.signalController.sceneRendered.add(this.updateFrametime);
  }

  //

  update = () => {
    const { scene } = this.controller;

    let objects = 0;
    let vertices = 0;
    let triangles = 0;

    scene.traverse((object) => {
      objects += 1;

      if (object.isMesh || object.isPoints) {
        const { geometry } = object;

        vertices += geometry.attributes.position.count;

        if (object.isMesh) {
          if (geometry.index !== null) {
            triangles += geometry.index.count / 3;
          } else {
            triangles += geometry.attributes.position.count / 3;
          }
        }
      }
    });

    this.objectsText.setValue(`${objects}个`);
    this.verticesText.setValue(`${vertices}个`);
    this.trianglesText.setValue(`${triangles}个`);
  };

  updateFrametime = (frametime) => {
    this.frametimeText.setValue(`${Number(frametime).toFixed(2, 10)}ms`);
  };
}
