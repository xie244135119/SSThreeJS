import * as THREE from 'three';
import { UICheckbox, UIDiv, UINumber, UIRow, UISelect, UISpan, UIText } from './UI';
import styles from './styles.module.less';
import { UIBoolean } from './UI.Three';

const materialClasses = {
  LineBasicMaterial: THREE.LineBasicMaterial,
  LineDashedMaterial: THREE.LineDashedMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
  MeshDepthMaterial: THREE.MeshDepthMaterial,
  MeshNormalMaterial: THREE.MeshNormalMaterial,
  MeshLambertMaterial: THREE.MeshLambertMaterial,
  MeshMatcapMaterial: THREE.MeshMatcapMaterial,
  MeshPhongMaterial: THREE.MeshPhongMaterial,
  MeshToonMaterial: THREE.MeshToonMaterial,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  MeshPhysicalMaterial: THREE.MeshPhysicalMaterial,
  RawShaderMaterial: THREE.RawShaderMaterial,
  ShaderMaterial: THREE.ShaderMaterial,
  ShadowMaterial: THREE.ShadowMaterial,
  SpriteMaterial: THREE.SpriteMaterial,
  PointsMaterial: THREE.PointsMaterial
};

const meshMaterialOptions = {
  MeshBasicMaterial: 'MeshBasicMaterial',
  MeshDepthMaterial: 'MeshDepthMaterial',
  MeshNormalMaterial: 'MeshNormalMaterial',
  MeshLambertMaterial: 'MeshLambertMaterial',
  MeshMatcapMaterial: 'MeshMatcapMaterial',
  MeshPhongMaterial: 'MeshPhongMaterial',
  MeshToonMaterial: 'MeshToonMaterial',
  MeshStandardMaterial: 'MeshStandardMaterial',
  MeshPhysicalMaterial: 'MeshPhysicalMaterial',
  RawShaderMaterial: 'RawShaderMaterial',
  ShaderMaterial: 'ShaderMaterial',
  ShadowMaterial: 'ShadowMaterial'
};

const meshMaterialBaseOptions = [
  {
    title: 'depthTest',
    type: 'bool'
  },
  {
    title: 'depthWrite',
    type: 'bool'
  },
  {
    title: 'opacity',
    type: 'number'
  },
  {
    title: 'transparent',
    type: 'bool'
  },
  {
    title: 'precision',
    type: 'select',
    options: {
      None: '',
      High: 'highp',
      Mediu: 'mediump',
      Low: 'lowp'
    }
  },
  {
    title: 'side',
    type: 'select',
    options: {
      FrontSide: 0,
      BackSide: 1,
      DoubleSide: 2,
      TwoPassDoubleSide: 2
    }
  },
  {
    title: 'toneMapped',
    type: 'bool'
  },
  {
    title: 'visible',
    type: 'bool'
  }
];

export default class UIMaterialBox extends UIDiv {
  /**
   * @type {import('./UI').UIElement}
   */
  contentBox = null;

  /**
   * @type {import('three').MeshBasicMaterial} material
   */
  material = null;

  /**
   * @type {Boolean}
   */
  _folded = false;

  /**
   *
   * @param {import('../SEController').default} controller
   * @param {import('three').MeshBasicMaterial} material
   */
  constructor(material, controller) {
    super();
    this.controller = controller;
    this.material = material;

    this.dom.className = styles.materialbox;

    // 材质处理
    const header = new UIDiv();
    header.setClass(styles.header);
    this.dom.appendChild(header.dom);

    // 箭头处理
    const headerarrow = new UIDiv();
    headerarrow.setClass(styles.arrowright);
    header.dom.appendChild(headerarrow.dom);
    //
    const texturebox = new Image();
    texturebox.className = styles.box;
    header.dom.append(texturebox);

    // 右侧内容
    const headercontent = new UIDiv();
    headercontent.className = styles.rightcontent;
    header.dom.append(headercontent.dom);

    const titlerow = new UIDiv();
    titlerow.className = styles.row;
    headercontent.dom.append(titlerow.dom);
    const titlespan = new UISpan();
    titlespan.className = styles.typetext;
    titlerow.dom.appendChild(titlespan.dom);

    //
    const typerow = new UIDiv();
    typerow.className = styles.row;
    headercontent.dom.append(typerow.dom);

    const select = new UISelect();
    select.style.fontSize = '11px';
    select.style.textTransform = 'unset';
    typerow.dom.append(select.dom);

    // 全部材质属性盒
    const content = new UIDiv();
    content.setClass(styles.content);
    this.dom.appendChild(content.dom);
    this.contentBox = content;

    header.dom.onclick = () => {
      this._folded = !this._folded;
      content.style.display = this._folded ? 'flex' : 'none';
      headerarrow.className = this._folded ? styles.arrowdown : styles.arrowright;
    };

    // threeTexture to image
    /**
     *
     * @param {ImageBitmap} bitmap
     */
    function getImageBlob(bitmap) {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, bitmap.width, bitmap.height);
      const base64Text = canvas.toDataURL('image/png');
      // console.log(' base64Text ', base64Text, bitmap.width, bitmap.height);
      return base64Text;
    }

