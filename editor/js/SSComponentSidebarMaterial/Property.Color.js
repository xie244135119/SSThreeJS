import { UIColor, UINumber, UIRow, UIText } from '../UIKit/UI';
import SSProperty from './Property';
// import { SetMaterialColorCommand } from './commands/SetMaterialColorCommand.js';
// import { SetMaterialValueCommand } from './commands/SetMaterialValueCommand.js';

// export default function SidebarMaterialColorProperty(editor, property, name) {
export default class ColorProperty extends SSProperty {
  constructor(controller, name) {
    super(controller, name);

    const color = new UIColor().onInput(this.onChange);
    this.containerDom.add(color);

    // let intensity;

    // if (property === 'emissive') {
    //   intensity = new UINumber(1).setWidth('30px').setRange(0, Infinity).onChange(onChange);
    //   container.add(intensity);
    // }

    let object = null;
    let material = null;
    //

    // signals.objectSelected.add(function (selected) {
    //   object = selected;

    //   update();
    // });

    // signals.materialChanged.add(update);

    // return container;
  }

  // onChange = () => {
  //   if (material[property].getHex() !== color.getHexValue()) {
  //     editor.execute(
  //       new SetMaterialColorCommand(
  //         editor,
  //         object,
  //         property,
  //         color.getHexValue(),
  //         0 /* TODO: currentMaterialSlot */
  //       )
  //     );
  //   }

  //   if (intensity !== undefined) {
  //     if (material[`${property}Intensity`] !== intensity.getValue()) {
  //       editor.execute(
  //         new SetMaterialValueCommand(
  //           editor,
  //           object,
  //           `${property}Intensity`,
  //           intensity.getValue(),
  //           /* TODO: currentMaterialSlot*/ 0
  //         )
  //       );
  //     }
  //   }
  // };

  // update = () => {
  //   if (object === null) return;
  //   if (object.material === undefined) return;

  //   material = object.material;

  //   if (property in material) {
  //     color.setHexValue(material[property].getHexString());

  //     if (intensity !== undefined) {
  //       intensity.setValue(material[`${property}Intensity`]);
  //     }

  //     container.setDisplay('');
  //   } else {
  //     container.setDisplay('none');
  //   }
  // };
}
