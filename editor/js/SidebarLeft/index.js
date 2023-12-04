import { UIDiv } from '../UIKit/UI';
import SEComponent from '../SEComponent';
import SSSliderTree from './ProjectTree';
import SESidebarLibrary from './Library';

export default class SELeftSidebar extends SEComponent {
  constructor(controller) {
    super(controller);
    const container = new UIDiv();
    container.setClass('leftsidebar');
    this.dom = container.dom;
    this.uiDom = container;

    // 项目
    const treeCom = new SSSliderTree(controller);
    container.add(treeCom.uiDom);

    // 模型库
    const modellib = new SESidebarLibrary(controller);
    container.add(modellib.uiDom);
  }
}
