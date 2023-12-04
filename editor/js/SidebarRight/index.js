import { UITabbedPanel, UIDiv } from '../UIKit/UI';

import SSSidebarScene from './Scene/index';
import SEComponent from '../SEComponent';
import SSSidebarProject from './Project';
import SSSidbarRenderer from './Project/Renderer';
import SSSidebarSettings from './Setting';
import SSPropertyObject from './Scene/Object';
import SSPropertyMaterial from './Scene/Material';
// import SSSidebarObject

export default class SESidebar extends SEComponent {
  constructor(controller) {
    const container = new UITabbedPanel();
    container.setId('sidebar');
    super(controller, container.dom);

    // 场景配置
    const sceneComponent = new SSSidebarScene(controller);
    // 场景素材配置 >>> 对象 几何体 材质
    const sceneTab = new UITabbedPanel();
    // object属性
    const objectComponent = new SSPropertyObject(controller);
    // const materialComponent = new ;
    sceneTab.addTab(
      'Object',
      this.controller.strings.getKey('sidebar/properties/object'),
      objectComponent.uiDom
    );
    // sceneTab.addTab('Geometry', "sidebar/properties/geometry", );
    sceneComponent.uiDom.add(sceneTab);

    // 项目
    const projectCom = new SSSidebarProject(controller);
    const renderCom = new SSSidbarRenderer(controller);
    const project = new UIDiv().addDom(projectCom.dom, renderCom.dom);

    // 设置
    const settingCom = new SSSidebarSettings(controller);
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
