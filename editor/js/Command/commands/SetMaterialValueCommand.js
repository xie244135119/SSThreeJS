import SSBaseCommand from './Base';

/**
 * @param controller controller
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */
export default class SetMaterialValueCommand extends SSBaseCommand {
  constructor(controller, object, attributeName, newValue, materialSlot) {
    super(controller);

    this.type = 'SetMaterialValueCommand';
    this.name = `Set Material.${attributeName}`;
    this.updatable = true;

    this.object = object;
    this.material = this.controller.getObjectMaterial(object, materialSlot);

    this.oldValue = this.material !== undefined ? this.material[attributeName] : undefined;
    this.newValue = newValue;

    this.attributeName = attributeName;
  }

  execute() {
    this.material[this.attributeName] = this.newValue;
    this.material.needsUpdate = true;

    this.controller.signals.objectChanged.dispatch(this.object);
    this.controller.signals.materialChanged.dispatch(this.material);
  }

  undo() {
    this.material[this.attributeName] = this.oldValue;
    this.material.needsUpdate = true;

    this.controller.signals.objectChanged.dispatch(this.object);
    this.controller.signals.materialChanged.dispatch(this.material);
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
