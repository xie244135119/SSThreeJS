// import * as THREE from 'three';
// import './main.module.css'

import SSViewport from './js/SSComponent.Viewport';
import SSController from './js/SSController';
// import { Toolbar } from './js/Toolbar';
// import { Script } from './js/Script';
// import { Player } from './js/Player';
import SSSidebar from './js/SSComponent.Sidebar';
// import styles from './index.module.css';
import './css/main.css';
import SSMenubar from './js/SSComponent.Menubar';
// import { Resizer } from './js/Resizer';
// import { VRButton } from 'three/addons/webxr/VRButton';

window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

// Number.prototype.format = function () {
//   return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
// };

export default class SSEditor {
  destory() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  /**
   * 构造
   * @param {string | HTMLElement} dom 编辑器承载的全部核心
   */
  constructor(dom) {
    let editorDom = document.body;
    if (typeof dom === 'string') {
      const element = document.getElementById(dom);
      editorDom = element;
    } else if (dom instanceof HTMLElement) {
      editorDom = dom;
    }
    // adjust style
    if (['relative', 'absolute'].indexOf(editorDom.style.position) === -1) {
      editorDom.style.position = 'relative';
    }
    //
    const controler = new SSController();

    // if (!WEBGL.isWebGLAvailable()) {
    //   const warning = WEBGL.getWebGLErrorMessage();
    //   container.appendChild(warning);
    //   return null;
    // }

    //
    const viewport = new SSViewport(controler);
    // viewport.dom.className = styles.viewport;
    editorDom.appendChild(viewport.dom);

    const sidebar = new SSSidebar(controler);
    // sidebar.dom.className = styles.sidebar;
    editorDom.appendChild(sidebar.dom);

    const menubar = new SSMenubar(controler);
    // menubar.dom.className = styles.menubar;
    editorDom.appendChild(menubar.dom);

    // resize
    const observer = new window.ResizeObserver(() => {
      controler.signalController.windowResize.dispatch();
    });
    observer.observe(editorDom);
    this._resizeObserver = observer;
  }
}

//

// document.addEventListener('dragover', function (event) {
//   event.preventDefault();
//   event.dataTransfer.dropEffect = 'copy';
// });

// document.addEventListener('drop', function (event) {
//   event.preventDefault();

//   if (event.dataTransfer.types[0] === 'text/plain') return; // Outliner drop

//   if (event.dataTransfer.items) {
//     // DataTransferItemList supports folders

//     editor.loader.loadItemList(event.dataTransfer.items);
//   } else {
//     editor.loader.loadFiles(event.dataTransfer.files);
//   }
// });

// //

// let isLoadingFromHash = false;
// const hash = window.location.hash;

// if (hash.slice(1, 6) === 'file=') {
//   const file = hash.slice(6);

//   if (confirm('Any unsaved data will be lost. Are you sure?')) {
//     const loader = new THREE.FileLoader();
//     loader.crossOrigin = '';
//     loader.load(file, function (text) {
//       editor.clear();
//       editor.fromJSON(JSON.parse(text));
//     });

//     isLoadingFromHash = true;
//   }
// }

// ServiceWorker

if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.register('sw');
  } catch (error) {
    //
  }
}
