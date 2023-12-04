import SEBaseCommand from './Base';

/**
 * @param controller controller
 * @param object THREE.Object3D
 * @param newUuid string
 * @constructor
 */
export default class SetObjectUuidCommand extends SEBaseCommand {
  constructor(controller, object, newUuid) {
    super(controller);

    this.type = 'SetUuidCommand';
    this.name = 'Update UUID';

    /**
     * @type {import('three').Object3D}
     */
    this.object = object;

    /**
     * @type {string}
     */
    this.oldUuid = object !== undefined ? object.uuid : undefined;
    /**
     * @type {string}
     */
    this.newUuid = newUuid;
  }

  execute() {
    this.object.uuid = this.newUuid;
    this.controller.signals.objectChanged.dispatch(this.object);
    this.controller.signals.sceneGraphChanged.dispatch();
  }

  undo() {
    this.object.uuid = this.oldUuid;
    this.controller.signals.objectChanged.dispatch(this.object);
    this.controller.signals.sceneGraphChanged.dispatch();
  }

  toJSON() {
    const output = super.toJSON(this);

    output.oldUuid = this.oldUuid;
    output.newUuid = this.newUuid;

    return output;
  }

  fromJSON(json) {
    super.fromJSON(json);

    this.oldUuid = json.oldUuid;
    this.newUuid = json.newUuid;
    this.object = this.controller.objectByUuid(json.oldUuid);

    if (this.object === undefined) {
      this.object = this.controller.objectByUuid(json.newUuid);
    }
  }
}
