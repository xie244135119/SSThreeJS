import { ObjectLoader } from 'three';
import SEBaseCommand from './Base';

/**
 * @param controller controller
 * @param object THREE.Object3D
 * @constructor
 */
export default class RemoveObjectCommand extends SEBaseCommand {
  constructor(controller, object) {
    super(controller);

    this.type = 'RemoveObjectCommand';
    this.name = 'Remove Object';

    /**
     * @type {import('three').Object3D}
     */
    this.object = object;
    this.parent = object !== undefined ? object.parent : undefined;
    if (this.parent !== undefined) {
      this.index = this.parent.children.indexOf(this.object);
    }
  }

  execute() {
    this.controller.removeObject(this.object);
    this.controller.deselect();
  }

  undo() {
    this.controller.addObject(this.object, this.parent, this.index);
    this.controller.select(this.object);
  }

  toJSON() {
    const output = super.toJSON(this);

    output.object = this.object.toJSON();
    output.index = this.index;
    output.parentUuid = this.parent.uuid;

    return output;
  }

  fromJSON(json) {
    super.fromJSON(json);

    this.parent = this.controller.objectByUuid(json.parentUuid);
    if (this.parent === undefined) {
      this.parent = this.controller.scene;
    }

    this.index = json.index;

    this.object = this.controller.objectByUuid(json.object.object.uuid);

    if (this.object === undefined) {
      const loader = new ObjectLoader();
      this.object = loader.parse(json.object);
    }
  }
}
