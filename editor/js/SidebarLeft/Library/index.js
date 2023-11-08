import { UIDiv, UIRow, UIText, UITabbedPanel } from '../../UIKit/UI';
import SEComponent from '../../SEComponent';
import styles from './index.module.less';

/**
 * 模型库数据
 */
const ModelsLibrary = [
  {
    title: '油浸式变压器',
    icon: './library/models/变压器.jpg',
    url: '/library/models/变压器.glb'
  },
  {
    title: '出线柜',
    icon: './library/models/开关柜1.jpg',
    url: '/library/models/开关柜1.glb'
  },
  {
    title: '开关柜',
    icon: './library/models/开关柜2.jpg',
    url: '/library/models/开关柜2.glb'
  },
  {
    title: '补偿柜',
    icon: './library/models/开关柜1.jpg',
    url: '/library/models/开关柜1.glb'
  }
];

/**
 * 纹理库数据
 */
const TexturesLibrary = [
  {
    title: '飞线',
    icon: './library/textures/barEffect.png'
  },
  {
    title: '流线-竖',
    icon: './library/textures/flow.png'
  },
  {
    title: '流线-横',
    icon: './library/textures/flow1.png'
  },
  {
    title: '天气-云',
    icon: './library/textures/weather_fog.png'
  },
  {
    title: '天气-雨水',
    icon: './library/textures/weather_rain.png'
  },
  {
    title: '天气-雪花',
    icon: './library/textures/weather_snow_transpant.png'
  }
];

/**
 * 法线贴图库数据
 */
const NormalsLibrary = [
  {
    title: '水质1',
    icon: './library/normals/Water_1_M_Normal.jpg'
  },
  {
    title: '水质2',
    icon: './library/normals/Water_2_M_Normal.jpg'
  }
];

export default class SESidebarLibrary extends SEComponent {
  destory() {
    this.dom.removeEventListener('drop', this.onDrop);
    super.destory();
  }

  constructor(controller) {
    super(controller);

    //
    const tab = new UITabbedPanel();
    this.dom = tab.dom;
    this.uiDom = tab;
    this.dom.addEventListener('drop', this.onDrop);

    // 模型库
    const modelContainer = new UIDiv();
    modelContainer.setHeight('300px');
    modelContainer.setOverflow('auto');
    ModelsLibrary.forEach((item) => {
      const kggele = this.createModelElement(item.icon, item.title);
      modelContainer.addDom(kggele);
      kggele.draggable = true;
      kggele.ondragstart = (e) => {
        e.stopPropagation();
        e.dataTransfer.setData('library_model_url', item.url);
      };
    });

    // 纹理库
    const textureContainer = new UIDiv();
    textureContainer.setHeight('300px');
    textureContainer.setOverflow('auto');
    TexturesLibrary.forEach((item) => {
      const kggele = this.createModelElement(item.icon, item.title);
      textureContainer.addDom(kggele);
      kggele.draggable = true;
      kggele.ondragstart = (e) => {
        e.stopPropagation();
        e.dataTransfer.setData('library_model_url', item.url);
      };
    });

    // 法线库
    const normalContainer = new UIDiv();
    normalContainer.setHeight('300px');
    normalContainer.setOverflow('auto');
    NormalsLibrary.forEach((item) => {
      const kggele = this.createModelElement(item.icon, item.title);
      normalContainer.addDom(kggele);
      kggele.draggable = true;
      kggele.ondragstart = (e) => {
        e.stopPropagation();
        e.dataTransfer.setData('library_model_url', item.url);
      };
    });

    tab.addTab('library', '模型库', modelContainer);
    tab.addTab('texture', '纹理库', textureContainer);
    tab.addTab('normal', '法线库', normalContainer);
    tab.select('library');
  }

  /**
   * 获取图片文字渲染
   */
  createModelElement = (imgText, titleText) => {
    const bg = document.createElement('div');
    bg.className = styles.background;

    const img = document.createElement('img');
    img.className = styles.img;
    img.src = imgText;
    bg.appendChild(img);

    const content = document.createElement('div');
    content.className = styles.content;
    bg.appendChild(content);

    const title = document.createElement('span');
    title.textContent = titleText;
    title.className = styles.title;
    content.appendChild(title);

    return bg;
  };

  /**
   * 拖拽事件
   * @type {DragEvent}
   */
  onDrop = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  };
}
