import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GUI } from 'lil-gui';
import { Vector3 } from 'three';

export default class TransformControlTool {
  // scene=new THREE.Scene()
  // camera =new THREE.Camera()
  // renderer = new  THREE.WebGLRenderer()
  // orbit = null
  // transformControl = new TransformControls()
  // currObj = null
  scene = null;

  camera = null;

  renderer = null;

  orbit = null;

  transformControl = null;

  currSelectObj = null;

  _currClickObjCopy = null;

  gui = null;

  _box = null;

  constructor(_scene, _camera, _renderer, _orbitControls) {
    this.scene = _scene;
    this.camera = _camera;
    this.renderer = _renderer;
    this.orbit = _orbitControls;

    this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    // this.transformControl.addEventListener( 'change', this.render );
    this.transformControl.addEventListener('dragging-changed', (event) => {
      this.orbit.enabled = !event.value;
      this._changeGUIMsg();
    });
    this.scene.add(this.transformControl);
    window.addEventListener('keydown', (event) => {
      switch (event.keyCode) {
        case 81: // Q
          this.transformControl.setSpace(
            this.transformControl.space === 'local' ? 'world' : 'local'
          );
          break;

        case 16: // Shift
          this.transformControl.setTranslationSnap(100);
          this.transformControl.setRotationSnap(THREE.MathUtils.degToRad(15));
          this.transformControl.setScaleSnap(0.25);
          break;

        case 87: // W
          console.log('this.transformContro', this.transformControl);
          this.transformControl.setMode('translate');
          break;

        case 69: // E
          this.transformControl.setMode('rotate');
          break;

        case 82: // R
          this.transformControl.setMode('scale');
          break;

        // case 67: // C
        //     const position = this.camera.position.clone();
        //
        //     currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
        //     currentCamera.position.copy( position );
        //
        //     orbit.object = currentCamera;
        //     control.camera = currentCamera;
        //
        //     currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
        //     onWindowResize();
        //     break;

        // case 86: // V
        //     const randomFoV = Math.random() + 0.1;
        //     const randomZoom = Math.random() + 0.1;
        //
        //     cameraPersp.fov = randomFoV * 160;
        //     cameraOrtho.bottom = - randomFoV * 500;
        //     cameraOrtho.top = randomFoV * 500;
        //
        //     cameraPersp.zoom = randomZoom * 5;
        //     cameraOrtho.zoom = randomZoom * 5;
        //     onWindowResize();
        //     break;

        case 187:
        case 107: // +, =, num+
          this.transformControl.setSize(this.transformControl.size + 0.1);
          break;

        case 189:
        case 109: // -, _, num-
          this.transformControl.setSize(Math.max(this.transformControl.size - 0.1, 0.1));
          break;

        case 88: // X
          this.transformControl.showX = !this.transformControl.showX;
          break;

        case 89: // Y
          this.transformControl.showY = !this.transformControl.showY;
          break;

        case 90: // Z
          this.transformControl.showZ = !this.transformControl.showZ;
          break;

        case 32: // Spacebar
          this.transformControl.enabled = !this.transformControl.enabled;
          break;

        case 27: // Esc
          this.transformControl.reset();
          break;
        default:
          break;
      }

      this._changeGUIMsg();
    });
    window.addEventListener('keyup', (event) => {
      switch (event.keyCode) {
        case 16: // Shift
          this.transformControl.setTranslationSnap(null);
          this.transformControl.setRotationSnap(null);
          this.transformControl.setScaleSnap(null);
          break;
        default:
          break;
      }
    });

    this.setupGUI();
  }

  select = (obj) => {
    // console.log('setinfo', obj);
    this.currSelectObj = obj;
    this.transformControl.attach(obj);
    this._changeGUIMsg();
  };

  setupGUI = () => {
    this.gui = new GUI();
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '1.5rem';
    this.gui.domElement.style.right = '30.2rem';
    this.gui.name = '模型位置属性';
    this.gui.width = 250;
    this.gui.closed = false;
    this._addGUI();
  };

  params = {
    name: '',
    position: '',
    rotation: '',
    scale: '',
    level: 'None'
  };

  _addGUI = () => {
    const foldergui = this.gui.addFolder('拖拽工具');
    foldergui.add(this.params, 'name').onChange((value) => {});
    foldergui.add(this.params, 'position').onChange((value) => {});
    foldergui.add(this.params, 'rotation').onChange((value) => {});
    foldergui.add(this.params, 'scale').onChange((value) => {});

    const states = ['None', 'parent', 'parent.parent', 'parent.parent'];
    const clip = foldergui.add(this.params, 'level', -5, 5, 1, '层级').options(states);
    clip.onChange((value) => {
      switch (value) {
        case 'None':
          this.currSelectObj = this._currClickObjCopy;
          console.log(this.currSelectObj.name);
          break;
        case 'parent':
          this.currSelectObj = this._currClickObjCopy.parent;
          console.log(this.currSelectObj);
          break;
        case 'parent.parent':
          this.currSelectObj = this._currClickObjCopy.parent.parent;
          console.log(this.currSelectObj);
          break;
        case 'parent.parent.parent':
          this.currSelectObj = this._currClickObjCopy.parent.parent.parent;
          console.log(this.currSelectObj);
          break;
        default:
          break;
      }
    });
  };

  _changeGUIMsg = () => {
    if (!this.currSelectObj) {
      return;
    }
    this._currClickObjCopy = this.currSelectObj.clone();
    this.params.name = this.currSelectObj.name;
    this.params.position = JSON.stringify(new THREE.Vector3().copy(this.currSelectObj.position));
    this.params.rotation = JSON.stringify(new THREE.Vector3().copy(this.currSelectObj.rotation));
    this.params.scale = JSON.stringify(new THREE.Vector3().copy(this.currSelectObj.scale));
    this.gui.updateDisplay();

    // //辅助线
    // this._currClickObjCopy.geometry.computeBoundingBox();
    // // this._box= new THREE.BoxHelper(this._currClickObjCopy,'red')
    // this._box = new THREE.EdgesHelper(this._currClickObjCopy, 'red');
    // this._box.position.copy(this._currClickObjCopy.position);
    // this._box.rotation.copy(this._currClickObjCopy.rotation);
    // this.scene.add(this._box);
  };
}
