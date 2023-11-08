import * as THREE from 'three';
import { UIPanel, UIBreak, UIRow, UIColor, UISelect, UIText, UINumber } from '../../UIKit/UI';
import { UIOutliner, UITexture } from '../../UIKit/UI.Three';
import SEComponent from '../../SEComponent';

export default class SSSliderTree extends SEComponent {
  destory() {
    // 工作区监听
    this.dom.removeEventListener('dragover', this.onDragOver);

    // 工作区监听 模型拖入处理
    this.dom.removeEventListener('drop', this.onDrop);
  }

  constructor(controller) {
    super(controller);
    const container = new UIPanel();
    container.setBorderTop('0');
    // container.setPaddingTop('20px');
    container.setStyle('flex', '1');
    container.setStyle('overflow', ['auto']);
    this.uiDom = container;
    this.dom = container.dom;
    // 工作区监听
    container.dom.addEventListener('dragover', this.onDragOver);

    // 工作区监听 模型拖入处理
    container.dom.addEventListener('drop', this.onDrop);

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

    let ignoreObjectSelectedSignal = false;

    // 场景目录树形结构
    const outliner = new UIOutliner(this.controller);
    outliner.setId('outliner');
    outliner.setHeight('100%');
    outliner.onChange(() => {
      ignoreObjectSelectedSignal = true;

      this.controller.selectById(parseInt(outliner.getValue(), 10));

      ignoreObjectSelectedSignal = false;
    });
    outliner.onDblClick(() => {
      this.controller.focusById(parseInt(outliner.getValue(), 10));
    });
    container.add(outliner);

    // 刷新ui
    const refreshUI = () => {
      const { camera } = this.controller;
      const { scene } = this.controller;

      const options = [];

      options.push(buildOption(camera, false));
      options.push(buildOption(scene, false));

      function addObjects(objects, pad) {
        for (let i = 0, l = objects.length; i < l; i++) {
          const object = objects[i];

          if (nodeStates.has(object) === false) {
            nodeStates.set(object, false);
          }

          const option = buildOption(object, true);
          option.style.paddingLeft = `${pad * 18}px`;
          options.push(option);

          if (nodeStates.get(object) === true) {
            addObjects(object.children, pad + 1);
          }
        }
      }
      addObjects(scene.children, 0);
      outliner.setOptions(options);

      if (this.controller.selected !== null) {
        outliner.setValue(this.controller.selected.id);
      }
    };

    refreshUI();

    // 编辑器清空的时候
    this.controller.signals.editorCleared.add(refreshUI);
    // 场景数据变化的时候
    this.controller.signals.sceneGraphChanged.add(refreshUI);
    // 物体选中的时候
    this.controller.signals.objectSelected.add((object) => {
      if (ignoreObjectSelectedSignal === true) return;
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
        // console.log(' 选中的元素 ', object, needsRefresh, nodeStates);
        outliner.setValue(object.id);
      } else {
        outliner.setValue(null);
      }
    });
    // 对象数据变化的时候
    this.controller.signals.objectChanged.add(refreshUI);
  }
}
