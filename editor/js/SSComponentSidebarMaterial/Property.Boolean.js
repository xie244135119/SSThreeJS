import { UICheckbox, UIRow, UIText } from '../UIKit/UI';
// import SetMaterialValueCommand from '../Command/commands/SetMaterialValue';
import SSProperty from './Property';

export default class BooleanProperty extends SSProperty {
  destory() {
    this.controller.signals.materialChanged.remove(this.update);
    this.controller.signals.objectSelected.remove();
  }

  constructor(controller, name) {
    super(controller);

    const boolean = new UICheckbox().onChange((value) => {
      console.log(' BooleanProperty 数据发生改变 ', value);
    });
    this.containerDom.add(boolean);

    // let object = null;
    // let material = null;

    //
    // this.controller.signals.objectSelected.add((selected) => {
    //   object = selected;

    //   this.update();
    // });

    // this.controller.signals.materialChanged.add(this.update);
  }

  // onChange = () => {
  //   if (material[property] !== boolean.getValue()) {
  //     editor.execute(
  //       new SetMaterialValueCommand(
  //         editor,
  //         object,
  //         property,
  //         boolean.getValue(),
  //         0 /* TODO: currentMaterialSlot */
  //       )
  //     );
  //   }
  // };

  // update = () => {
  //   if (!this.object) return;
  //   if (object.material === undefined) return;

  //   material = object.material;

  //   if (SSProperty in material) {
  //     boolean.setValue(material[SSProperty]);
  //     container.setDisplay('');
  //   } else {
  //     container.setDisplay('none');
  //   }
  // };
}
