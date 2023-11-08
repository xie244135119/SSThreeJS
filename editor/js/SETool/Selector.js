import * as THREE from 'three';
import SSTool from './index';

/**
 * 物体选中
 */
export default class SSSelector extends SSTool {
  /**
   * 选中的物体
   * @type {THREE.Object3D}
   */
  selected = null;

  constructor(controller) {
    super(controller);

    // signals
    this.controller.signals.intersectionsDetected.add((intersects) => {
      if (intersects.length > 0) {
        const { object } = intersects[0];

        if (object.userData.object !== undefined) {
          // helper

          this.select(object.userData.object);
        } else {
          this.select(object);
        }
      } else {
        this.select(null);
      }
    });
  }

  select(object) {
    if (this.selected === object) return;

    // let uuid = null;
    // if (object !== null) {
    //   uuid = object.uuid;
    // }

    this.selected = object;
    //
    this.controller.signals.objectSelected.dispatch(object);
  }

  deselect() {
    this.select(null);
  }
}
