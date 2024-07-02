import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import SSThreeLoop from './SSThreeLoop';
import SSThreeObject from './SSThreeObject';

export default class SSCssRenderer {
  /**
   * @description css2d render
   */
  css2dRender: CSS2DRenderer = null;

  /**
   * @description css3d render
   */
  css3dRender: CSS3DRenderer = null;

  /**
   * @description svg render
   */
  svgRender: SVGRenderer = null;

  //
  _resizeObserver: ResizeObserver = null;

  //
  _ssThreeObject: SSThreeObject = null;

  constructor(ssThreeObject) {
    this._ssThreeObject = ssThreeObject;
  }

  /**
   * 销毁
   */
  destory = () => {
    this._removeResizeOBserver();
    SSThreeLoop.removeIds(['svgFrameHandle', 'css2dFrameHandle', 'css3dFrameHandle']);
    this.cancelRender2D();
    this.cancelRender3D();
    this.cancelRenderSVG();
    this._ssThreeObject = null;
  };

  /**
   * 初始化文字LableRender
   */
  render2D = () => {
    const { threeScene, threeCamera, threeContainer } = this._ssThreeObject;
    this._addResizeObserver(threeContainer);
    //
    if (this.css2dRender) return;
    this.css2dRender = new CSS2DRenderer();
    this.css2dRender.domElement.style.position = 'absolute';
    this.css2dRender.domElement.style.top = '0px';
    this.css2dRender.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    threeContainer.appendChild(this.css2dRender.domElement);

    SSThreeLoop.add(() => {
      this.css2dRender.render(threeScene, threeCamera);
    }, 'css2dFrameHandle');
  };

  /**
   * 取消渲染2d元素
   */
  cancelRender2D = () => {
    SSThreeLoop.removeId('css2dFrameHandle');
    this.css2dRender?.domElement?.remove();
    this.css2dRender = null;
  };

  /**
   * 初始化文字LableRender
   */
  render3D = () => {
    const { threeScene, threeCamera, threeContainer } = this._ssThreeObject;
    this._addResizeObserver(threeContainer);
    //
    if (this.css3dRender) return;
    this.css3dRender = new CSS3DRenderer();
    this.css3dRender.domElement.style.position = 'absolute';
    this.css3dRender.domElement.style.top = '0px';
    this.css3dRender.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    threeContainer.appendChild(this.css3dRender.domElement);

    SSThreeLoop.add(() => {
      this.css3dRender.render(threeScene, threeCamera);
    }, 'css3dFrameHandle');
  };

  /**
   * 取消渲染2d元素
   */
  cancelRender3D = () => {
    SSThreeLoop.removeId('css3dFrameHandle');
    this.css3dRender?.domElement?.remove();
    this.css3dRender = null;
  };

  /**
   * 初始化文字LableRender
   */
  renderSVG = () => {
    const { threeScene, threeCamera, threeContainer } = this._ssThreeObject;
    this._addResizeObserver(threeContainer);
    //
    if (this.svgRender) return;
    this.svgRender = new SVGRenderer();
    this.svgRender.domElement.style.position = 'absolute';
    this.svgRender.domElement.style.top = '0px';
    this.svgRender.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    threeContainer.appendChild(this.svgRender.domElement);

    SSThreeLoop.add(() => {
      this.svgRender.render(threeScene, threeCamera);
    }, 'svgFrameHandle');
  };

  /**
   * 取消渲染svg render
   */
  cancelRenderSVG = () => {
    SSThreeLoop.removeId('svgFrameHandle');
    this.svgRender?.domElement?.remove();
    this.svgRender = null;
  };

