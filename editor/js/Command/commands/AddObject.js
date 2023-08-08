import * as THREE from 'three';
import Command from '../Interface';

export default class AddObjectCommand extends Command {
  /**
   * @param {THREE.Object3D} object 添加的模型物体
   * @constructor
   */
  constructor(controller, object) {
    super(controller);
    // this.type = 'AddObjectCommand';
    this.object = object;
    if (object !== undefined) {
      this.name = `Add Object: ${object.name}`;
    }
  }

  execute() {
    this.controller.addObject(this.object);
    this.controller.select(this.object);
  }

  undo() {
    this.controller.removeObject(this.object);
    this.controller.deselect();
  }

  toJSON() {
    return {};
  }

  fromJSON(json) {
    super.fromJSON(json);
  }
}
