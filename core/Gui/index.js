/*
 * @Author: xie244135119
 * @Date: 2022-05-17 09:22:14
 * LastEditors  xie244135119
 * LastEditTime  2023-03-30 13:20:11
 * @Description: gui debug
 */

import * as THREE from 'three';
import GUI from 'lil-gui';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import ThreeTool from '../SSTool';
import ThreeEvent from '../SSEvent';

class GuiIndex {
  /**
   * @type {GUI} gui调试
   */
  guiInstance = null;

  // threejs
  #threeJs = null;

  // mesh modal controller
  #modelCameraControllers = {};

  // obserers
  // #allCallbackFns = [];

  // manual change flag
  #manualFlag = false;

  // select model
  #selectObject = null;

  // add mesh controller
  #addMeshControllers = {};

  // add mesh listener
  #addMeshListener = null;

  // watch look controller
  #watchLookControllers = {};

  // watch look 指哪看哪控制器
  #watchLookTransformControl = null;

  destroy() {
    this.#selectObject = null;
    // this.#allCallbackFns = null;
    this.#modelCameraControllers = null;

    this.guiInstance?.destroy();
  }

  /**
   * setup
   */
  setup() {
    this.guiInstance = new GUI();
    // this.guiInstance.
    this.guiInstance.domElement.style.position = 'absolute';
    this.guiInstance.name = 'debug';
    this.guiInstance.width = 300;
    this.guiInstance.closed = false;
    // add scene
    this.addLightControlView();
    // add model camera
    this.addCameraControlView();
    this.addCameraPositionAction();
    // add debug
    this.addNewMeshControllerView();
    // add watch controller
    this.addWatchLookControllerView();
  }

  /**
   * bind threeJs
   */
  bindThreeJs = (instance) => {
    this.#threeJs = instance;
  };

  /**
   * add gui camera control view
   */
  addCameraControlView = () => {
    const object = {
      mesh_camera_enabled: false,
      object_name: '选中模型的名称',
      object_parent_name: '选中模型父类的名称',
      model_position: '模型中心位置',
      camera_position: '当前相机位置',
      anchor_position: '当前锚点位置',
      result: '偏移记录',
      camera_offset_x: 0,
      camera_offset_y: 0,
      camera_offset_z: 0,
      anchor_offset_x: 0,
      anchor_offset_y: 0,
      anchor_offset_z: 0
    };
    const parammap = {
      camera_offset_x: {
        min: -50,
        max: 50,
        step: 0.1
      },
      camera_offset_y: {
        min: -50,
        max: 50,
        step: 0.1
      },
      camera_offset_z: {
        min: -50,
        max: 50,
        step: 0.1
      },
      anchor_offset_x: {
        min: -50,
        max: 50,
        step: 0.1
      },
      anchor_offset_y: {
        min: -10,
        max: 10,
        step: 0.1
      },
      anchor_offset_z: {
        min: -50,
        max: 50,
        step: 0.1
      }
    };

    const foldergui = this.guiInstance.addFolder('mesh camera');
    const keys = Object.keys(object);
    keys.forEach((key) => {
      const map = parammap[key] || {};
      const controler = foldergui.add(object, key, map.min, map.max, map.step).onChange((e) => {
        if (this.#manualFlag) return;
        if (typeof object[key] !== 'string') {
          // const data = this.getCurrentValue();
          // this.#allCallbackFns.forEach((fn) => {
          //     fn?.(data);
          // });
        }
      });
      this.#modelCameraControllers[key] = controler;
    });
  };

  /**
   * add gui camera position view
   * @param {*} obj3d
   */
  addCameraPositionAction = () => {
    this.#threeJs.threeOrbitControl.addEventListener(
      'change',
      ThreeTool.debounce(() => {
        if (!this.#selectObject) {
          return;
        }
        // 自动计算偏移量
        const cameraPosition = this.#threeJs.threeCamera.position;
        const targetPosition = this.#threeJs.threeOrbitControl.target;
        const data = this.getCurrentValue();
        try {
          const modelPosition = JSON.parse(data.model_position);
          this.setCameraGuiValue({
            camera_offset_x: cameraPosition.x - modelPosition.x,
            camera_offset_y: cameraPosition.y - modelPosition.y,
            camera_offset_z: cameraPosition.z - modelPosition.z,
            anchor_offset_x: targetPosition.x - modelPosition.x,
            anchor_offset_y: targetPosition.y - modelPosition.y,
            anchor_offset_z: targetPosition.z - modelPosition.z,
            camera_position: JSON.stringify(cameraPosition),
            anchor_position: JSON.stringify(targetPosition),
            result: JSON.stringify({
              camera_offset_x: cameraPosition.x - modelPosition.x,
              camera_offset_y: cameraPosition.y - modelPosition.y,
              camera_offset_z: cameraPosition.z - modelPosition.z,
              anchor_offset_x: targetPosition.x - modelPosition.x,
              anchor_offset_y: targetPosition.y - modelPosition.y,
              anchor_offset_z: targetPosition.z - modelPosition.z
            })
          });
        } catch (error) {
          //
        }
      }, 1000)
    );
  };

