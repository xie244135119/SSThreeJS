import * as THREE from 'three';
import SEBaseCommand from './Base';

export default class SetPositionCommand extends SEBaseCommand {
  constructor(controller, object, newPosition, optionalOldPosition) {
    super(controller);

    this.type = 'SetPositionCommand';
    this.name = 'Set Position';
    this.updatable = true;

    /**
     * @type {THREE.Object3D}
     */
    this.object = object;

    if (object !== undefined && newPosition !== undefined) {
      /**
       * @type {THREE.Vector3}
       */
      this.oldPosition = object.position.clone();
      /**
       * @type {THREE.Vector3}
       */
      this.newPosition = newPosition.clone();
    }

    if (optionalOldPosition !== undefined) {
      this.oldPosition = optionalOldPosition.clone();
    }
  }

  execute() {
    this.object.position.copy(this.newPosition);
    this.object.updateMatrixWorld(true);
    console.log(' 位置更新 ', this.newPosition, this.object);
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  undo() {
    this.object.position.copy(this.oldPosition);
    this.object.updateMatrixWorld(true);
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  update(command) {
    this.newPosition.copy(command.newPosition);
  }

  toJSON() {
    const output = super.toJSON(this);

    output.objectUuid = this.object.uuid;
    output.oldPosition = this.oldPosition.toArray();
    output.newPosition = this.newPosition.toArray();

    return output;
  }

  fromJSON(json) {
    super.fromJSON(json);

    this.object = this.controller.objectByUuid(json.objectUuid);
    this.oldPosition = new THREE.Vector3().fromArray(json.oldPosition);
    this.newPosition = new THREE.Vector3().fromArray(json.newPosition);
  }
}
