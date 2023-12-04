import * as THREE from 'three';

import { UIPanel, UIRow, UIHorizontalRule } from '../../UIKit/UI';
import SEComponent from '../../SEComponent';
import SECommands from '../../Command/commands';

// import { AddObjectCommand } from './commands/AddObjectCommand.js';
// import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';
// import { SetPositionCommand } from './commands/SetPositionCommand.js';
// import { clone } from '../../examples/jsm/utils/SkeletonUtils.js';

export default class SEMenubarEdit extends SEComponent {
  constructor(controller) {
    super(controller);
    const { strings } = this.controller;

    const container = new UIPanel();
    container.setClass('menu');
    this.dom = container.dom;
    this.uiDom = container;

    const title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/edit'));
    container.add(title);

    const options = new UIPanel();
    options.setClass('options');
    container.add(options);

    // Undo

    const undo = new UIRow();
    undo.setClass('option');
    undo.setTextContent(strings.getKey('menubar/edit/undo'));
    undo.onClick(() => {
      this.controller.undo();
    });
    options.add(undo);

    // Redo

    const redo = new UIRow();
    redo.setClass('option');
    redo.setTextContent(strings.getKey('menubar/edit/redo'));
    redo.onClick(() => {
      this.controller.redo();
    });
    options.add(redo);

    // Clear History

    let option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/edit/clear_history'));
    option.onClick(() => {
      // if (confirm('The Undo/Redo History will be cleared. Are you sure?')) {
      //   this.controller.history.clear();
      // }
    });
    options.add(option);

    this.controller.signals.historyChanged.add(() => {
      const { history } = this.controller;

      undo.setClass('option');
      redo.setClass('option');

      if (history.undos.length === 0) {
        undo.setClass('inactive');
      }

      if (history.redos.length === 0) {
        redo.setClass('inactive');
      }
    });

    // ---

    options.add(new UIHorizontalRule());

    // Center

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/edit/center'));
    option.onClick(() => {
      const object = this.controller.selected;

      if (object === null || object.parent === null) return; // avoid centering the camera or scene

      const aabb = new THREE.Box3().setFromObject(object);
      const center = aabb.getCenter(new THREE.Vector3());
      const newPosition = new THREE.Vector3();

      newPosition.x = object.position.x + (object.position.x - center.x);
      newPosition.y = object.position.y + (object.position.y - center.y);
      newPosition.z = object.position.z + (object.position.z - center.z);

      this.controller.execute(
        new SECommands.SetObjectPositionCommand(this.controller, object, newPosition)
      );
    });
    options.add(option);

    // Clone

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/edit/clone'));
    option.onClick(() => {
      // let object = this.controller.selected;
      // if (object === null || object.parent === null) return; // avoid cloning the camera or scene
      // object = clone(object);
      // this.controller.execute(new SECommands.AddObjectCommand(this.controller, object));
    });
    options.add(option);

    // Delete

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/edit/delete'));
    option.onClick(() => {
      const object = this.controller.selected;

      // if (object !== null && object.parent !== null) {
      //   this.controller.execute(new RemoveObjectCommand(editor, object));
      // }
    });
    options.add(option);

    //

    options.add(new UIHorizontalRule());

    // Set textures to sRGB. See #15903

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/edit/fixcolormaps'));
    option.onClick(() => {
      // this.controller.scene.traverse(fixColorMap);
    });
    options.add(option);
  }

  fixColorMap(obj) {
    // const { material } = obj;
    // if (material !== undefined) {
    //   if (Array.isArray(material) === true) {
    //     for (let i = 0; i < material.length; i++) {
    //       fixMaterial(material[i]);
    //     }
    //   } else {
    //     fixMaterial(material);
    //   }
    //   this.controller.signals.sceneGraphChanged.dispatch();
  }

  fixMaterial(material) {
    const colorMaps = ['map', 'envMap', 'emissiveMap'];
    let { needsUpdate } = material;

    for (let i = 0; i < colorMaps.length; i++) {
      const map = material[colorMaps[i]];

      if (map) {
        map.colorSpace = THREE.SRGBColorSpace;
        needsUpdate = true;
      }
    }

    material.needsUpdate = needsUpdate;
  }
}
