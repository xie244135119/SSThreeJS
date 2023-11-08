import SSController from './js/SEController';
// import { Toolbar } from './js/Toolbar';
// import { Script } from './js/Script';
// import { Player } from './js/Player';
import SSViewport from './js/Viewport';
// import styles from './index.module.css';
import './css/main.css';
import SSMenubar from './js/Menubar';
import SSLeftSidebar from './js/SidebarLeft';
import SSSidebar from './js/SidebarRight';
import SSCommand from './js/Command/commands';
import SSLoader from '../core/SSLoader';
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
    // 拖拽事件
    this.leftsidebar.dom.removeEventListener('dragover', this.onDragOver);
    this.leftsidebar.dom.removeEventListener('drop', this.onDrop);
    this.viewport.dom.removeEventListener('dragover', this.onDragOver);
    this.viewport.dom.removeEventListener('drop', this.onDrop);
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
    this.controller = controler;

    // if (!WEBGL.isWebGLAvailable()) {
    //   const warning = WEBGL.getWebGLErrorMessage();
    //   container.appendChild(warning);
    //   return null;
    // }

    // 场景窗口
    const viewport = new SSViewport(controler);
    // viewport.dom.className = styles.viewport;
    editorDom.appendChild(viewport.dom);
    this.viewport = viewport;

    // 左侧边栏
    const leftsidebar = new SSLeftSidebar(controler);
    editorDom.appendChild(leftsidebar.dom);
    this.leftsidebar = leftsidebar;

    // 右侧边栏
    const sidebar = new SSSidebar(controler);
    // sidebar.dom.className = styles.sidebar;
    editorDom.appendChild(sidebar.dom);

    const menubar = new SSMenubar(controler);
    // menubar.dom.className = styles.menubar;
    editorDom.appendChild(menubar.dom);

    // resize
    const observer = new window.ResizeObserver(() => {
      controler.signals.windowResize.dispatch();
    });
    observer.observe(editorDom);
    this._resizeObserver = observer;

    // 拖拽事件
    leftsidebar.dom.addEventListener('dragover', this.onDragOver);
    leftsidebar.dom.addEventListener('drop', this.onDrop);
    viewport.dom.addEventListener('dragover', this.onDragOver);
    viewport.dom.addEventListener('drop', this.onDrop);
  }

  /**
   * 拖拽处理
   * @param {Event} e
   */
  onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * 拖拽结束 接收的处理
   * @param {DragEvent} e
   */
  onDrop = (e) => {
    // 本地的文件
    e.stopPropagation();
    e.preventDefault();
    const libraryModelUrl = e.dataTransfer.getData('library_model_url');

    // 内部：从模型库拖拽数据
    if (libraryModelUrl) {
      SSLoader.loadGltf(libraryModelUrl).then((gltf) => {
        this.controller.execute(new SSCommand.AddObject(this.controller, gltf.scene));
      });
      return;
    }

    // 拖拽外部模型数据
    if (e.dataTransfer.files.length > 0) {
      const { files } = e.dataTransfer;
      const tempfile = files[0];
      const fileType = tempfile.name.split('.').pop();
      const fileReader = new FileReader();
      fileReader.onload = () => {
        switch (fileType.toLocaleLowerCase()) {
          case 'gltf':
          case 'glb':
            SSLoader.loadGltfBuffer(fileReader.result, '/').then((gltf) => {
              this.controller.execute(new SSCommand.AddObject(this.controller, gltf.scene));
            });
            break;

          default:
            break;
        }
      };
      fileReader.readAsArrayBuffer(tempfile);
    }
  };
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
