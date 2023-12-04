import * as THREE from 'three';
import { UIPanel, UIText } from '../../UIKit/UI';
import { UIBoolean } from '../../UIKit/UI.Three';
import SEComponent from '../../SEComponent';

export default class SEMenubarStatus extends SEComponent {
  constructor(controller) {
    super(controller);
    const { strings, config } = this.controller;

    const container = new UIPanel();
    container.setClass('menu right');
    this.dom = container.dom;
    this.uiDom = container;

    const autosave = new UIBoolean(
      this.controller.config.getKey('autosave'),
      strings.getKey('menubar/status/autosave')
    );
    autosave.text.setColor('#888');
    autosave.onChange(() => {
      const value = this.getValue();

      config.setKey('autosave', value);

      if (value === true) {
        this.controller.signals.sceneGraphChanged.dispatch();
      }
    });
    container.add(autosave);

    this.controller.signals.savingStarted.add(() => {
      autosave.text.setTextDecoration('underline');
    });

    this.controller.signals.savingFinished.add(() => {
      autosave.text.setTextDecoration('none');
    });

    const version = new UIText(`r${THREE.REVISION}`);
    version.setClass('title');
    version.setOpacity(0.5);
    container.add(version);
  }
}
