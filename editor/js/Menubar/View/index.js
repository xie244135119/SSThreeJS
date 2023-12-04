import SEComponent from '../../SEComponent';
import { UIPanel, UIRow } from '../../UIKit/UI';

export default class SEMenubarView extends SEComponent {
  constructor(controller) {
    super(controller);
    const { strings } = this.controller;

    const container = new UIPanel();
    container.setClass('menu');
    this.dom = container.dom;
    this.uiDom = container;

    const title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/view'));
    container.add(title);

    const options = new UIPanel();
    options.setClass('options');
    container.add(options);

    // Fullscreen
    const option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/view/fullscreen'));
    option.onClick(() => {
      if (document.fullscreenElement === null) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }

      // Safari
      if (document.webkitFullscreenElement === null) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    });
    options.add(option);

    // VR (Work in progress)
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
          const option = new UIRow();
          option.setClass('option');
          option.setTextContent('VR');
          option.onClick(() => {
            this.controller.signals.toggleVR.dispatch();
          });
          options.add(option);
        }
      });
    }
  }
}
