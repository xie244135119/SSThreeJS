import * as THREE from 'three';
import SEBaseCommand from './Base';

export default class SetObjectRotationCommand extends SEBaseCommand {
  constructor(controller, object, newRotation, optionalOldRotation) {
    super(controller);

    this.type = 'SetRotationCommand';
    this.name = 'Set Rotation';
    this.updatable = true;

    /**
     * @type {THREE.Object3D}
     */
    this.object = object;

    if (object !== undefined && newRotation !== undefined) {
      /**
       * @type {THREE.Vector3}
       */
      this.oldRotation = object.rotation.clone();
      /**
       * @type {THREE.Vector3}
       */
      this.newRotation = newRotation.clone();
    }

    if (optionalOldRotation !== undefined) {
      this.oldRotation = optionalOldRotation.clone();
    }
  }

  execute() {
    this.object.rotation.copy(this.newRotation);
    this.object.updateMatrixWorld(true);
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  undo() {
    this.object.rotation.copy(this.oldRotation);
    this.object.updateMatrixWorld(true);
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  update(command) {
    this.newRotation.copy(command.newRotation);
  }

  toJSON() {
    const output = super.toJSON(this);

    output.objectUuid = this.object.uuid;
    output.oldRotation = this.oldRotation.toArray();
    output.newRotation = this.newRotation.toArray();

    return output;
  }

  fromJSON(json) {
    super.fromJSON(json);

    this.object = this.controller.objectByUuid(json.objectUuid);
    this.oldRotation = new THREE.Euler().fromArray(json.oldRotation);
    this.newRotation = new THREE.Euler().fromArray(json.newRotation);
  }
}
