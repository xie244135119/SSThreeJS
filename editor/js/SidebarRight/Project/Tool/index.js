import * as THREE from 'three';

import { UIButton, UINumber, UIPanel, UIRow, UISelect, UIText } from '../../../UIKit/UI';
import { UIBoolean } from '../../../UIKit/UI.Three';
import SSCommands from '../../../Command/commands/index';
import SEComponent from '../../../SEComponent';
import SSThreeTool from '../../../../../core/SSTool/index';

export default class Tool extends SEComponent {
  selected = null;

  onObjectSelected = (e) => {
    this.selected = e;
  };

  destory() {
    this.controller.signals.objectSelected.remove(this.onObjectSelected);
    super.destory();
  }

  constructor(controller) {
    super(controller);
    this.controller.signals.objectSelected.add(this.onObjectSelected);

    const container = new UIPanel();
    this.dom = container.dom;
    this.uiDom = container;

    const headerRow = new UIRow();
    headerRow.add(new UIText(this.controller.strings.getKey('阵列').toUpperCase()));
    container.add(headerRow);

    // 阵列 方向
    const dirRow = new UIRow();
    container.add(dirRow);
    dirRow.add(new UIText(this.controller.strings.getKey('方向')).setWidth('90px'));

    const offsetTypeSelect = new UISelect()
      .setOptions({
        x: 'X',
        y: 'Y',
        z: 'Z'
      })
      .setWidth('50px');
    offsetTypeSelect.onChange = (e) => {
      console.log('offsetTypeSelect', offsetTypeSelect.getValue());
    };
    dirRow.add(offsetTypeSelect);

    // 数量
    const numberRow = new UIRow();
    container.add(numberRow);
    numberRow.add(new UIText(this.controller.strings.getKey('新增数量')).setWidth('90px'));

    const cloneNumber = new UINumber();
    cloneNumber.setWidth('30px').setMarginLeft('10px');
    cloneNumber.setStep(1).setPrecision(0);
    numberRow.add(cloneNumber);

    // 相对偏移
    const offsetRow = new UIRow();
    container.add(offsetRow);
    offsetRow.add(new UIText(this.controller.strings.getKey('相对偏移')).setWidth('90px'));

    const offsetNumber = new UINumber();
    offsetNumber.setWidth('30px').setMarginLeft('10px');
    offsetRow.add(offsetNumber);

    const createButton = new UIButton(this.controller.strings.getKey('创建'));
    container.add(createButton);
    createButton.onClick((e) => {
      const { max, min } = SSThreeTool.setBoundingBox(this.selected);
      const number = cloneNumber.getValue();
      for (let i = 0; i < number; i++) {
        const clone = this.selected.clone();
        // clone.name = `${this.selected.name}_Clone${i}`;
        clone.name = `${this.selected.name}`;
        this.controller.execute(new SSCommands.AddObjectCommand(this.controller, clone));
        // controller.scene.add(clone);
        switch (offsetTypeSelect.getValue()) {
          case 'x': {
            const radiusX = max.x - min.x;
            clone.position.x += radiusX + radiusX * offsetNumber.getValue(); // ()* (i + 1)
            break;
          }
          case 'y': {
            const radiusY = max.y - min.y;
            clone.position.y += radiusY + radiusY * offsetNumber.getValue();
            break;
          }
          case 'z': {
            const radiusZ = max.z - min.z;
            clone.position.z += radiusZ + radiusZ * offsetNumber.getValue();
            break;
          }
          default:
            break;
        }
      }
      // 更新场景
      controller.update();
    });
  }
}
