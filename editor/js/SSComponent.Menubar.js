import { UIPanel } from './libs/ui';
import SSMenubarAdd from './SSComponent.Menubar.Add';
import SSComponent from './SSComponent';

export default class SSMenubar extends SSComponent {
  constructor(controller) {
    const container = new UIPanel();
    container.setId('menubar');
    super(controller, container.dom);

    // 添加增加按钮
    this.add(new SSMenubarAdd(this.controller));
  }
}
