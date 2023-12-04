import * as THREE from 'three';
import SEBaseCommand from './Base';

/**
 * @param controller controller
 * @param object THREE.Object3D
 * @param newScale THREE.Vector3
 * @param optionalOldScale THREE.Vector3
 * @constructor
 */
export default class SetObjectScaleCommand extends SEBaseCommand {
  constructor(controller, object, newScale, optionalOldScale) {
    super(controller);

    this.type = 'SetScaleCommand';
    this.name = 'Set Scale';
    this.updatable = true;

    /**
     * @type {THREE.Object3D} object
     */
    this.object = object;

    if (object !== undefined && newScale !== undefined) {
      /**
       * @type {THREE.Vector3}
       */
      this.oldScale = object.scale.clone();
      /**
       * @type {THREE.Vector3}
       */
      this.newScale = newScale.clone();
    }

    if (optionalOldScale !== undefined) {
      this.oldScale = optionalOldScale.clone();
    }
  }

  execute() {
    this.object.scale.copy(this.newScale);
    this.object.updateMatrixWorld(true);
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  undo() {
    this.object.scale.copy(this.oldScale);
    this.object.updateMatrixWorld(true);
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  update(command) {
    this.newScale.copy(command.newScale);
  }

  toJSON() {
    const output = super.toJSON(this);

    output.objectUuid = this.object.uuid;
    output.oldScale = this.oldScale.toArray();
    output.newScale = this.newScale.toArray();

    return output;
  }

  fromJSON(json) {
    super.fromJSON(json);

    this.object = this.controller.objectByUuid(json.objectUuid);
    this.oldScale = new THREE.Vector3().fromArray(json.oldScale);
    this.newScale = new THREE.Vector3().fromArray(json.newScale);
  }
}
