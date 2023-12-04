import SEBaseCommand from './Base';

/**
 * @param controller controller
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */
export default class SetObjectValueCommand extends SEBaseCommand {
  constructor(controller, object, attributeName, newValue) {
    super(controller);

    this.type = 'SetValueCommand';
    this.name = `Set ${attributeName}`;
    this.updatable = true;

    /**
     * @type {import('three').Object3D}
     */
    this.object = object;
    this.attributeName = attributeName;
    this.oldValue = object !== undefined ? object[attributeName] : undefined;
    this.newValue = newValue;
  }

  execute() {
    this.object[this.attributeName] = this.newValue;
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  undo() {
    this.object[this.attributeName] = this.oldValue;
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  update(cmd) {
    this.newValue = cmd.newValue;
  }

  toJSON() {
    const output = super.toJSON(this);

    output.objectUuid = this.object.uuid;
    output.attributeName = this.attributeName;
    output.oldValue = this.oldValue;
    output.newValue = this.newValue;

    return output;
  }

  fromJSON(json) {
    super.fromJSON(json);

    this.attributeName = json.attributeName;
    this.oldValue = json.oldValue;
    this.newValue = json.newValue;
    this.object = this.controller.objectByUuid(json.objectUuid);
  }
}