  /**
   * trace object
   */
  attach = (obj3d) => {
    if (!this.#modelCameraControllers.mesh_camera_enabled.getValue()) {
      return;
    }
    this.#selectObject = obj3d;

    const objectVector = ThreeTool.getObjectCenter(obj3d);
    this.setCameraGuiValue({
      object_name: obj3d.name,
      object_parent_name: obj3d.parent.name,
      model_position: JSON.stringify(objectVector)
    });
  };

  /**
   * cancel trace
   */
  deattach = () => {
    this.#selectObject = null;
  };

  /**
   * set gui value
   * @param {*} values
   */
  setCameraGuiValue = (values = {}) => {
    const propNames = Object.getOwnPropertyNames(values);
    propNames.forEach((key) => {
      const controller = this.#modelCameraControllers[key];
      this.#manualFlag = true;
      controller.setValue(values[key]);
      this.#manualFlag = false;
    });
  };

  // /**
  //  * observer
  //  * @param {*} observeCallBack
  //  */
  // onChange = (observeCallBack = () => {}) => {
  //     this.#allCallbackFns.push(observeCallBack);
  // };

  // /**
  //  * update offset
  //  * @param {*} cameraPosition camera position
  //  * @param {*} targetPosition scene position
  //  */
  // onUpdateModelOffset = (cameraPosition = {}, targetPosition = {}) => {
  //     if (!this.#selectObject) {
  //         return;
  //     }
  //     const data = this.getCurrentValue();
  //     try {
  //         const modelPosition = JSON.parse(data.model_position);
  //         this.setCameraGuiValue({
  //             camera_offset_x: cameraPosition.x - modelPosition.x,
  //             camera_offset_y: cameraPosition.y - modelPosition.y,
  //             camera_offset_z: cameraPosition.z - modelPosition.z,
  //             anchor_offset_x: targetPosition.x - modelPosition.x,
  //             anchor_offset_y: targetPosition.y - modelPosition.y,
  //             anchor_offset_z: targetPosition.z - modelPosition.z,
  //             camera_position: JSON.stringify(cameraPosition),
  //             anchor_position: JSON.stringify(targetPosition),
  //             result: JSON.stringify({
  //                 camera_offset_x: cameraPosition.x - modelPosition.x,
  //                 camera_offset_y: cameraPosition.y - modelPosition.y,
  //                 camera_offset_z: cameraPosition.z - modelPosition.z,
  //                 anchor_offset_x: targetPosition.x - modelPosition.x,
  //                 anchor_offset_y: targetPosition.y - modelPosition.y,
  //                 anchor_offset_z: targetPosition.z - modelPosition.z
  //             })
  //         });
  //     } catch (error) {
  //         //
  //     }
  // };

