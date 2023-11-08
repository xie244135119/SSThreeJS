import SSProperty from './Property';
import { UIRow, UISelect, UIText } from '../UIKit/UI';
// import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

// function SidebarMaterialConstantProperty(editor, property, name, options) {
export default class ConstantProperty extends SSProperty {
  constructor(controller, name, options) {
    super(controller);

    // const signals = editor.signals;

    // const container = new UIRow();
    // container.add(new UIText(name).setWidth('90px'));

    const constant = new UISelect().setOptions(options).onChange((e) => {
      console.log(' 下拉框选中的数据 xxxxx ', e);
    });
    this.containerDom.add(constant);

    // let object = null;
    // let material = null;
    //

    // signals.objectSelected.add(function (selected) {
    //   object = selected;

    //   update();
    // });

    // signals.materialChanged.add(update);

    // return container;
  }

  // function onChange() {
  //   const value = parseInt(constant.getValue());

  //   if (material[property] !== value) {
  //     editor.execute(
  //       new SetMaterialValueCommand(
  //         editor,
  //         object,
  //         property,
  //         value,
  //         0 /* TODO: currentMaterialSlot */
  //       )
  //     );
  //   }
  // }

  // function update() {
  //   if (object === null) return;
  //   if (object.material === undefined) return;

  //   material = object.material;

  //   if (property in material) {
  //     constant.setValue(material[property]);
  //     container.setDisplay('');
  //   } else {
  //     container.setDisplay('none');
  //   }
  // }
}
