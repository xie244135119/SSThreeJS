import SEBaseCommand from './Base';

/**
 * @param controller controller
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue integer representing a hex color value
 * @constructor
 */
export default class SetColorCommand extends SEBaseCommand {
  constructor(controller, object, attributeName, newValue) {
    super(controller);

    this.type = 'SetColorCommand';
    this.name = `Set ${attributeName}`;
    this.updatable = true;

    /**
     * @type {import('three').Object3D}
     */
    this.object = object;
    this.attributeName = attributeName;
    this.oldValue = object !== undefined ? this.object[this.attributeName].getHex() : undefined;
    this.newValue = newValue;
  }

  execute() {
    this.object[this.attributeName].setHex(this.newValue);
    this.controller.signals.objectChanged.dispatch(this.object);
  }

  undo() {
    this.object[this.attributeName].setHex(this.oldValue);
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

    this.object = this.controller.objectByUuid(json.objectUuid);
    this.attributeName = json.attributeName;
    this.oldValue = json.oldValue;
    this.newValue = json.newValue;
  }
}
