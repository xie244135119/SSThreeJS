import { UITabbedPanel, UISpan } from './libs/ui';

import SSSidebarScene from './SSComponent.Sidebar.Material';
import SSComponent from './SSComponent';

export default class SSSidebar extends SSComponent {
  constructor(controller) {
    const container = new UITabbedPanel();
    container.setId('sidebar');
    super(controller, container.dom);

    const scene = new UISpan().add(
      new SSSidebarScene(controller)
      // new SidebarProperties(editor),
      // new SidebarAnimation(editor),
      // new SidebarScript(editor)
    );
    // const project = new SidebarProject(editor);
    // const settings = new SidebarSettings(editor);

    container.addTab('scene', 'Scene', scene.dom);
    container.select('scene');
  }
}
