/*
 * Author  xie244135119
 * Date  2022-01-07 11:18:24
 * LastEditors  Kayson.Wan
 * LastEditTime  2023-04-04 13:57:01
 * Description  css2d 渲染相关处理
 */

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer';

import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import ThreeTool from './tool';
import ThreeLoop from './threeLoop';

/**
 * css2d 渲染器
 */
let _css2dRender = null;
/**
 * css 3d渲染器
 */
let _css3dRender = null;
/**
 * svg渲染器
 */
const _svgRender = null;

export default class Index {
  // 动态监听
  _resizeObserver = null;

  //
  threeJs = null;

  // #css2dFrameHandle = 0;

  //
  // #css3dFrameHandle = 0;

  //
  // #svgFrameHandle = 0;

  constructor(aThreeJs) {
    this.threeJs = aThreeJs;
  }

  /**
   * 文件损毁
   */
  destory = () => {
    this.removeResizeOBserver();
    ThreeLoop.removeIds(['svgFrameHandle', 'css2dFrameHandle', 'css3dFrameHandle']);
    // if (_css2dRender !== null) {
    //   window.cancelAnimationFrame(this.#css2dFrameHandle);
    // }
    // if (_css3dRender !== null) {
    //   window.cancelAnimationFrame(this.#css3dFrameHandle);
    // }
  };

  /**
   * 初始化文字LableRender
   * @param {*} aScene 场景
   * @param {*} aCamera 相机
   * @param {*} aDomElement 标签元素
   */
  setup2D = () => {
    console.log('setup2D');
    const { threeScene, threeCamera, threeContainer } = this.threeJs;
    this.addResizeOBserver(threeContainer);
    //
    let labelrender = _css2dRender;
    if (labelrender === null) {
      const render = new CSS2DRenderer();
      _css2dRender = render;
      labelrender = render;
      render.domElement.style.position = 'absolute';
      render.domElement.style.top = 0;
      // render.domElement.style.pointerEvents = 'none';//点击事件穿透
    }
    if (labelrender instanceof CSS2DRenderer) {
      labelrender.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight, true);
      threeContainer.appendChild(labelrender.domElement);
    }

