export default class SSCommandHistory {
  /**
   * 全部执行的指令集
   * @type {import('./commands/Base').default[]}
   */
  undos = null;

  /**
   * 撤销的指令集
   * @type {import('./commands/Base').default[]}
   */
  redos = null;

  /**
   * 上次指令执行的时间
   * @param {Date} editor
   */
  lastCmdTime = null;

  constructor(editor) {
    // this.editor = editor;
    this.undos = [];
    this.redos = [];
    this.lastCmdTime = Date.now();
    this.idCounter = 0;

    this.historyDisabled = false;
    // this.config = editor.config;

    // signals

    // const scope = this;
    // this.editor.signals.startPlayer.add(function () {
    //   scope.historyDisabled = true;
    // });

    // this.editor.signals.stopPlayer.add(function () {
    //   scope.historyDisabled = false;
    // });
  }

  /**
   * 执行指令
   * @param {import('./commands/Base').default} commpand
   * @param {string} optionalName
   */
  execute(commpand, optionalName) {
    const lastCmd = this.undos[this.undos.length - 1];
    const timeDifference = Date.now() - this.lastCmdTime;

    const isUpdatableCmd =
      lastCmd &&
      lastCmd.updatable &&
      commpand.updatable &&
      lastCmd.object === commpand.object &&
      lastCmd.type === commpand.type &&
      lastCmd.script === commpand.script &&
      lastCmd.attributeName === commpand.attributeName;

    let newcmd = commpand;
    if (isUpdatableCmd && newcmd.type === 'SetScriptValueCommand') {
      // When the cmd.type is "SetScriptValueCommand" the timeDifference is ignored

      lastCmd.update(newcmd);
      newcmd = lastCmd;
    } else if (isUpdatableCmd && timeDifference < 500) {
      lastCmd.update(newcmd);
      newcmd = lastCmd;
    } else {
      // the command is not updatable and is added as a new part of the history

      this.undos.push(newcmd);
      newcmd.id = ++this.idCounter;
    }

    newcmd.name = optionalName !== undefined ? optionalName : newcmd.name;
    newcmd.execute();
    newcmd.inMemory = true;

    // if (this.config.getKey('settings/history')) {
    //   newcmd.json = newcmd.toJSON(); // serialize the cmd immediately after execution and append the json to the cmd
    // }

    this.lastCmdTime = Date.now();

    // clearing all the redo-commands

    this.redos = [];
    // this.editor.signals.historyChanged.dispatch(newcmd);
  }

  undo() {
    if (this.historyDisabled) {
      alert('Undo/Redo disabled while scene is playing.');
      return null;
    }

    let cmd;

    if (this.undos.length > 0) {
      cmd = this.undos.pop();

      if (cmd.inMemory === false) {
        cmd.fromJSON(cmd.json);
      }
    }

    if (cmd !== undefined) {
      cmd.undo();
      this.redos.push(cmd);
      this.editor.signals.historyChanged.dispatch(cmd);
    }

    return cmd;
  }

  redo() {
    if (this.historyDisabled) {
      alert('Undo/Redo disabled while scene is playing.');
      return null;
    }

    let cmd;

    if (this.redos.length > 0) {
      cmd = this.redos.pop();

      if (cmd.inMemory === false) {
        cmd.fromJSON(cmd.json);
      }
    }

    if (cmd !== undefined) {
      cmd.execute();
      this.undos.push(cmd);
      this.editor.signals.historyChanged.dispatch(cmd);
    }

    return cmd;
  }

  toJSON() {
    const history = {};
    history.undos = [];
    history.redos = [];

    if (!this.config.getKey('settings/history')) {
      return history;
    }

    // Append Undos to History

    for (let i = 0; i < this.undos.length; i++) {
      if (Object.prototype.hasOwnProperty.call(this.undos[i], 'json')) {
        history.undos.push(this.undos[i].json);
      }
    }

    // Append Redos to History
    for (let i = 0; i < this.redos.length; i++) {
      if (Object.prototype.hasOwnProperty.call(this.redos[i], 'json')) {
        history.redos.push(this.redos[i].json);
      }
    }

    return history;
  }

  fromJSON(json) {
    // if (json === undefined) return;
    // for (let i = 0; i < json.undos.length; i++) {
    //   const cmdJSON = json.undos[i];
    //   const cmd = new Commands[cmdJSON.type](this.editor); // creates a new object of type "json.type"
    //   cmd.json = cmdJSON;
    //   cmd.id = cmdJSON.id;
    //   cmd.name = cmdJSON.name;
    //   this.undos.push(cmd);
    //   this.idCounter = cmdJSON.id > this.idCounter ? cmdJSON.id : this.idCounter; // set last used idCounter
    // }
    // for (let i = 0; i < json.redos.length; i++) {
    //   const cmdJSON = json.redos[i];
    //   const cmd = new Commands[cmdJSON.type](this.editor); // creates a new object of type "json.type"
    //   cmd.json = cmdJSON;
    //   cmd.id = cmdJSON.id;
    //   cmd.name = cmdJSON.name;
    //   this.redos.push(cmd);
    //   this.idCounter = cmdJSON.id > this.idCounter ? cmdJSON.id : this.idCounter; // set last used idCounter
    // }
    // // Select the last executed undo-command
    // this.editor.signals.historyChanged.dispatch(this.undos[this.undos.length - 1]);
  }

  clear() {
    this.undos = [];
    this.redos = [];
    this.idCounter = 0;

    this.editor.signals.historyChanged.dispatch();
  }

  // goToState(id) {
  //   if (this.historyDisabled) {
  //     alert('Undo/Redo disabled while scene is playing.');
  //     return;
  //   }

  //   this.editor.signals.sceneGraphChanged.active = false;
  //   this.editor.signals.historyChanged.active = false;

  //   let cmd = this.undos.length > 0 ? this.undos[this.undos.length - 1] : undefined; // next cmd to pop

  //   if (cmd === undefined || id > cmd.id) {
  //     cmd = this.redo();
  //     while (cmd !== undefined && id > cmd.id) {
  //       cmd = this.redo();
  //     }
  //   } else {
  //     while (true) {
  //       cmd = this.undos[this.undos.length - 1]; // next cmd to pop

  //       if (cmd === undefined || id === cmd.id) break;

  //       this.undo();
  //     }
  //   }

  //   this.editor.signals.sceneGraphChanged.active = true;
  //   this.editor.signals.historyChanged.active = true;

  //   this.editor.signals.sceneGraphChanged.dispatch();
  //   this.editor.signals.historyChanged.dispatch(cmd);
  // }

  // enableSerialization(id) {
  //   /**
  //    * because there might be commands in this.undos and this.redos
  //    * which have not been serialized with .toJSON() we go back
  //    * to the oldest command and redo one command after the other
  //    * while also calling .toJSON() on them.
  //    */

  //   this.goToState(-1);

  //   this.editor.signals.sceneGraphChanged.active = false;
  //   this.editor.signals.historyChanged.active = false;

  //   let cmd = this.redo();
  //   while (cmd !== undefined) {
  //     if (!cmd.hasOwnProperty('json')) {
  //       cmd.json = cmd.toJSON();
  //     }

  //     cmd = this.redo();
  //   }

  //   this.editor.signals.sceneGraphChanged.active = true;
  //   this.editor.signals.historyChanged.active = true;

  //   this.goToState(id);
  // }
}
