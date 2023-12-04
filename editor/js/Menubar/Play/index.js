import SEComponent from '../../SEComponent';
import { UIPanel } from '../../UIKit/UI';

export default class SEMenubarPlay extends SEComponent {
  constructor(controller) {
    super(controller);
    const { strings, signals } = this.controller;

    const container = new UIPanel();
    container.setClass('menu');
    this.dom = container.dom;
    this.uiDom = container;

    let isPlaying = false;

    const title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/play'));
    title.onClick(() => {
      if (isPlaying === false) {
        isPlaying = true;
        title.setTextContent(strings.getKey('menubar/play/stop'));
        signals.startPlayer.dispatch();
      } else {
        isPlaying = false;
        title.setTextContent(strings.getKey('menubar/play/play'));
        signals.stopPlayer.dispatch();
      }
    });
    container.add(title);
  }
}