    // 赋值
    const update = () => {
      titlespan.setTextContent(material.name);
      select.setOptions(meshMaterialOptions);
      select.setValue(material.type);
      // 图片更新
      texturebox.src = getImageBlob(material.map?.source?.data || material.envMap?.source?.data);
      // 全部材质的子属性
      // console.log(' xxxxx ', Object.keys(material));
      //
      this.setPropertys(meshMaterialBaseOptions);
    };
    update();
  }

  setOptions(options) {
    const scope = this;

    while (this.contentBox.dom.children.length > 0) {
      this.contentBox.dom.removeChild(this.contentBox.dom.firstChild);
    }

    function onClick() {
      scope.setValue(this.value);

      const changeEvent = document.createEvent('HTMLEvents');
      changeEvent.initEvent('change', true, true);
      scope.dom.dispatchEvent(changeEvent);
    }

    // Drag

    let currentDrag;

    function onDrag() {
      currentDrag = this;
    }

    function onDragStart(event) {
      event.dataTransfer.setData('text', 'foo');
    }

    function onDragOver(event) {
      if (this === currentDrag) return;

      const area = event.offsetY / this.clientHeight;

      if (area < 0.25) {
        this.className = 'option dragTop';
      } else if (area > 0.75) {
        this.className = 'option dragBottom';
      } else {
        this.className = 'option drag';
      }
    }

    function onDragLeave() {
      if (this === currentDrag) return;

      this.className = 'option';
    }

    function onDrop(event) {
      if (this === currentDrag || currentDrag === undefined) return;

      this.className = 'option';

      const { scene } = scope;
      const object = scene.getObjectById(currentDrag.value);

      const area = event.offsetY / this.clientHeight;

      if (area < 0.25) {
        const nextObject = scene.getObjectById(this.value);
        moveObject(object, nextObject.parent, nextObject);
      } else if (area > 0.75) {
        let nextObject;
        let parent;

        if (this.nextSibling !== null) {
          nextObject = scene.getObjectById(this.nextSibling.value);
          parent = nextObject.parent;
        } else {
          // end of list (no next object)

          nextObject = null;
          parent = scene.getObjectById(this.value).parent;
        }

        moveObject(object, parent, nextObject);
      } else {
        const parentObject = scene.getObjectById(this.value);
        moveObject(object, parentObject);
      }
    }

    function moveObject(object, newParent, nextObject) {
      if (nextObject === null) nextObject = undefined;

      let newParentIsChild = false;

      object.traverse((child) => {
        if (child === newParent) newParentIsChild = true;
      });

      if (newParentIsChild) return;

      const { editor } = scope;
      editor.execute(new MoveObjectCommand(editor, object, newParent, nextObject));

      const changeEvent = document.createEvent('HTMLEvents');
      changeEvent.initEvent('change', true, true);
      scope.dom.dispatchEvent(changeEvent);
    }

    //

    scope.options = [];

    for (let i = 0; i < options.length; i++) {
      const div = options[i];
      div.className = 'option';
      scope.dom.appendChild(div);

      scope.options.push(div);

      div.addEventListener('click', onClick);

      if (div.draggable === true) {
        div.addEventListener('drag', onDrag);
        div.addEventListener('dragstart', onDragStart); // Firefox needs this

        div.addEventListener('dragover', onDragOver);
        div.addEventListener('dragleave', onDragLeave);
        div.addEventListener('drop', onDrop);
      }
    }

    return scope;
  }

  /**
   * 全部属性列表
   * @param {*} properties
   */
  setPropertys(properties = []) {
    const { strings } = this.controller;
    properties.forEach((e) => {
      const row = new UIRow();
      this.contentBox.dom.append(row.dom);

      const title = new UIText(strings.getKey(e.title));
      title.setWidth('90px');
      row.dom.append(title.dom);

      switch (e.type) {
        case 'bool':
          {
            const bool = new UICheckbox();
            row.dom.append(bool.dom);
            bool.setValue(this.material[e.title]);
            bool.onChange((e) => {
              console.log(' 文本按钮 数据处理 ', e);
            });
          }
          break;
        case 'number':
          {
            const number = new UINumber();
            number.setPrecision(3).setWidth('50px');
            // number.onChange(this.updatePostion);
            row.dom.append(number.dom);
            number.setValue(this.material[e.title]);
            number.onChange((e) => {});
          }
          break;
        case 'select':
          {
            const select = new UISelect();
            select
              .setWidth('170px')
              .setFontSize('12px')
              .onChange(() => {
                console.log(' select 事件更新处理 ');
              });
            row.dom.append(select.dom);
            select.setOptions(e.options);
            select.setValue(this.material[e.title]);
          }
          break;
        default:
          break;
      }
    });
  }
}
