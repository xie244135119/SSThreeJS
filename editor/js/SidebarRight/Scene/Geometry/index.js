import * as THREE from 'three';
import {
  UIPanel,
  UIRow,
  UIInput,
  UIButton,
  UIColor,
  UICheckbox,
  UIInteger,
  UITextArea,
  UIText,
  UINumber
} from '../../../UIKit/UI';
import { UIBoolean } from '../../../UIKit/UI.Three';
import SEComponent from '../../../SEComponent';
import SECommands from '../../../Command/commands';

export default class SEPropertyGeometry extends SEComponent {
  constructor(controller) {
    super(controller);
    const container = new UIPanel();
    container.setBorderTop('0');
    container.setPaddingTop('20px');
    // container.setDisplay('none');
    this.dom = container.dom;
    this.uiDom = container;

    // type
    const objectTypeRow = new UIRow();
    const objectType = new UIText();
    objectTypeRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/type')).setWidth('90px')
    );
    objectTypeRow.add(objectType);
    container.add(objectTypeRow);
  }

  /**
   * 对象位置更新
   */
  updatePostion = () => {
    const object = this.controller.selected;
    if (!object) {
      return;
    }
    const newPosition = new THREE.Vector3(
      this.objectPositionX.getValue(),
      this.objectPositionY.getValue(),
      this.objectPositionZ.getValue()
    );
    console.log(
      ' object.position.distanceTo(newPosition) ',
      object.position,
      newPosition,
      object.position.distanceTo(newPosition)
    );
    if (object.position.distanceTo(newPosition) >= 0.01) {
      this.controller.execute(
        new SECommands.SetObjectPositionCommand(this.controller, object, newPosition)
      );
    }
  };

  /**
   * 更新对象旋转
   */
  updateRotation = () => {
    const object = this.controller.selected;
    if (!object) {
      return;
    }
    const newRotation = new THREE.Euler(
      this.objectRotationX.getValue() * THREE.MathUtils.DEG2RAD,
      this.objectRotationY.getValue() * THREE.MathUtils.DEG2RAD,
      this.objectRotationZ.getValue() * THREE.MathUtils.DEG2RAD
    );
    if (
      new THREE.Vector3()
        .setFromEuler(object.rotation)
        .distanceTo(new THREE.Vector3().setFromEuler(newRotation)) >= 0.01
    ) {
      this.controller.execute(
        new SECommands.SetObjectRotationCommand(this.controller, object, newRotation)
      );
    }
  };

  /**
   * 更新对象放大缩小
   */
  updateScale = () => {
    const object = this.controller.selected;
    if (!object) {
      return;
    }

    const newScale = new THREE.Vector3(
      this.objectScaleX.getValue(),
      this.objectScaleY.getValue(),
      this.objectScaleZ.getValue()
    );
    if (object.scale.distanceTo(newScale) >= 0.01) {
      this.controller.execute(
        new SECommands.SetObjectScaleCommand(this.controller, object, newScale)
      );
    }
  };

  /**
   * 数据更新 数字类型判断更新幅度是否大于0.01, 其他是否相等
   */
  updateNumberValue = (propName, propValue) => {
    const selectedObject = this.controller.selected;

    if (selectedObject === null) return;
    //
    const originValue = selectedObject[propName];
    const newValue = propValue;
    if (originValue !== undefined && Math.abs(originValue - newValue) >= 0.01) {
      this.controller.execute(
        new SECommands.SetObjectValueCommand(this.controller, selectedObject, propName, newValue)
      );
      selectedObject.updateProjectionMatrix();
    }
  };

  /**
   * 文字数据更新
   */
  updateTextValue = (propName, propValue) => {
    const selectedObject = this.controller.selected;

    if (selectedObject === null) return;
    //
    const originValue = selectedObject[propName];
    const newValue = propValue;
    if (originValue !== newValue) {
      this.controller.execute(
        new SECommands.SetObjectValueCommand(this.controller, selectedObject, propName, newValue)
      );
    }
  };

  /**
   * 颜色数据更新
   */
  updateColorValue = (propName, propValue) => {
    const selectedObject = this.controller.selected;

    if (selectedObject === null) return;
    /**
     * @type {THREE.Color}
     */
    const originValue = selectedObject[propName];
    /**
     * @type {THREE.Color}
     */
    const newValue = propValue;
    if (originValue !== undefined && originValue.getHex() !== newValue) {
      this.controller.execute(
        new SECommands.SetColorCommand(this.controller, selectedObject, propName, newValue)
      );
    }
  };
}
