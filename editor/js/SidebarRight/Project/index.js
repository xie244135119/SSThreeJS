import SEComponent from '../../SEComponent';
import {
  UIPanel,
  UIRow,
  UIInput,
  UICheckbox,
  UIText,
  UIDiv,
  UISelect,
  UIBreak
} from '../../UIKit/UI';
import Tool from './Tool/index';
import SERenderer from './Renderer/index';

/* import { SidebarProjectMaterials } from './Sidebar.Project.Materials.js'; */
// import { SidebarProjectRenderer } from './Renderer/index';
// import { SidebarProjectVideo } from './Sidebar.Project.Video.js';

export default class SEProject extends SEComponent {
  constructor(controller) {
    super(controller);

    const container = new UIDiv();
    this.dom = container.dom;
    this.uiDom = container;

    const settings = new UIPanel();
    settings.setBorderTop('0');
    settings.setPaddingTop('20px');
    container.add(settings);

    // Title
    const titleRow = new UIRow();
    titleRow.add(
      new UIText(this.controller.strings.getKey('sidebar/project/title')).setWidth('90px')
    );
    const title = new UIInput(this.controller.config.getKey('project/title'))
      .setLeft('100px')
      .setWidth('150px')
      .onChange(() => {
        this.controller.config.setKey('project/title', this.getValue());
      });
    titleRow.add(title);
    settings.add(titleRow);

    container.add(new UIBreak());

    const renderCom = new SERenderer(controller);
    container.add(renderCom.uiDom);

    container.add(new UIBreak());

    // Title
    const tool = new Tool(this.controller);
    container.add(tool.uiDom);
    // container.dom.append(tool.dom);

    // Editable
    // const editableRow = new UIRow();
    // const editable = new UICheckbox(config.getKey('project/editable'))
    //   .setLeft('100px')
    //   .onChange(function () {
    //     config.setKey('project/editable', this.getValue());
    //   });
    // editableRow.add(new UIText(strings.getKey('sidebar/project/editable')).setWidth('90px'));
    // editableRow.add(editable);
    // settings.add(editableRow);

    // WebVR
    // const vrRow = new UIRow();
    // const vr = new UICheckbox(config.getKey('project/vr')).setLeft('100px').onChange(function () {
    //   config.setKey('project/vr', this.getValue());
    // });
    // vrRow.add(new UIText(strings.getKey('sidebar/project/vr')).setWidth('90px'));
    // vrRow.add(vr);
    // settings.add(vrRow);

    //

    /* container.add( new SidebarProjectMaterials( editor ) ); */

    // if ('SharedArrayBuffer' in window) {
    //   container.add(new SidebarProjectVideo(editor));
    // }

    // Signals

    // signals.editorCleared.add(function () {
    //   title.setValue('');
    //   config.setKey('project/title', '');
    // });

    // return container;
  }
}
