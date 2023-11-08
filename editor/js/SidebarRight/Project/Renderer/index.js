import * as THREE from 'three';

import { UINumber, UIPanel, UIRow, UISelect, UIText } from '../../../UIKit/UI';
import { UIBoolean } from '../../../UIKit/UI.Three';
import SEComponent from '../../../SEComponent';

export default class SERenderer extends SEComponent {
  constructor(controller) {
    super(controller);
    let currentRenderer = null;

    const container = new UIPanel();
    this.dom = container.dom;

    const headerRow = new UIRow();
    headerRow.add(
      new UIText(this.controller.strings.getKey('sidebar/project/renderer').toUpperCase())
    );
    container.add(headerRow);

    // Antialias

    const antialiasRow = new UIRow();
    container.add(antialiasRow);

    antialiasRow.add(
      new UIText(this.controller.strings.getKey('sidebar/project/antialias')).setWidth('90px')
    );

    const antialiasBoolean = new UIBoolean(
      this.controller.config.getKey('project/renderer/antialias')
    ).onChange(createRenderer);
    antialiasRow.add(antialiasBoolean);

    // Shadows

    const shadowsRow = new UIRow();
    container.add(shadowsRow);

    shadowsRow.add(
      new UIText(this.controller.strings.getKey('sidebar/project/shadows')).setWidth('90px')
    );

    const shadowsBoolean = new UIBoolean(
      this.controller.config.getKey('project/renderer/shadows')
    ).onChange(updateShadows);
    shadowsRow.add(shadowsBoolean);

    const shadowTypeSelect = new UISelect()
      .setOptions({
        0: 'Basic',
        1: 'PCF',
        2: 'PCF Soft'
        //	3: 'VSM'
      })
      .setWidth('125px')
      .onChange(updateShadows);
    shadowTypeSelect.setValue(this.controller.config.getKey('project/renderer/shadowType'));
    shadowsRow.add(shadowTypeSelect);

    function updateShadows() {
      currentRenderer.shadowMap.enabled = shadowsBoolean.getValue();
      currentRenderer.shadowMap.type = parseFloat(shadowTypeSelect.getValue());

      // signals.rendererUpdated.dispatch();
    }

    // Tonemapping

    const toneMappingRow = new UIRow();
    container.add(toneMappingRow);

    toneMappingRow.add(
      new UIText(this.controller.strings.getKey('sidebar/project/toneMapping')).setWidth('90px')
    );

    const toneMappingSelect = new UISelect()
      .setOptions({
        0: 'No',
        1: 'Linear',
        2: 'Reinhard',
        3: 'Cineon',
        4: 'ACESFilmic'
      })
      .setWidth('120px')
      .onChange(updateToneMapping);
    toneMappingSelect.setValue(this.controller.config.getKey('project/renderer/toneMapping'));
    toneMappingRow.add(toneMappingSelect);

    const toneMappingExposure = new UINumber(
      this.controller.config.getKey('project/renderer/toneMappingExposure')
    );
    toneMappingExposure.setDisplay(toneMappingSelect.getValue() === '0' ? 'none' : '');
    toneMappingExposure.setWidth('30px').setMarginLeft('10px');
    toneMappingExposure.setRange(0, 10);
    toneMappingExposure.onChange(updateToneMapping);
    toneMappingRow.add(toneMappingExposure);

    function updateToneMapping() {
      toneMappingExposure.setDisplay(toneMappingSelect.getValue() === '0' ? 'none' : '');
      currentRenderer.toneMapping = parseFloat(toneMappingSelect.getValue());
      currentRenderer.toneMappingExposure = toneMappingExposure.getValue();
      // signals.rendererUpdated.dispatch();
    }

    //

    function createRenderer() {
      currentRenderer = new THREE.WebGLRenderer({ antialias: antialiasBoolean.getValue() });
      currentRenderer.shadowMap.enabled = shadowsBoolean.getValue();
      currentRenderer.shadowMap.type = parseFloat(shadowTypeSelect.getValue());
      currentRenderer.toneMapping = parseFloat(toneMappingSelect.getValue());
      currentRenderer.toneMappingExposure = toneMappingExposure.getValue();

      // signals.rendererCreated.dispatch(currentRenderer);
      // signals.rendererUpdated.dispatch();
    }

    createRenderer();

    // Signals

    // signals.editorCleared.add(function () {
    //   currentRenderer.shadowMap.enabled = true;
    //   currentRenderer.shadowMap.type = THREE.PCFShadowMap;
    //   currentRenderer.toneMapping = THREE.NoToneMapping;
    //   currentRenderer.toneMappingExposure = 1;

    //   shadowsBoolean.setValue(currentRenderer.shadowMap.enabled);
    //   shadowTypeSelect.setValue(currentRenderer.shadowMap.type);
    //   toneMappingSelect.setValue(currentRenderer.toneMapping);
    //   toneMappingExposure.setValue(currentRenderer.toneMappingExposure);
    //   toneMappingExposure.setDisplay(currentRenderer.toneMapping === 0 ? 'none' : '');

    //   signals.rendererUpdated.dispatch();
    // });

    // signals.rendererUpdated.add(function () {
    //   config.setKey(
    //     'project/renderer/antialias',
    //     antialiasBoolean.getValue(),
    //     'project/renderer/shadows',
    //     shadowsBoolean.getValue(),
    //     'project/renderer/shadowType',
    //     parseFloat(shadowTypeSelect.getValue()),
    //     'project/renderer/toneMapping',
    //     parseFloat(toneMappingSelect.getValue()),
    //     'project/renderer/toneMappingExposure',
    //     toneMappingExposure.getValue()
    //   );
    // });

    // return container;
  }
}