  /**
   * get gui value
   */
  getCurrentValue = () => {
    const data = {};
    const keys = Object.keys(this.#modelCameraControllers);
    keys.forEach((key) => {
      const controller = this.#modelCameraControllers[key];
      const value = controller.getValue();
      data[key] = value;
    });
    return data;
  };

  /**
   * scene config change
   */
  onSceneGuiChange = (key, value) => {
    switch (key) {
      case 'ambient_color':
        this.#threeJs.threeAmbientLight.color = new THREE.Color(
          value.r / 1,
          value.g / 1,
          value.b / 1
        );
        break;
      case 'ambient_visible':
        this.#threeJs.threeAmbientLight.visible = value;
        break;
      case 'ambient_inensity':
        this.#threeJs.threeAmbientLight.intensity = value;
        break;
      case 'directional_color':
        this.#threeJs.threeDirectionLight.color = new THREE.Color(
          value.r / 1,
          value.g / 1,
          value.b / 1
        );
        break;
      case 'directional_visible':
        this.#threeJs.threeDirectionLight.visible = value;
        break;
      case 'directional_intensity':
        this.#threeJs.threeDirectionLight.intensity = value;
        break;
      default:
        break;
    }
  };

  /**
   * scene config
   */
  addLightControlView = () => {
    const object = {
      ambient_color: new THREE.Color(0.8, 0.9, 1),
      ambient_inensity: 1.5,
      ambient_visible: true,
      directional_color: new THREE.Color(1 / 1, 240 / 1, 217 / 1),
      directional_intensity: 1.5,
      directional_visible: true
    };
    const parammap = {
      ambient_inensity: {
        min: 0,
        max: 10,
        step: 0.1
      },
      directional_intensity: {
        min: 0,
        max: 10,
        step: 0.1
      }
    };

    const datGui = this.guiInstance;
    const folder = datGui.addFolder('display');
    const propertyNames = Object.getOwnPropertyNames(object);
    propertyNames.forEach((key) => {
      const value = object[key];
      if (value instanceof THREE.Color) {
        folder.addColor(object, key).onChange((e) => {
          this.onSceneGuiChange(key, e);
        });
      } else {
        const map = parammap[key] || {};
        folder.add(object, key, map.min, map.max, map.step).onChange((e) => {
          this.onSceneGuiChange(key, e);
        });
      }
    });
  };

  /**
   * postcess config
   */
  addPostcessControlView = () => {
    const object = {
      ambient_color: new THREE.Color(0.8, 0.9, 1),
      ambient_inensity: 1.5,
      ambient_visible: true,
      directional_color: new THREE.Color(1 / 1, 240 / 1, 217 / 1),
      directional_intensity: 1.5,
      directional_visible: true
    };
    // 参数配置
    const parammap = {
      ambient_inensity: {
        min: 0,
        max: 10,
        step: 0.1
      },
      directional_intensity: {
        min: 0,
        max: 10,
        step: 0.1
      }
    };

    const datGui = this.guiInstance;
    const folder = datGui.addFolder('display');
    const propertyNames = Object.getOwnPropertyNames(object);
    propertyNames.forEach((key) => {
      const value = object[key];
      if (value instanceof THREE.Color) {
        folder.addColor(object, key).onChange((e) => {
          this.onSceneGuiChange(key, e);
        });
      } else {
        const map = parammap[key] || {};
        folder.add(object, key, map.min, map.max, map.step).onChange((e) => {
          this.onSceneGuiChange(key, e);
        });
      }
    });
  };

  /**
   * add new mesh
   */
  addNewMeshControllerView = () => {
    // 默认的group
    const debugBoxGroup = new THREE.Group();
    debugBoxGroup.name = 'debug_box_position_group';
    this.#threeJs.threeScene.add(debugBoxGroup);

    const object = {
      add_mesh: false,
      mesh_box_width: 0.3,
      mesh_output_text: '输出...',
      mesh_output: () => {
        const { threeScene } = this.#threeJs;
        const debugBoxGroup = threeScene.getObjectByName('debug_box_position_group');
        const outputText = [];
        if (debugBoxGroup instanceof THREE.Group) {
          debugBoxGroup.children.forEach((e, index) => {
            if (e instanceof THREE.Mesh) {
              outputText.push({
                position: e.position,
                rotation: { x: 0, y: 0, z: 0 },
                name: index
              });
            }
          });
        }
        this.#addMeshControllers.mesh_output_text.setValue(JSON.stringify(outputText));
      },
      removeall_mesh: () => {
        const { threeScene, threeDisposeQueue } = this.#threeJs;
        const debugBoxGroup = threeScene.getObjectByName('debug_box_position_group');
        debugBoxGroup.children.forEach((e) => {
          threeDisposeQueue.dispose(e);
        });
        debugBoxGroup.remove(...debugBoxGroup.children);
      }
    };
    const parammap = {
      mesh_box_width: {
        min: 0,
        max: 3,
        step: 0.1
      }
    };

    const datGui = this.guiInstance;
    const folder = datGui.addFolder('add mesh');
    const propertyNames = Object.getOwnPropertyNames(object);
    propertyNames.forEach((key) => {
      const map = parammap[key] || {};
      const controller = folder.add(object, key, map.min, map.max, map.step).onChange((e) => {
        this.onAddMeshGuiChange(key, e);
      });
      this.#addMeshControllers[key] = controller;
    });
  };

  /**
   * 添加调试事件
   * @param {*} key
   * @param {*} value
   */
  addNewMeshListener = () => {
    const { threeEvent, threeScene, threeContainer, threeCamera, getModelsByPoint } = this.#threeJs;
    if (!(threeEvent instanceof ThreeEvent)) return;
    if (!(threeScene instanceof THREE.Scene)) return;

    //
    this.#addMeshListener = threeEvent.addEventListener(ThreeEvent.EventType.CLICK, (e) => {
      console.log(' add mesh ', e, this.#addMeshControllers.add_mesh.getValue());
      if (!this.#addMeshControllers.add_mesh.getValue()) return;

      const debugBoxGroup = threeScene.getObjectByName('debug_box_position_group');
      const boxWidth = this.#addMeshControllers.mesh_box_width.getValue();
      // add transform box
      const box = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
      const material = new THREE.MeshBasicMaterial({
        color: '#DDFFFF'
      });
      let defaultposition = ThreeTool.screenToWorld(
        { x: e.clientX, y: e.clientY },
        threeContainer,
        threeCamera
      );
      const models = getModelsByPoint({ x: e.clientX, y: e.clientY });
      if (models.length > 0) {
        defaultposition = models[0].point;
      }
      console.log(' 新增调试器 位置信息 ', models, boxWidth, defaultposition);
      const mesh = new THREE.Mesh(box, material);
      mesh.position.copy(defaultposition);
      debugBoxGroup.add(mesh);
      const control = new TransformControls(threeCamera, threeContainer);
      control.attach(mesh);
      control.size = boxWidth * 2;
      debugBoxGroup.add(control);
      control.addEventListener('change', (e) => {
        this.#threeJs.threeOrbitControl.enabled = !control.dragging;
      });
    });
  };

  /**
   * add debug action
   */
  onAddMeshGuiChange = (key, value) => {
    const { threeOrbitControl, threeEvent } = this.#threeJs;
    switch (key) {
      case 'add_mesh':
        if (!value) {
          threeEvent.removeEventListener(ThreeEvent.EventType.CLICK, this.#addMeshListener);
          this.#addMeshListener = null;
        } else if (this.#addMeshListener === null) {
          this.addNewMeshListener();
        }
        break;
      default:
        break;
    }
  };

  /**
   * watch look action
   */
  onWatchLookGuiChange = (key, value) => {
    const { threeScene, threeCamera, threeContainer } = this.#threeJs;
    if (!(threeScene instanceof THREE.Scene)) return;

    // transform  control
    const createTransformControl = () => {
      const model = this.#watchLookControllers.transform_mode.getValue();
      const meshName = this.#watchLookControllers.select_camera_mesh.getValue();
      const selectMesh = threeScene.getObjectByName(meshName);
      const control = new TransformControls(threeCamera, threeContainer);
      control.setMode(model);
      if (selectMesh instanceof THREE.Object3D) {
        control.attach(selectMesh);
      }
      threeScene.add(control);
      control.addEventListener('change', (e) => {
        this.#threeJs.threeOrbitControl.enabled = !control.dragging;
        if (control.object) {
          // console.log(' rotation ', e, control.object.position, control.object.rotation);
          this.#watchLookControllers.outout.setValue(
            JSON.stringify({
              name: control.object.name,
              position: {
                x: control.object.position.x,
                y: control.object.position.y,
                z: control.object.position.z
              },
              rotation: {
                x: THREE.MathUtils.radToDeg(control.object.rotation.x),
                y: THREE.MathUtils.radToDeg(control.object.rotation.y),
                z: THREE.MathUtils.radToDeg(control.object.rotation.z)
              }
            })
          );
        }
      });
      return control;
    };

    switch (key) {
      case 'transform_enabled':
        if (!(this.#watchLookTransformControl instanceof TransformControls)) {
          this.#watchLookTransformControl = createTransformControl();
        }
        if (!value) {
          this.#watchLookTransformControl.detach();
        }
        this.#watchLookTransformControl.visible = value;
        break;
      case 'transform_mode':
        if (this.#watchLookTransformControl instanceof TransformControls) {
          this.#watchLookTransformControl.setMode(value);
        }
        break;
      case 'camera_group_name':
        {
          const group = threeScene.getObjectByName(value);
          const meshnames = [];
          meshnames.push(group.name);
          group.children.forEach((e) => {
            meshnames.push(e.name);
          });
          this.#watchLookControllers.select_camera_mesh.remove();
          const controller = this.#watchLookControllers.folder
            .add({ select_camera_mesh: '选中的mesh' }, 'select_camera_mesh', meshnames)
            .onChange((e) => {
              this.onWatchLookGuiChange('select_camera_mesh', e);
            });
          this.#watchLookControllers.select_camera_mesh = controller;
        }
        break;
      case 'select_camera_mesh':
        {
          const mesh = threeScene.getObjectByName(value);
          // console.log(' select_camera_mesh ', mesh);
          this.#watchLookTransformControl.attach(mesh);
        }
        break;
      default:
        break;
    }
  };

  /**
   * add watch look
   */
  addWatchLookControllerView = () => {
    const { threeScene } = this.#threeJs;
    if (!(threeScene instanceof THREE.Scene)) return;
    const groups = [];
    threeScene.children.forEach((e) => {
      if (e instanceof THREE.Group) {
        groups.push(e.name);
      }
    });

    const object = {
      transform_enabled: false,
      transform_mode: 'translate',
      outout: 'position output',
      camera_group_name: '模型分组',
      select_camera_mesh: '选中的mesh'
    };
    const parammap = {
      camera_group_name: {
        options: groups
      },
      transform_mode: {
        options: ['translate', 'rotate', 'scale']
      },
      select_camera_mesh: {
        options: ['选择group_name']
      }
    };

    const datGui = this.guiInstance;
    const folder = datGui.addFolder('add watch look');
    this.#watchLookControllers.folder = folder;
    const propertyNames = Object.getOwnPropertyNames(object);
    propertyNames.forEach((key) => {
      const map = parammap[key] || {};
      const controller = folder
        .add(object, key, map.min || map.options, map.max, map.step)
        .onChange((e) => {
          this.onWatchLookGuiChange(key, e);
        });
      this.#watchLookControllers[key] = controller;
    });
  };

  /**
   * add animate
   */
  addAnimateView = (object3d, aAnimationClips = []) => {
    const mixer = new THREE.AnimationMixer(object3d);
    const actionMap = {};
    const guiParams = {
      playSpeed: 1
    };
    aAnimationClips.forEach((e) => {
      if (e instanceof THREE.AnimationClip) {
        actionMap[e.name] = mixer.clipAction(e);
        guiParams[e.name] = false;
      }
    });

    const clock = new THREE.Clock();
    const speed = clock.getDelta();

    console.log(' guiParams ', guiParams, speed);

    const foldergui = this.guiInstance.addFolder('animate');
    foldergui.closed = false;
    foldergui.add(guiParams, 'playSpeed', 0, 2).onChange((e) => {
      // speed = e;
      mixer.timeScale = e;
    });
    const keys = Object.keys(guiParams);
    keys.forEach((key) => {
      foldergui.add(guiParams, key).onChange((e) => {
        const action = actionMap[key];
        console.log(' e ', key, e, action);
        if (action.isRunning()) {
          action.stop();
        } else {
          action.play();
        }
      });
    });

    // ThreeLoop.add(() => {
    //     speed = clock.getDelta();
    //     mixer.update(speed);
    // }, 'mix animate');
  };
}

export default GuiIndex;