  /**
   * 文本标签创建
   * @param startPoint
   * @param middlePoint
   * @param endPoint
   * @param labelTitle
   */
  drawingLabel = (
    startPoint: THREE.Vector3,
    middlePoint: THREE.Vector3,
    endPoint: THREE.Vector3,
    labelTitle?: string
  ) => {
    const points = [startPoint, middlePoint, endPoint];

    const material = new THREE.LineBasicMaterial({ color: 0x00c8be, linewidth: 10 });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    const div = document.createElement('div');
    div.className = 'label';
    div.style.fontSize = '40px';
    // div.style.marginTop = '-10px';
    div.style.marginTop = '-42px';
    // div.style.padding = '4px 8px';
    div.style.padding = '40px 80px';
    // div.style.backgroundColor = '#00c8be';
    // div.style.color = '#ffffff';
    div.style.backgroundColor = '#fff';
    div.style.color = '#000000';
    div.style.border = '1px solid #16BFB0';
    div.textContent = labelTitle || '示例';

    const tagLabel = new CSS2DObject(div);
    tagLabel.position.set(endPoint.x, endPoint.y, endPoint.z);
    return {
      line,
      tagLabel
    };
  };

  /**
   * 两点画线
   * @param v0
   * @param v3
   * @param linewidth 线宽
   * @returns
   */
  drawLines = (v0: THREE.Vector3, v3: THREE.Vector3, linewidth: number = 0.001) => {
    if (v0.length() === 0) {
      v0.x = 0.001;
    }
    // 夹角
    // var angle = (v0.angleTo(v3) * 1.8) / Math.PI / 0.1; // 0 ~ Math.PI
    // var angle = (v0.angleTo(v3) * 180) / Math.PI ;
    const angle = 0; // 直线
    // var aLen = angle * 0.4, hLen = angle * angle * 12;
    const aLen = angle * 2.5;
    const hLen = angle * angle * 50;
    const p0 = new THREE.Vector3(0, 0, 0);
    // 法线向量
    const rayLine = new THREE.Ray(p0, this._getVCenter(v0.clone(), v3.clone()));
    // 顶点坐标
    const vtop = rayLine.at(
      hLen / rayLine.at(1, new THREE.Vector3()).distanceTo(p0),
      new THREE.Vector3()
    );
    // 控制点坐标
    const v1 = this._getLenVcetor(v0.clone(), vtop, aLen);
    const v2 = this._getLenVcetor(v3.clone(), vtop, aLen);
    // 绘制三维三次贝赛尔曲线
    const curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
    const geometry = new LineGeometry();
    const points = curve.getPoints(50);
    const positions = [];
    const colors = [];
    const color = new THREE.Color();

    /**
     * HSL中使用渐变
     * h — hue value between 0.0 and 1.0
     * s — 饱和度 between 0.0 and 1.0
     * l — 亮度 between 0.0 and 1.0
     */
    for (let j = 0; j < points.length; j++) {
      color.setHSL(0.31666 + j * 0.005, 0.7, 0.7); // 绿色
      // color.setHSL(.81666 + j, 0.88, 0.715 + j * 0.0025); //粉色
      colors.push(color.r, color.g, color.b);
      positions.push(points[j].x, points[j].y, points[j].z);
    }
    geometry.setPositions(positions);
    geometry.setColors(colors);
    const matLine = new LineMaterial({
      // linewidth: 0.0006,
      linewidth,
      vertexColors: true,
      dashed: false
    });

    return {
      curve,
      lineMesh: new Line2(geometry, matLine)
    };
  };

  // 求两点的中点
  _getVCenter = (v1, v2) => {
    const v = v1.add(v2);
    return v.divideScalar(2);
  };

  // 获取两点间指定比例位置坐标
  _getLenVcetor = (v1, v2, len) => {
    const v1v2Len = v1.distanceTo(v2);
    return v1.lerp(v2, len / v1v2Len);
  };

  /**
   * 添加动态监听
   */
  _addResizeObserver = (aContainer = document.body) => {
    if (this._resizeObserver !== null) {
      const observer = new window.ResizeObserver(() => {
        // 调整labelRender 文字
        this.css2dRender?.setSize(aContainer.offsetWidth, aContainer.offsetHeight);
        this.css3dRender?.setSize(aContainer.offsetWidth, aContainer.offsetHeight);
        this.svgRender?.setSize(aContainer.offsetWidth, aContainer.offsetHeight);
      });
      observer.observe(aContainer);
      this._resizeObserver = observer;
    }
  };

  /**
   * 移除动态监听
   * @param {*} aContainer
   * @returns
   */
  _removeResizeOBserver = () => {
    if (this._resizeObserver !== null) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  };
}

export { CSS2DObject, CSS3DObject };
