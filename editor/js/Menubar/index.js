import { UIPanel } from '../UIKit/UI';
import SEMenubarAdd from './Add';
import SEComponent from '../SEComponent';

export default class SEMenubar extends SEComponent {
  constructor(controller) {
    const container = new UIPanel();
    container.setId('menubar');
    super(controller, container.dom);

    // 添加增加按钮
    this.add(new SEMenubarAdd(this.controller));
  }
}
