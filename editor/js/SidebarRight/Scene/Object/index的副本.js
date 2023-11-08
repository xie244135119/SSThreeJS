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
// import { SetUuidCommand } from './commands/SetUuidCommand.js';
// import { SetValueCommand } from './commands/SetValueCommand.js';
// import { SetPositionCommand } from './commands/SetPositionCommand.js';
// import { SetRotationCommand } from './commands/SetRotationCommand.js';
// import { SetScaleCommand } from './commands/SetScaleCommand.js';
// import { SetColorCommand } from './commands/SetColorCommand.js';
import SEComponent from '../../../SEComponent';
import SECommands from '../../../Command/commands';

export default class SSPropertyObject extends SEComponent {
  constructor(controller) {
    super(controller);
    const container = new UIPanel();
    container.setBorderTop('0');
    container.setPaddingTop('20px');
    // container.setDisplay('none');
    this.dom = container.dom;
    this.uiDom = container;

    // Actions
    /*
	let objectActions = new UI.Select().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Reset Position': 'Reset Position',
		'Reset Rotation': 'Reset Rotation',
		'Reset Scale': 'Reset Scale'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		let object = editor.selected;

		switch ( this.getValue() ) {

			case 'Reset Position':
				editor.execute( new SetPositionCommand( editor, object, new Vector3( 0, 0, 0 ) ) );
				break;

			case 'Reset Rotation':
				editor.execute( new SetRotationCommand( editor, object, new Euler( 0, 0, 0 ) ) );
				break;

			case 'Reset Scale':
				editor.execute( new SetScaleCommand( editor, object, new Vector3( 1, 1, 1 ) ) );
				break;

		}

		this.setValue( 'Actions' );

	} );
	container.addStatic( objectActions );
	*/

    // type
    const objectTypeRow = new UIRow();
    const objectType = new UIText();
    objectTypeRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/type')).setWidth('90px')
    );
    objectTypeRow.add(objectType);
    container.add(objectTypeRow);