    // lablerender渲染
    ThreeLoop.add(() => {
      labelrender.render(threeScene, threeCamera);
    }, 'css2dFrameHandle');
  };

  /**
   * 初始化文字LableRender
   * @param {*} aScene 场景
   * @param {*} aCamera 相机
   * @param {*} aDomElement 标签元素
   */
  setup3D = () => {
    const { threeScene, threeCamera, threeContainer } = this.threeJs;
    this.addResizeOBserver(threeContainer);
    //
    let labelrender = _css3dRender;
    if (labelrender === null) {
      const render = new CSS3DRenderer();
      _css3dRender = render;
      labelrender = render;
      render.domElement.style.position = 'absolute';
      render.domElement.style.top = 0;
      render.domElement.style.pointerEvents = 'none';
    }
    if (labelrender instanceof CSS3DRenderer) {
      labelrender.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight, true);
      threeContainer.appendChild(labelrender.domElement);
    }

    // lablerender渲染
    ThreeLoop.add(() => {
      labelrender.render(threeScene, threeCamera);
    }, 'css3dFrameHandle');
  };

  /**
   * 初始化文字LableRender
   * @param {*} aScene 场景
   * @param {*} aCamera 相机
   * @param {*} aDomElement 标签元素
   */
  setupSVG = () => {
    const { threeScene, threeCamera, threeContainer } = this.threeJs;
    this.addResizeOBserver(threeContainer);
    //
    let labelrender = _svgRender;
    if (labelrender === null) {
      const render = new SVGRenderer();
      _css3dRender = render;
      labelrender = render;
      render.domElement.style.position = 'absolute';
      render.domElement.style.top = 0;
      render.domElement.style.pointerEvents = 'none';
    }
    if (labelrender instanceof SVGRenderer) {
      labelrender.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight, true);
      threeContainer.appendChild(labelrender.domElement);
    }

    // // lablerender渲染
    ThreeLoop.add(() => {
      labelrender.render(threeScene, threeCamera);
    }, 'svgFrameHandle');
  };

  /**
   * 文本标签创建
   * @param {起始点} startPoint
   * @param {中点} middlePoint
   * @param {终点} endPoint
   * @param {文本内容} labelTitle
   */
  drawingLabel = (startPoint, middlePoint, endPoint, labelTitle = 'test') => {
    const points = [startPoint, middlePoint, endPoint];

    const material = new THREE.LineBasicMaterial({ color: 0x00c8be, linewidth: 10 });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    this.threeScene.add(line);

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
    div.textContent = labelTitle;

    // if (checkedUnitCh && checkedUnitCh.includes && checkedUnitCh.includes(labelTitle)) {
    //     div.style.backgroundColor = '#16BFB0';
    //     div.style.color = '#fff';
    // }

    const tagLabel = new CSS2DObject(div);
    tagLabel.position.set(endPoint.x, endPoint.y, endPoint.z);
    this.threeScene.add(tagLabel);
  };

  /**
   * 两点画线
   * @param {起点} v0
   * @param {终点} v3
   * @param {线宽} linewidth
   * @returns
   */
  drawLines = (v0, v3, linewidth = 0.001) => {
    if (((v0.x === v0.y) === v0.z) === 0) {
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
    const vtop = rayLine.at(hLen / rayLine.at(1).distanceTo(p0));
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
  _getVCenter(v1, v2) {
    const v = v1.add(v2);
    return v.divideScalar(2);
  }

  // 获取两点间指定比例位置坐标
  _getLenVcetor(v1, v2, len) {
    const v1v2Len = v1.distanceTo(v2);
    return v1.lerp(v2, len / v1v2Len);
  }

  /**
   * 添加动态监听
   */
  addResizeOBserver = (aContainer = document.body) => {
    const observer = new window.ResizeObserver(() => {
      // 调整labelRender 文字
      if (_css2dRender != null) {
        _css2dRender.setSize(aContainer.offsetWidth, aContainer.offsetHeight);
      }
    });
    observer.observe(aContainer);
    this._resizeObserver = observer;
  };

  /**
   * 移除动态监听
   * @param {*} aContainer
   * @returns
   */
  removeResizeOBserver = () => {
    if (this._resizeObserver !== null) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  };

  /**
   * add line
   */
  addLine = (
    startPoint = new THREE.Vector3(),
    endPoint = new THREE.Vector3(),
    depthTest = true
  ) => {
    const material = new LineMaterial({
      color: new THREE.Color(111 / 255, 175 / 255, 173 / 255),
      linewidth: 0.001,
      depthTest
    });
    const geo = new LineGeometry();
    geo.setPositions([
      startPoint.x,
      startPoint.y,
      startPoint.z,
      endPoint.x,
      endPoint.y,
      endPoint.z
    ]);
    const group = new THREE.Group();
    this.threeJs.threeScene.add(group);
    const line = new Line2(geo, material);
    group.add(line);
    this.threeJs.loadSprite(require('./assets/line_start.png').default).then((obj) => {
      obj.position.copy(startPoint);
      obj.scale.set(0.2, 0.2, 0.2);
      group.attach(obj);
    });
    return {
      line,
      group
    };
  };

  /**
   * auto compute position and create line
   * @param {*} aObj obj model
   * @param {*} meshTowards direction
   * @returns
   */
  addLineAuto = (aObj, meshTowards = 'z') => {
    if (!(aObj instanceof THREE.Object3D)) {
      return {};
    }

    const startVector = ThreeTool.getObjectCenter(aObj);
    const endVector = startVector.clone();
    const { max, min } = ThreeTool.setBoundingBox(aObj);
    const xWidth = max.x - min.x;
    const zWidth = max.z - min.z;
    const yHeight = max.y - min.y;

    const directionScale = meshTowards.indexOf('-') === -1 ? 1 : -1;
    const towardscale = 0.5;
    const sidescale = 0.5 + (0.5 * 1) / 20;
    const xdirection = meshTowards.indexOf('x') !== -1;
    const zdirection = meshTowards.indexOf('z') !== -1;
    // fix on right
    if (xdirection) {
      // x -z or  -x z
      endVector.x += xWidth * towardscale * directionScale;
      endVector.z += zWidth * sidescale * directionScale * -1;
    } else if (zdirection) {
      // -z -x  or  z x
      endVector.z += zWidth * towardscale * directionScale;
      endVector.x += xWidth * sidescale * directionScale;
    }
    endVector.y += (yHeight * 0.5 * 4) / 5;
    //
    const { group, line } = this.addLine(startVector, endVector, false);
    return {
      group,
      line,
      startVector,
      endVector
    };
  };

  // //初始化要爆炸的模型,执行一次
  // modelExplodeInit = (obj) => {
  //     //模型包围盒
  //     var modelBox3 = new THREE.Box3();
  //     var meshBox3 = new THREE.Box3();
  //     //获取模型的包围盒
  //     modelBox3.expandByObject(obj);

  //     //计算模型的中心点坐标，这个为爆炸中心
  //     var modelWorldPs = new THREE.Vector3().addVectors(modelBox3.max, modelBox3.min).multiplyScalar(0.5);

  //     obj.traverse(function (value) {
  //         if (value.isMesh) {
  //             meshBox3.setFromObject(value);

  //             //获取每个mesh的中心点，爆炸方向为爆炸中心点指向mesh中心点
  //             var worldPs = new THREE.Vector3().addVectors(meshBox3.max, meshBox3.min).multiplyScalar(0.5);
  //             if (isNaN(worldPs.x)) return;
  //             //计算爆炸方向
  //             value.worldDir = new THREE.Vector3().subVectors(worldPs, modelWorldPs).normalize();
  //             //保存初始坐标
  //             value.userData.oldPs = value.getWorldPosition(new THREE.Vector3())
  //         }
  //     });
  // }
  // /**
  //  * 模型爆炸
  //  * @param {model} obj
  //  * @param {范围} scalar
  //  */
  // modelExplode1(obj, scalar) {
  //     // this.modelExplodeInit(obj);
  //     obj.traverse(function (value) {
  //         if (!value.isMesh || !value.worldDir) return;
  //         //爆炸公式
  //         value.position.copy(new THREE.Vector3().copy(value.userData.oldPs).add(new THREE.Vector3().copy(value.worldDir).multiplyScalar(scalar)))
  //     });
  // }

  // worldToScreen = (worldVector) => {
  //   const standardVector = worldVector.project(this.threeCamera);// 世界坐标转标准设备坐标
  //   const a = window.innerWidth / 2;
  //   const b = window.innerHeight / 2;
  //   const x = Math.round(standardVector.x * a + a);// 标准设备坐标转屏幕坐标
  //   const y = Math.round(-standardVector.y * b + b);// 标准设备坐标转屏幕坐标
  //   const result = {
  //     x, y
  //   };
  //   return result;
  // };

  // /**
  //    * 隐藏线条和标签
  //    */
  // setLineAndLabelVisible = (show) => {
  //   this.threeScene.traverse((aObj) => {
  //     if (aObj instanceof THREE.Line) {
  //       aObj.visible = show;
  //     } else if (aObj instanceof CSS2DObject) {
  //       aObj.visible = show;
  //     }
  //   });
  // };
}
