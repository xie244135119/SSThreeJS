import SEComponent from '../../SEComponent';
import { UIPanel, UIRow } from '../../UIKit/UI';

export default class SEMenubarHelp extends SEComponent {
  constructor(controller) {
    super(controller);
    const { strings } = this.controller;

    const container = new UIPanel();
    container.setClass('menu');
    this.dom = container.dom;
    this.uiDom = container;

    const title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/help'));
    container.add(title);

    const options = new UIPanel();
    options.setClass('options');
    container.add(options);

    // About
    const option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/help/about'));
    option.onClick(() => {
      window.open('https://threejs.org', '_blank');
    });
    options.add(option);
  }
}