    // uuid
    const objectUUIDRow = new UIRow();
    const objectUUID = new UIInput().setWidth('102px').setFontSize('12px').setDisabled(true);
    const objectUUIDRenew = new UIButton(this.controller.strings.getKey('sidebar/object/new'))
      .setMarginLeft('7px')
      .onClick(() => {
        objectUUID.setValue(THREE.MathUtils.generateUUID());
        // editor.execute(new SetUuidCommand(editor, editor.selected, objectUUID.getValue()));
      });
    objectUUIDRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/uuid')).setWidth('90px')
    );
    objectUUIDRow.add(objectUUID);
    objectUUIDRow.add(objectUUIDRenew);
    container.add(objectUUIDRow);

    // name
    const objectNameRow = new UIRow();
    const objectName = new UIInput()
      .setWidth('150px')
      .setFontSize('12px')
      .onChange(() => {
        // editor.execute(new SetValueCommand(editor, editor.selected, 'name', objectName.getValue()));
      });
    objectNameRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/name')).setWidth('90px')
    );
    objectNameRow.add(objectName);
    container.add(objectNameRow);

    // position
    const objectPositionRow = new UIRow();
    this.objectPositionX = new UINumber()
      .setPrecision(3)
      .setWidth('50px')
      .onChange(this.updatePostion);
    this.objectPositionY = new UINumber()
      .setPrecision(3)
      .setWidth('50px')
      .onChange(this.updatePostion);
    this.objectPositionZ = new UINumber()
      .setPrecision(3)
      .setWidth('50px')
      .onChange(this.updatePostion);
    objectPositionRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/position')).setWidth('90px')
    );
    objectPositionRow.add(this.objectPositionX, this.objectPositionY, this.objectPositionZ);
    container.add(objectPositionRow);

    // rotation
    const objectRotationRow = new UIRow();
    this.objectRotationX = new UINumber()
      .setStep(10)
      .setNudge(0.1)
      .setUnit('°')
      .setWidth('50px')
      .onChange(this.updateRotation);
    this.objectRotationY = new UINumber()
      .setStep(10)
      .setNudge(0.1)
      .setUnit('°')
      .setWidth('50px')
      .onChange(this.updateRotation);
    this.objectRotationZ = new UINumber()
      .setStep(10)
      .setNudge(0.1)
      .setUnit('°')
      .setWidth('50px')
      .onChange(this.updateRotation);
    objectRotationRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/rotation')).setWidth('90px')
    );
    objectRotationRow.add(this.objectRotationX, this.objectRotationY, this.objectRotationZ);
    container.add(objectRotationRow);

    // scale
    const objectScaleRow = new UIRow();
    this.objectScaleX = new UINumber(1).setPrecision(3).setWidth('50px').onChange(this.updateScale);
    this.objectScaleY = new UINumber(1).setPrecision(3).setWidth('50px').onChange(this.updateScale);
    this.objectScaleZ = new UINumber(1).setPrecision(3).setWidth('50px').onChange(this.updateScale);
    objectScaleRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/scale')).setWidth('90px')
    );
    objectScaleRow.add(this.objectScaleX, this.objectScaleY, this.objectScaleZ);
    container.add(objectScaleRow);

    // fov
    const objectFovRow = new UIRow();
    const objectFov = new UINumber().onChange((e) => {
      console.log(' 数据变化的时候 ', e);
      this.updateNumberValue('fov', e.target.value);
    });
    objectFovRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/fov')).setWidth('90px')
    );
    objectFovRow.add(objectFov);
    container.add(objectFovRow);

    // left
    const objectLeftRow = new UIRow();
    const objectLeft = new UINumber().onChange((e) => {
      this.updateNumberValue('left', e.target.value);
    });
    objectLeftRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/left')).setWidth('90px')
    );
    objectLeftRow.add(objectLeft);
    container.add(objectLeftRow);

    // right
    const objectRightRow = new UIRow();
    const objectRight = new UINumber().onChange((e) => {
      this.updateNumberValue('right', e.target.value);
    });
    objectRightRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/right')).setWidth('90px')
    );
    objectRightRow.add(objectRight);
    container.add(objectRightRow);

    // top
    const objectTopRow = new UIRow();
    const objectTop = new UINumber().onChange((e) => {
      this.updateNumberValue('top', e.target.value);
    });
    objectTopRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/top')).setWidth('90px')
    );
    objectTopRow.add(objectTop);
    container.add(objectTopRow);

    // bottom
    const objectBottomRow = new UIRow();
    const objectBottom = new UINumber().onChange((e) => {
      this.updateNumberValue('bottom', e.target.value);
    });
    objectBottomRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/bottom')).setWidth('90px')
    );
    objectBottomRow.add(objectBottom);
    container.add(objectBottomRow);

    // near
    const objectNearRow = new UIRow();
    const objectNear = new UINumber().onChange((e) => {
      this.updateNumberValue('near', e.target.value);
    });
    objectNearRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/near')).setWidth('90px')
    );
    objectNearRow.add(objectNear);
    container.add(objectNearRow);

    // far
    const objectFarRow = new UIRow();
    const objectFar = new UINumber().onChange((e) => {
      this.updateNumberValue('far', e.target.value);
    });
    objectFarRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/far')).setWidth('90px')
    );
    objectFarRow.add(objectFar);
    container.add(objectFarRow);

    // intensity
    const objectIntensityRow = new UIRow();
    const objectIntensity = new UINumber().onChange((e) => {
      this.updateNumberValue('intensity', e.target.value);
    });
    objectIntensityRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/intensity')).setWidth('90px')
    );
    objectIntensityRow.add(objectIntensity);
    container.add(objectIntensityRow);

    // color
    const objectColorRow = new UIRow();
    const objectColor = new UIColor();
    objectColor.onInput((e) => {
      this.updateColorValue('color', objectColor.getHexValue());
    });
    objectColorRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/color')).setWidth('90px')
    );
    objectColorRow.add(objectColor);
    container.add(objectColorRow);

    // ground color
    const objectGroundColorRow = new UIRow();
    const objectGroundColor = new UIColor();
    objectGroundColor.onInput((e) => {
      this.updateColorValue('groundColor', objectColor.getHexValue());
    });
    objectGroundColorRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/groundcolor')).setWidth('90px')
    );
    objectGroundColorRow.add(objectGroundColor);
    container.add(objectGroundColorRow);

    // distance
    const objectDistanceRow = new UIRow();
    const objectDistance = new UINumber();
    objectDistance.setRange(0, Infinity).onChange((e) => {
      this.updateNumberValue('distance', objectDistance.getValue());
    });
    objectDistanceRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/distance')).setWidth('90px')
    );
    objectDistanceRow.add(objectDistance);
    container.add(objectDistanceRow);

    // angle
    const objectAngleRow = new UIRow();
    const objectAngle = new UINumber();
    objectAngle
      .setPrecision(3)
      .setRange(0, Math.PI / 2)
      .onChange(() => {
        this.updateNumberValue('angle', objectAngle.getValue());
      });
    objectAngleRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/angle')).setWidth('90px')
    );
    objectAngleRow.add(objectAngle);
    container.add(objectAngleRow);

    // penumbra
    const objectPenumbraRow = new UIRow();
    const objectPenumbra = new UINumber();
    objectPenumbra.setRange(0, 1).onChange(() => {
      this.updateNumberValue('penumbra', objectPenumbra.getValue());
    });
    objectPenumbraRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/penumbra')).setWidth('90px')
    );
    objectPenumbraRow.add(objectPenumbra);
    container.add(objectPenumbraRow);

    // decay
    const objectDecayRow = new UIRow();
    const objectDecay = new UINumber();
    objectDecay.setRange(0, Infinity).onChange(() => {
      this.updateNumberValue('decay', objectDecay.getValue());
    });
    objectDecayRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/decay')).setWidth('90px')
    );
    objectDecayRow.add(objectDecay);
    container.add(objectDecayRow);

    // shadow
    const objectShadowRow = new UIRow();
    objectShadowRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/shadow')).setWidth('90px')
    );
    const objectCastShadow = new UIBoolean(
      false,
      this.controller.strings.getKey('sidebar/object/cast')
    );
    objectCastShadow.onChange((e) => {
      this.updateNumberValue('castShadow', objectCastShadow.getValue());
    });
    objectShadowRow.add(objectCastShadow);

    const objectReceiveShadow = new UIBoolean(
      false,
      this.controller.strings.getKey('sidebar/object/receive')
    );
    objectReceiveShadow.onChange((e) => {
      this.updateNumberValue('receiveShadow', objectReceiveShadow.getValue());
    });
    objectShadowRow.add(objectReceiveShadow);
    container.add(objectShadowRow);

    // shadow bias
    const objectShadowBiasRow = new UIRow();
    objectShadowBiasRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/shadowBias')).setWidth('90px')
    );

    const objectShadowBias = new UINumber(0);
    objectShadowBias
      .setPrecision(5)
      .setStep(0.0001)
      .setNudge(0.00001)
      .onChange((e) => {
        this.updateNumberValue('shadowBias', objectShadowBias.getValue());
      });
    objectShadowBiasRow.add(objectShadowBias);
    container.add(objectShadowBiasRow);

    // shadow normal offset
    const objectShadowNormalBiasRow = new UIRow();
    objectShadowNormalBiasRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/shadowNormalBias')).setWidth('90px')
    );
    const objectShadowNormalBias = new UINumber(0);
    objectShadowNormalBias.onChange((e) => {
      this.updateNumberValue('shadowNormalBias', objectShadowNormalBias.getValue());
    });
    objectShadowNormalBiasRow.add(objectShadowNormalBias);
    container.add(objectShadowNormalBiasRow);

    // shadow radius
    const objectShadowRadiusRow = new UIRow();
    objectShadowRadiusRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/shadowRadius')).setWidth('90px')
    );
    const objectShadowRadius = new UINumber(1);
    objectShadowRadius.onChange((e) => {
      this.updateNumberValue('shadowRadius', objectShadowRadius.getValue());
    });
    objectShadowRadiusRow.add(objectShadowRadius);
    container.add(objectShadowRadiusRow);

    // visible
    const objectVisibleRow = new UIRow();
    const objectVisible = new UICheckbox();
    objectVisible.onChange((e) => {
      this.updateNumberValue('visible', objectVisible.getValue());
    });
    objectVisibleRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/visible')).setWidth('90px')
    );
    objectVisibleRow.add(objectVisible);
    container.add(objectVisibleRow);

    // frustumCulled
    const objectFrustumCulledRow = new UIRow();
    const objectFrustumCulled = new UICheckbox();
    objectFrustumCulled.onChange((e) => {
      this.updateNumberValue('frustumCulled', objectFrustumCulled.getValue());
    });
    objectFrustumCulledRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/frustumcull')).setWidth('90px')
    );
    objectFrustumCulledRow.add(objectFrustumCulled);
    container.add(objectFrustumCulledRow);

    // renderOrder
    const objectRenderOrderRow = new UIRow();
    const objectRenderOrder = new UIInteger();
    objectRenderOrder.setWidth('50px');
    objectRenderOrder.onChange((e) => {
      this.updateNumberValue('renderOrder', objectRenderOrder.getValue());
    });
    objectRenderOrderRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/renderorder')).setWidth('90px')
    );
    objectRenderOrderRow.add(objectRenderOrder);
    container.add(objectRenderOrderRow);

    // user data
    const objectUserDataRow = new UIRow();
    const objectUserData = new UITextArea();
    objectUserData
      .setWidth('150px')
      .setHeight('40px')
      .setFontSize('12px')
      .onChange((e) => {});
    objectUserData.onKeyUp(() => {
      try {
        JSON.parse(objectUserData.getValue());
        objectUserData.dom.classList.add('success');
        objectUserData.dom.classList.remove('fail');
      } catch (error) {
        objectUserData.dom.classList.remove('success');
        objectUserData.dom.classList.add('fail');
      }
    });

    objectUserDataRow.add(
      new UIText(this.controller.strings.getKey('sidebar/object/userdata')).setWidth('90px')
    );
    objectUserDataRow.add(objectUserData);
    container.add(objectUserDataRow);

    //
    function updateRows(object) {
      const properties = {
        fov: objectFovRow,
        left: objectLeftRow,
        right: objectRightRow,
        top: objectTopRow,
        bottom: objectBottomRow,
        near: objectNearRow,
        far: objectFarRow,
        intensity: objectIntensityRow,
        color: objectColorRow,
        groundColor: objectGroundColorRow,
        distance: objectDistanceRow,
        angle: objectAngleRow,
        penumbra: objectPenumbraRow,
        decay: objectDecayRow,
        castShadow: objectShadowRow,
        receiveShadow: objectReceiveShadow,
        shadow: [objectShadowBiasRow, objectShadowNormalBiasRow, objectShadowRadiusRow]
      };

      for (const property in properties) {
        const uiElement = properties[property];

        if (Array.isArray(uiElement) === true) {
          for (let i = 0; i < uiElement.length; i++) {
            uiElement[i].setDisplay(object[property] !== undefined ? '' : 'none');
          }
        } else {
          uiElement.setDisplay(object[property] !== undefined ? '' : 'none');
        }
      }

      //

      if (object.isLight) {
        objectReceiveShadow.setDisplay('none');
      }

      if (object.isAmbientLight || object.isHemisphereLight) {
        objectShadowRow.setDisplay('none');
      }
    }

    function updateTransformRows(object) {
      if (object.isLight || (object.isObject3D && object.userData.targetInverse)) {
        objectRotationRow.setDisplay('none');
        objectScaleRow.setDisplay('none');
      } else {
        objectRotationRow.setDisplay('');
        objectScaleRow.setDisplay('');
      }
    }

    // events
    this.controller.signals.objectSelected.add((object) => {
      if (object !== null) {
        container.setDisplay('block');

        updateRows(object);
        updateUI(object);
      } else {
        container.setDisplay('none');
      }
    });

    // 几何体发生改变的时候
    this.controller.signals.objectChanged.add((object) => {
      if (object !== this.controller.selected) return;

      updateUI(object);
    });

    // signals.refreshSidebarObject3D.add((object) => {
    //   if (object !== editor.selected) return;

    //   updateUI(object);
    // });

    function updateUI(object) {
      objectType.setValue(object.type);

      objectUUID.setValue(object.uuid);
      objectName.setValue(object.name);

      this.objectPositionX.setValue(object.position.x);
      this.objectPositionY.setValue(object.position.y);
      this.objectPositionZ.setValue(object.position.z);

      this.objectRotationX.setValue(object.rotation.x * THREE.MathUtils.RAD2DEG);
      this.objectRotationY.setValue(object.rotation.y * THREE.MathUtils.RAD2DEG);
      this.objectRotationZ.setValue(object.rotation.z * THREE.MathUtils.RAD2DEG);

      this.objectScaleX.setValue(object.scale.x);
      this.objectScaleY.setValue(object.scale.y);
      this.objectScaleZ.setValue(object.scale.z);

      if (object.fov !== undefined) {
        objectFov.setValue(object.fov);
      }

      if (object.left !== undefined) {
        objectLeft.setValue(object.left);
      }

      if (object.right !== undefined) {
        objectRight.setValue(object.right);
      }

      if (object.top !== undefined) {
        objectTop.setValue(object.top);
      }

      if (object.bottom !== undefined) {
        objectBottom.setValue(object.bottom);
      }

      if (object.near !== undefined) {
        objectNear.setValue(object.near);
      }

      if (object.far !== undefined) {
        objectFar.setValue(object.far);
      }

      if (object.intensity !== undefined) {
        objectIntensity.setValue(object.intensity);
      }

      if (object.color !== undefined) {
        objectColor.setHexValue(object.color.getHexString());
      }

      if (object.groundColor !== undefined) {
        objectGroundColor.setHexValue(object.groundColor.getHexString());
      }

      if (object.distance !== undefined) {
        objectDistance.setValue(object.distance);
      }

      if (object.angle !== undefined) {
        objectAngle.setValue(object.angle);
      }

      if (object.penumbra !== undefined) {
        objectPenumbra.setValue(object.penumbra);
      }

      if (object.decay !== undefined) {
        objectDecay.setValue(object.decay);
      }

      if (object.castShadow !== undefined) {
        objectCastShadow.setValue(object.castShadow);
      }

      if (object.receiveShadow !== undefined) {
        objectReceiveShadow.setValue(object.receiveShadow);
      }

      if (object.shadow !== undefined) {
        objectShadowBias.setValue(object.shadow.bias);
        objectShadowNormalBias.setValue(object.shadow.normalBias);
        objectShadowRadius.setValue(object.shadow.radius);
      }

      objectVisible.setValue(object.visible);
      objectFrustumCulled.setValue(object.frustumCulled);
      objectRenderOrder.setValue(object.renderOrder);

      try {
        objectUserData.setValue(JSON.stringify(object.userData, null, '  '));
      } catch (error) {
        console.log(error);
      }

      objectUserData.setBorderColor('transparent');
      objectUserData.setBackgroundColor('');

      updateTransformRows(object);
    }
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
    if (object.position.distanceTo(newPosition) >= 0.01) {
      this.controller.execute(
        new SECommands.SetPositionCommand(this.controller, object, newPosition)
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
        new SECommands.SetRotationCommand(this.controller, object, newRotation)
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
      this.controller.execute(new SECommands.SetScaleCommand(this.controller, object, newScale));
    }
  };

  /**
   * 数据更新
   */
  update = () => {
    const object = this.controller.selected;

    if (object !== null) {
      if (object.fov !== undefined && Math.abs(object.fov - objectFov.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'fov', objectFov.getValue()));
        // object.updateProjectionMatrix();
      }

      if (object.left !== undefined && Math.abs(object.left - objectLeft.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'left', objectLeft.getValue()));
        // object.updateProjectionMatrix();
      }

      if (object.right !== undefined && Math.abs(object.right - objectRight.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'right', objectRight.getValue()));
        // object.updateProjectionMatrix();
      }

      if (object.top !== undefined && Math.abs(object.top - objectTop.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'top', objectTop.getValue()));
        // object.updateProjectionMatrix();
      }

      if (
        object.bottom !== undefined &&
        Math.abs(object.bottom - objectBottom.getValue()) >= 0.01
      ) {
        // editor.execute(new SetValueCommand(editor, object, 'bottom', objectBottom.getValue()));
        // object.updateProjectionMatrix();
      }

      if (object.near !== undefined && Math.abs(object.near - objectNear.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'near', objectNear.getValue()));
        // if (object.isOrthographicCamera) {
        //   object.updateProjectionMatrix();
        // }
      }

      if (object.far !== undefined && Math.abs(object.far - objectFar.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'far', objectFar.getValue()));
        if (object.isOrthographicCamera) {
          // object.updateProjectionMatrix();
        }
      }

      if (
        object.intensity !== undefined &&
        Math.abs(object.intensity - objectIntensity.getValue()) >= 0.01
      ) {
        // editor.execute(
        //   new SetValueCommand(editor, object, 'intensity', objectIntensity.getValue())
        // );
      }

      if (object.color !== undefined && object.color.getHex() !== objectColor.getHexValue()) {
        // editor.execute(new SetColorCommand(editor, object, 'color', objectColor.getHexValue()));
      }

      if (
        object.groundColor !== undefined &&
        object.groundColor.getHex() !== objectGroundColor.getHexValue()
      ) {
        // editor.execute(
        //   new SetColorCommand(editor, object, 'groundColor', objectGroundColor.getHexValue())
        // );
      }

      if (
        object.distance !== undefined &&
        Math.abs(object.distance - objectDistance.getValue()) >= 0.01
      ) {
        // editor.execute(
        //   new SetValueCommand(editor, object, 'distance', objectDistance.getValue())
        // );
      }

      if (object.angle !== undefined && Math.abs(object.angle - objectAngle.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'angle', objectAngle.getValue()));
      }

      if (
        object.penumbra !== undefined &&
        Math.abs(object.penumbra - objectPenumbra.getValue()) >= 0.01
      ) {
        // editor.execute(
        //   new SetValueCommand(editor, object, 'penumbra', objectPenumbra.getValue())
        // );
      }

      if (object.decay !== undefined && Math.abs(object.decay - objectDecay.getValue()) >= 0.01) {
        // editor.execute(new SetValueCommand(editor, object, 'decay', objectDecay.getValue()));
      }

      if (object.visible !== objectVisible.getValue()) {
        // editor.execute(new SetValueCommand(editor, object, 'visible', objectVisible.getValue()));
      }

      if (object.frustumCulled !== objectFrustumCulled.getValue()) {
        // editor.execute(
        //   new SetValueCommand(editor, object, 'frustumCulled', objectFrustumCulled.getValue())
        // );
      }

      if (object.renderOrder !== objectRenderOrder.getValue()) {
        // editor.execute(
        //   new SetValueCommand(editor, object, 'renderOrder', objectRenderOrder.getValue())
        // );
      }

      if (object.castShadow !== undefined && object.castShadow !== objectCastShadow.getValue()) {
        // editor.execute(
        //   new SetValueCommand(editor, object, 'castShadow', objectCastShadow.getValue())
        // );
      }

      if (object.receiveShadow !== objectReceiveShadow.getValue()) {
        if (object.material !== undefined) object.material.needsUpdate = true;
        // editor.execute(
        //   new SetValueCommand(editor, object, 'receiveShadow', objectReceiveShadow.getValue())
        // );
      }

      if (object.shadow !== undefined) {
        if (object.shadow.bias !== objectShadowBias.getValue()) {
          // editor.execute(
          //   new SetValueCommand(editor, object.shadow, 'bias', objectShadowBias.getValue())
          // );
        }

        if (object.shadow.normalBias !== objectShadowNormalBias.getValue()) {
          // editor.execute(
          //   new SetValueCommand(
          //     editor,
          //     object.shadow,
          //     'normalBias',
          //     objectShadowNormalBias.getValue()
          //   )
          // );
        }

        if (object.shadow.radius !== objectShadowRadius.getValue()) {
          // editor.execute(
          //   new SetValueCommand(editor, object.shadow, 'radius', objectShadowRadius.getValue())
          // );
        }
      }

      try {
        const userData = JSON.parse(objectUserData.getValue());
        if (JSON.stringify(object.userData) != JSON.stringify(userData)) {
          // editor.execute(new SetValueCommand(editor, object, 'userData', userData));
        }
      } catch (exception) {
        console.warn(exception);
      }
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
        new SECommands.SetValueCommand(this.controller, selectedObject, propName, newValue)
      );
      selectedObject.updateProjectionMatrix();
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
