import * as THREE from 'three';
import { UIPanel, UIBreak, UIRow, UIColor, UISelect, UIText, UINumber } from '../../UIKit/UI';
import { UIOutliner, UITexture } from '../../UIKit/UI.Three';
import SEComponent from '../../SEComponent';

export default class SEScene extends SEComponent {
  constructor(controller) {
    super(controller);
    const container = new UIPanel();
    container.setBorderTop('0');
    container.setPaddingTop('20px');
    this.uiDom = container;
    this.dom = container.dom;

    // outliner
    const nodeStates = new WeakMap();

    function buildOption(object, draggable) {
      const option = document.createElement('div');
      option.draggable = draggable;
      option.innerHTML = buildHTML(object);
      option.value = object.id;

      // opener

      if (nodeStates.has(object)) {
        const state = nodeStates.get(object);

        const opener = document.createElement('span');
        opener.classList.add('opener');

        if (object.children.length > 0) {
          opener.classList.add(state ? 'open' : 'closed');
        }

        opener.addEventListener('click', () => {
          nodeStates.set(object, nodeStates.get(object) === false); // toggle
          refreshUI();
        });

        option.insertBefore(opener, option.firstChild);
      }

      return option;
    }

    function getMaterialName(material) {
      if (Array.isArray(material)) {
        const array = [];

        for (let i = 0; i < material.length; i++) {
          array.push(material[i].name);
        }

        return array.join(',');
      }

      return material.name;
    }

    function escapeHTML(html) {
      return html
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function getObjectType(object) {
      if (object.isScene) return 'Scene';
      if (object.isCamera) return 'Camera';
      if (object.isLight) return 'Light';
      if (object.isMesh) return 'Mesh';
      if (object.isLine) return 'Line';
      if (object.isPoints) return 'Points';

      return 'Object3D';
    }

    const getScript = (uuid) => {
      if (this.controller.scripts?.[uuid] !== undefined) {
        return ' <span class="type Script"></span>';
      }
      return '';
    };

    function buildHTML(object) {
      let html = `<span class="type ${getObjectType(object)}"></span> ${escapeHTML(
        object.name || object.type
      )}`;

      if (object.isMesh) {
        const { geometry } = object;
        const { material } = object;

        html += ` <span class="type Geometry"></span> ${escapeHTML(geometry.name)}`;
        html += ` <span class="type Material"></span> ${escapeHTML(getMaterialName(material))}`;
      }

      html += getScript(object.uuid);

      return html;
    }

    // let ignoreObjectSelectedSignal = false;

    // background
    const backgroundRow = new UIRow();
    const backgroundType = new UISelect()
      .setOptions({
        None: '',
        Color: 'Color',
        Texture: 'Texture',
        Equirectangular: 'Equirect'
      })
      .setWidth('150px');
    backgroundRow.add(
      new UIText(this.controller.strings.getKey('sidebar/scene/background')).setWidth('90px')
    );
    backgroundRow.add(backgroundType);

    const backgroundColor = new UIColor();
    backgroundColor.setValue('#000000').setMarginLeft('8px');
    backgroundRow.add(backgroundColor);
    // 环境贴图
    const backgroundTexture = new UITexture().setMarginLeft('8px');
    backgroundTexture.setDisplay('none');
    backgroundRow.add(backgroundTexture);

    const backgroundEquirectangularTexture = new UITexture();
    backgroundEquirectangularTexture.setMarginLeft('8px');
    backgroundEquirectangularTexture.setDisplay('none');
    backgroundRow.add(backgroundEquirectangularTexture);
    container.add(backgroundRow);

    const backgroundEquirectRow = new UIRow();
    backgroundEquirectRow.setDisplay('none');
    backgroundEquirectRow.setMarginLeft('90px');

    const backgroundBlurriness = new UINumber(0);
    backgroundBlurriness.setWidth('40px').setRange(0, 1);
    backgroundEquirectRow.add(backgroundBlurriness);

    const backgroundIntensity = new UINumber(1);
    backgroundIntensity.setWidth('40px').setRange(0, Infinity);
    backgroundEquirectRow.add(backgroundIntensity);

    container.add(backgroundEquirectRow);

    const onBackgroundChanged = () => {
      this.controller.signals.sceneBackgroundChanged.dispatch(
        backgroundType.getValue(),
        backgroundColor.getHexValue(),
        backgroundTexture.getValue(),
        backgroundEquirectangularTexture.getValue(),
        backgroundBlurriness.getValue(),
        backgroundIntensity.getValue()
      );
    };
    const refreshBackgroundUI = () => {
      const type = backgroundType.getValue();

      backgroundType.setWidth(type === 'None' ? '150px' : '110px');
      backgroundColor.setDisplay(type === 'Color' ? '' : 'none');
      backgroundTexture.setDisplay(type === 'Texture' ? '' : 'none');
      backgroundEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none');
      backgroundEquirectRow.setDisplay(type === 'Equirectangular' ? '' : 'none');
    };
    backgroundIntensity.onChange(onBackgroundChanged);
    backgroundBlurriness.onChange(onBackgroundChanged);
    backgroundEquirectangularTexture.onChange(onBackgroundChanged);
    backgroundTexture.onChange(onBackgroundChanged);
    backgroundColor.onInput(onBackgroundChanged);
    backgroundType.onChange(() => {
      onBackgroundChanged();
      refreshBackgroundUI();
    });

    // environment
    const environmentRow = new UIRow();
    const environmentType = new UISelect();
    environmentType
      .setOptions({
        None: '',
        Equirectangular: 'Equirect',
        ModelViewer: 'ModelViewer'
      })
      .setWidth('150px');
    environmentType.setValue('None');
    environmentRow.add(
      new UIText(this.controller.strings.getKey('sidebar/scene/environment')).setWidth('90px')
    );
    environmentRow.add(environmentType);
    container.add(environmentRow);
    const environmentEquirectangularTexture = new UITexture();
    environmentEquirectangularTexture.setMarginLeft('8px');

    environmentEquirectangularTexture.setDisplay('none');
    environmentRow.add(environmentEquirectangularTexture);
    // 环境改变的时候
    const onEnvironmentChanged = () => {
      this.controller.signals.sceneEnvironmentChanged.dispatch(
        environmentType.getValue(),
        environmentEquirectangularTexture.getValue()
      );
    };
    // 刷新环境ui 处理
    const refreshEnvironmentUI = () => {
      const type = environmentType.getValue();
      environmentType.setWidth(type !== 'Equirectangular' ? '150px' : '110px');
      environmentEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none');
    };
    //
    environmentType.onChange((e) => {
      onEnvironmentChanged();
      refreshEnvironmentUI();
    });
    environmentEquirectangularTexture.onChange(onEnvironmentChanged);

    // fog
    const fogTypeRow = new UIRow();
    const fogType = new UISelect().setOptions({
      None: '',
      Fog: 'Linear',
      FogExp2: 'Exponential'
    });
    fogType.setWidth('150px');
    fogTypeRow.add(
      new UIText(this.controller.strings.getKey('sidebar/scene/fog')).setWidth('90px')
    );
    fogTypeRow.add(fogType);
    container.add(fogTypeRow);

    // fog color
    const fogPropertiesRow = new UIRow();
    fogPropertiesRow.setDisplay('none');
    fogPropertiesRow.setMarginLeft('90px');
    container.add(fogPropertiesRow);

    const fogColor = new UIColor();
    fogColor.setValue('#aaaaaa');
    fogPropertiesRow.add(fogColor);

    // fog near
    const fogNear = new UINumber(0.1);
    fogNear.setWidth('40px').setRange(0, Infinity);
    fogPropertiesRow.add(fogNear);

    // fog far
    const fogFar = new UINumber(50);
    fogFar.setWidth('40px').setRange(0, Infinity);
    fogPropertiesRow.add(fogFar);

    // fog density
    const fogDensity = new UINumber(0.05);
    fogDensity.setWidth('40px').setRange(0, 0.1).setStep(0.001).setPrecision(3);
    fogPropertiesRow.add(fogDensity);

    const refreshFogUI = () => {
      const type = fogType.getValue();

      fogPropertiesRow.setDisplay(type === 'None' ? 'none' : '');
      fogNear.setDisplay(type === 'Fog' ? '' : 'none');
      fogFar.setDisplay(type === 'Fog' ? '' : 'none');
      fogDensity.setDisplay(type === 'FogExp2' ? '' : 'none');
    };

    const onFogChanged = () => {
      this.controller.signals.sceneFogChanged.dispatch(
        fogType.getValue(),
        fogColor.getHexValue(),
        fogNear.getValue(),
        fogFar.getValue(),
        fogDensity.getValue()
      );
    };

    const onFogSettingsChanged = () => {
      this.controller.signals.sceneFogSettingsChanged.dispatch(
        fogType.getValue(),
        fogColor.getHexValue(),
        fogNear.getValue(),
        fogFar.getValue(),
        fogDensity.getValue()
      );
    };

    fogType.onChange(() => {
      onFogChanged();
      refreshFogUI();
    });
    fogColor.onInput(onFogSettingsChanged);
    fogNear.onChange(onFogSettingsChanged);
    fogFar.onChange(onFogSettingsChanged);
    fogDensity.onChange(onFogSettingsChanged);

    //
    const refreshUI = () => {
      const { camera } = this.controller;
      const { scene } = this.controller;

      if (scene.background) {
        if (scene.background.isColor) {
          backgroundType.setValue('Color');
          backgroundColor.setHexValue(scene.background.getHex());
        } else if (scene.background.isTexture) {
          if (scene.background.mapping === THREE.EquirectangularReflectionMapping) {
            backgroundType.setValue('Equirectangular');
            backgroundEquirectangularTexture.setValue(scene.background);
            backgroundBlurriness.setValue(scene.backgroundBlurriness);
            backgroundIntensity.setValue(scene.backgroundIntensity);
          } else {
            backgroundType.setValue('Texture');
            backgroundTexture.setValue(scene.background);
          }
        }
      } else {
        backgroundType.setValue('None');
      }

      if (scene.environment) {
        if (scene.environment.mapping === THREE.EquirectangularReflectionMapping) {
          environmentType.setValue('Equirectangular');
          environmentEquirectangularTexture.setValue(scene.environment);
        }
      } else {
        environmentType.setValue('None');
      }

      if (scene.fog) {
        fogColor.setHexValue(scene.fog.color.getHex());

        if (scene.fog.isFog) {
          fogType.setValue('Fog');
          fogNear.setValue(scene.fog.near);
          fogFar.setValue(scene.fog.far);
        } else if (scene.fog.isFogExp2) {
          fogType.setValue('FogExp2');
          fogDensity.setValue(scene.fog.density);
        }
      } else {
        fogType.setValue('None');
      }

      refreshBackgroundUI();
      refreshEnvironmentUI();
      refreshFogUI();
    };

    refreshUI();

    // 数据清空的时候
    this.controller.signals.editorCleared.add(refreshUI);
    // 场景数据变化
    this.controller.signals.sceneGraphChanged.add(refreshUI);
    this.controller.signals.objectSelected.add((object) => {
      // if (ignoreObjectSelectedSignal === true) return;
      if (object !== null && object.parent !== null) {
        let needsRefresh = false;
        let { parent } = object;

        while (parent !== this.controller.scene) {
          if (nodeStates.get(parent) !== true) {
            nodeStates.set(parent, true);
            needsRefresh = true;
          }

          parent = parent.parent;
        }

        if (needsRefresh) refreshUI();

        // outliner.setValue(object.id);
      } else {
        // outliner.setValue(null);
      }
    });
  }
}