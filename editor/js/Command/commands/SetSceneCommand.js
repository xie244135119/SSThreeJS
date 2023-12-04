import SetObjectUuidCommand from './SetObjectUuidCommand';
import SetObjectValueCommand from './SetObjectValueCommand';
import AddObjectCommand from './AddObjectCommand';
import SEBaseCommand from './Base';

/**
 * @param controller controller
 * @param scene containing children to import
 * @constructor
 */
export default class SetSceneCommand extends SEBaseCommand {
  constructor(controller, scene) {
    super(controller);

    this.type = 'SetSceneCommand';
    this.name = 'Set Scene';

    this.cmdArray = [];

    if (scene !== undefined) {
      this.cmdArray.push(
        new SetObjectUuidCommand(this.controller, this.controller.scene, scene.uuid)
      );
      this.cmdArray.push(
        new SetObjectValueCommand(this.controller, this.controller.scene, 'name', scene.name)
      );
      this.cmdArray.push(
        new SetObjectValueCommand(
          this.controller,
          this.controller.scene,
          'userData',
          JSON.parse(JSON.stringify(scene.userData))
        )
      );

      while (scene.children.length > 0) {
        const child = scene.children.pop();
        this.cmdArray.push(new AddObjectCommand(this.controller, child));
      }
    }
  }

  execute() {
    this.controller.signals.sceneGraphChanged.active = false;

    for (let i = 0; i < this.cmdArray.length; i++) {
      this.cmdArray[i].execute();
    }

    this.controller.signals.sceneGraphChanged.active = true;
    this.controller.signals.sceneGraphChanged.dispatch();
  }

  undo() {
    this.controller.signals.sceneGraphChanged.active = false;

    for (let i = this.cmdArray.length - 1; i >= 0; i--) {
      this.cmdArray[i].undo();
    }

    this.controller.signals.sceneGraphChanged.active = true;
    this.controller.signals.sceneGraphChanged.dispatch();
  }

  toJSON() {
    const output = super.toJSON(this);

    const cmds = [];
    for (let i = 0; i < this.cmdArray.length; i++) {
      cmds.push(this.cmdArray[i].toJSON());
    }

    output.cmds = cmds;

    return output;
  }

  fromJSON(json) {
    super.fromJSON(json);

    const cmds = json.cmds;
    for (let i = 0; i < cmds.length; i++) {
      const cmd = new window[cmds[i].type](); // creates a new object of type "json.type"
      cmd.fromJSON(cmds[i]);
      this.cmdArray.push(cmd);
    }
  }
}
