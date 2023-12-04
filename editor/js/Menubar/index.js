import { UIPanel } from '../UIKit/UI';
import SEMenubarAdd from './Add';
import SEMenubarFile from './File';
import SEComponent from '../SEComponent';
import SEMenubarEdit from './Edit';
import SEMenubarPlay from './Play';
import SEMenubarView from './View';
import SEMenubarHelp from './Help';

export default class SEMenubar extends SEComponent {
  constructor(controller) {
    const container = new UIPanel();
    container.setId('menubar');
    super(controller, container.dom);

    // 文件按钮
    this.add(new SEMenubarFile(this.controller));
    // 添加增加按钮
    this.add(new SEMenubarAdd(this.controller));
    // 编辑按钮
    this.add(new SEMenubarEdit(this.controller));
    // 播放按钮
    this.add(new SEMenubarPlay(this.controller));
    // 视图按钮
    this.add(new SEMenubarView(this.controller));
    // 帮助按钮
    this.add(new SEMenubarHelp(this.controller));
  }
}
