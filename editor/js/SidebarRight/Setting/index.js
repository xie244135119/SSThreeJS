import { UIPanel, UIRow, UISelect, UIDiv, UIText } from '../../UIKit/UI';

// import { SidebarSettingsViewport } from './Sidebar.Settings.Viewport.js';
// import { SidebarSettingsShortcuts } from './Sidebar.Settings.Shortcuts.js';
// import { SidebarSettingsHistory } from './Sidebar.Settings.History.js';
import SEComponent from '../../SEComponent';

export default class SESettings extends SEComponent {
  constructor(controller) {
    super(controller);
    // const container = new UIDiv();

    const settings = new UIPanel();
    settings.setBorderTop('0');
    settings.setPaddingTop('20px');
    this.dom = settings.dom;
    this.uiDom = settings;
    // container.add(settings);

    // language
    const options = {
      'zh-cn': '中文',
      'en-us': 'English'
    };

    const languageRow = new UIRow();
    const language = new UISelect().setWidth('150px');
    language.setOptions(options);

    if (this.controller.config.getKey('language') !== undefined) {
      language.setValue(this.controller.config.getKey('language'));
    }

    language.onChange((e) => {
      const value = language.getValue();

      this.controller.config.setKey('language', value);
    });

    languageRow.add(
      new UIText(this.controller.strings.getKey('sidebar/settings/language')).setWidth('90px')
    );
    languageRow.add(language);

    settings.add(languageRow);

    //

    // container.add(new SidebarSettingsViewport(editor));
    // container.add(new SidebarSettingsShortcuts(editor));
    // container.add(new SidebarSettingsHistory(editor));
  }
}
