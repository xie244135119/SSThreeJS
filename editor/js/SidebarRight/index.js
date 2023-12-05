import { UITabbedPanel, UIDiv } from '../UIKit/UI';

import SSSidebarScene from './Scene/index';
import SEComponent from '../SEComponent';
import SESidebarProject from './Project';
import SESidbarRenderer from './Project/Renderer';
import SESidebarSettings from './Setting';

export default class SESidebar extends SEComponent {
  constructor(controller) {
    const container = new UITabbedPanel();
    container.setId('sidebar');
    super(controller, container.dom);

    // 场景配置
    const sceneComponent = new SSSidebarScene(controller);

    // 项目
    const projectCom = new SESidebarProject(controller);
    const renderCom = new SESidbarRenderer(controller);
    const project = new UIDiv().addDom(projectCom.dom, renderCom.dom);

    // 设置
    const settingCom = new SESidebarSettings(controller);
    container.addTab(
      'scene',
      this.controller.strings.getKey('sidebar/scene'),
      sceneComponent.uiDom
    );
    container.addTab('project', this.controller.strings.getKey('sidebar/project'), project);
    container.addTab(
      'settings',
      this.controller.strings.getKey('sidebar/settings'),
      settingCom.uiDom
    );

    // 默认选中
    container.select('scene');
  }
}
