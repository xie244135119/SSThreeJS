/*
 * @Author: Kayson.Wan
 * @Date: 2022-04-27 14:05:01
 * LastEditors  xie244135119
 * LastEditTime  2022-10-19 16:45:22
 * @FilePath: /isop-portal/src/js/ThreeJs/flyLine/FlyLine.js
 */

import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { Mesh, Scene } from 'three';
import ThreeLoop from '../threeLoop';

class FlyLine {
  _scene = null;

  _camera = null;

  _container = null;

  constructor({ scene, camera, container }) {
    this._scene = scene;
    this._camera = camera;
    this._container = container;
  }

  _currlineMat = null;

  _currlineMats = [];

  _currlines = [];

  _commonUniforms = {
    u_time: { value: 0.0 }
  };

  _iframe = null;

  // test飞线效果测试
  // 曲线
  // curve = new THREE.CatmullRomCurve3([
  //   new THREE.Vector3(-80, 0, 80),
  //   new THREE.Vector3(-50, 50, 50),
  //   new THREE.Vector3(0, 0, 0)
  // ]);
  list = [
    new THREE.Vector3(-16.37444440778362, 24.789550892944337, 4.733498246730736),
    new THREE.Vector3(-16.809834242317585, 23.157209591628238, 4.780047441069546),
    new THREE.Vector3(-19.97566143277342, 23.932498646718475, 9.559964588074813),
    new THREE.Vector3(-16.556277250971814, 24.96168858473395, 11.04670290262022),
    new THREE.Vector3(-16.18719776496182, 24.988538105426695, 10.920189663372224)
  ];

  curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-16.37444440778362, 24.789550892944337, 4.733498246730736),
    new THREE.Vector3(-16.809834242317585, 23.157209591628238, 4.780047441069546),
    new THREE.Vector3(-19.97566143277342, 23.932498646718475, 9.559964588074813),
    new THREE.Vector3(-16.556277250971814, 24.96168858473395, 11.04670290262022),
    new THREE.Vector3(-16.18719776496182, 24.988538105426695, 10.920189663372224)
  ]);

  // 材质属性
  params = {
    speed: 0.5,
    color: new THREE.Color(1, 1, 1),
    number: 1.0,
    length: 0.9,
    size: 2.0
  };

  Flyline = () => {
    const line = this.creatFlyLine(this.curve, this.params, 1000);
    this.addGui();
    return line;
  };

  // 根据点创建cube
  creatCube = () => {
    const list = [];
    for (let i = 0; i < this.list.length; i++) {
      const mat = new THREE.MeshBasicMaterial();
      const cube = new THREE.SphereBufferGeometry(0.2);
      const mesh = new THREE.Mesh(cube, mat);
      mesh.position.copy(this.list[i]);
      list.push(mesh);
    }
    return list;
  };
  //----------------------

  /**
   * 销毁
   */
  destroy = (scene) => {
    // cancelAnimationFrame(this._iframe);
    ThreeLoop.removeId(this._iframe);
    this._iframe = null;
    this._currlines.forEach((line) => {
      line.traverse((obj) => {
        if (obj.type === 'Mesh') {
          obj.geometry.dispose();
          obj.material.dispose();
        }
      });
      scene.remove(line);
    });
    this._currlines = [];
  };

  /**
   * 添加调试GUI
   */
  addGui = () => {
    // 鼠标键盘事件
    this.addEvent();
    const gui = new GUI();
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '1.5rem';
    gui.domElement.style.right = '1.2rem';
    gui.domElement.style.zIndex = 2000;
    gui.name = 'three调试配置';
    gui.width = 300;
    gui.closed = false;

    gui.add(this.params, 'speed', 0.0, 20.0).onChange((value) => {
      // this._currlineMat.uniforms.speed.value = value;
      this._currlineMats.forEach((mat) => {
        mat.uniforms.speed.value = value;
      });
    });
    gui.addColor(this.params, 'color').onChange((value) => {
      // console.log('color', this._currlineMat.uniforms.color.value);
      // this._currlineMat.uniforms.color.value = new THREE.Color(value.r / 255, value.g / 255, value.b / 255);
      this._currlineMats.forEach((mat) => {
        mat.uniforms.color.value = new THREE.Color(value.r / 255, value.g / 255, value.b / 255);
      });
    });
    gui.add(this.params, 'number', 0.0, 20.0).onChange((value) => {
      // this._currlineMat.uniforms.number.value = value;
      this._currlineMats.forEach((mat) => {
        mat.uniforms.number.value = value;
      });
    });
    gui.add(this.params, 'length', 0.0, 10.0).onChange((value) => {
      // this._currlineMat.uniforms.length.value = value;
      this._currlineMats.forEach((mat) => {
        mat.uniforms.length.value = value;
      });
    });
    gui.add(this.params, 'size', 0.0, 6.0).onChange((value) => {
      // this._currlineMat.uniforms.size.value = value;
      this._currlineMats.forEach((mat) => {
        mat.uniforms.size.value = value;
      });
    });
    gui.open();
  };

  /**
   * 调试工具事件
   */
  addEvent = () => {
    this._container.addEventListener('dblclick', this._onElementDbClick);
    window.addEventListener('keydown', this._onElementKeydown);
  };

  _onElementDbClick = (e) => {
    let models = this.getModelsByPoint({ x: e.clientX, y: e.clientY });
    models = models.filter((item) => item?.object?.material?.transparent !== true);
    // console.log('点击', models);
    const cube = new THREE.SphereBufferGeometry(1);
    const mat = new THREE.MeshBasicMaterial({ color: 'red' });
    const mesh = new Mesh(cube, mat);
    mesh.position.copy(models[0].point);
    mesh.updateWorldMatrix(true, true);
    this._scene.add(mesh);
    this.clickMesh.push(mesh);
    this.clickPoints.push(mesh.position);
    // console.log(JSON.stringify(this.clickPoints))
    const v3 = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
    // let s =
    //   'new THREE.Vector3(' + mesh.position.x + ',' + mesh.position.y + ',' + mesh.position.z + ')';
    // this.str.push(s);
    this.str.push(v3);

    const string = JSON.stringify(this.str);
    console.log(string);
  };

  clickPoints = [];

  clickMesh = [];

  str = [];

  _onElementKeydown = (e) => {
    switch (e) {
      case e:
        // 27; // Esc
        this.clickPoints.splice(this.clickPoints.length - 1, 1);
        console.log(this.clickPoints);
        this._scene.remove(this.clickMesh[this.clickMesh.length - 1]);
        this.clickMesh.splice(this.clickMesh.length - 1, 1);
        this.str.splice(this.str.length - 1, 1);
        break;
      default:
        break;
    }
  };

  /**
   * 根据屏幕测点位置 获取相应的模型信息
   * @param {*} aPoint 点位信息
   * @returns
   */
  getModelsByPoint = (aPoint = { x: 0, y: 0 }) => {
    const mousex = (aPoint.x / this._container.offsetWidth) * 2 - 1;
    const mousey = -(aPoint.y / this._container.offsetHeight) * 2 + 1;
    const raycaster1 = new THREE.Raycaster();
    raycaster1.setFromCamera({ x: mousex, y: mousey }, this._camera);
    const groups = this._scene.children.filter((item) => item instanceof THREE.Group);
    const intersects = raycaster1.intersectObjects(groups, true);
    // console.log(' 第一套方案 获取到的模型点击 ', intersects);
    // return intersects;

    const canvas = this._container;
    // canvas.style.border = '1px solid red';
    // console.log(' 摄像头屏幕 点击按钮事件 ', aPoint, canvas.getBoundingClientRect());
    const x = ((aPoint.x - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1; // 规范设施横坐标
    // 这里的mainCanvas是个dom元素,getBoundingClientRectangle会返回以后元素的视口大小.
    const y = -((aPoint.y - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1; // 规范设施纵坐标
    const standardVector = new THREE.Vector3(x, y, 1); // 规范设施坐标
    // 规范设施坐标转世界坐标
    const worldVector = standardVector.unproject(this._camera);
    // 射线投射方向单位向量(worldVector坐标减相机地位坐标)
    const ray = worldVector.sub(this._camera.position).normalize();
    // 创立射线投射器对象
    const raycaster = new THREE.Raycaster(this._camera.position, ray);
    // 获取raycaster直线和所有模型相交的数组汇合
    const models = raycaster.intersectObjects(groups, true);
    // console.log(' 第二套方案 获取到的模型点击 ', intersects);
    return models;
  };

  // 根据curve和颜色 生成线条
  /**
   * @param curve {THREE.Curve} 路径,
   * @param matSetting {Object} 材质配置项
   * @param pointsNumber {Number} 点的个数 越多越细致
   * */
  creatFlyLine = (
    curve,
    matSetting = {
      speed: 0.5,
      color: new THREE.Color(1, 0, 0),
      number: 1.0,
      length: 0.9,
      size: 2.0
    },
    pointsNumber = 1000
  ) => {
    // 弯道锐化 tension = 0 =>直角弯曲
    curve.curveType = 'catmullrom';
    curve.tension = 0;
    const points = curve.getPoints(pointsNumber);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const { length } = points;
    const percents = new Float32Array(length);
    for (let i = 0; i < points.length; i += 1) {
      percents[i] = i / length;
    }

    geometry.setAttribute('percent', new THREE.BufferAttribute(percents, 1));

    const lineMaterial = this._initLineMaterial(matSetting);
    this._currlineMat = lineMaterial;
    this._currlineMats.push(lineMaterial);
    const flyLine = new THREE.Points(geometry, lineMaterial);
    this._currlines.push(flyLine);
    // let euler = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    // flyLine.setRotationFromEuler(euler);
    // 动画
    if (!this._iframe) {
      this._iframe = ThreeLoop.add(() => {
        if (this._commonUniforms) {
          this._commonUniforms.u_time.value += 0.01;
        }
      }, 'fly line render');
    }
    return flyLine;
  };

  // 首先要写出一个使用fragmentshader生成的material并赋在点上
  _initLineMaterial = (setting) => {
    const number = setting ? Number(setting.number) || 1.0 : 1.0; // 在一个路径中同时存在的个数
    const speed = setting ? Number(setting.speed) || 1.0 : 1.0; // 速度约大越快
    const length = setting ? Number(setting.length) || 0.5 : 0.5; // 单根线的长度0-1之间1代表全满
    const size = setting ? Number(setting.size) || 3.0 : 3.0; // 在最大的地方的大小 默认为3像素
    // let color = setting ? setting.color || new THREE.Vector3(0, 1, 1) : new THREE.Vector3(0, 1, 1); // 颜色此处以Vector3的方式传入分别为RBG值 都是0-1的范围

    const v3color = new THREE.Vector3(setting.color.r, setting.color.g, setting.color.b);
    const color = setting ? v3color || new THREE.Vector3(0, 1, 1) : new THREE.Vector3(0, 1, 1); // 颜色此处以Vector3的方式传入分别为RBG值 都是0-1的范围

    const singleUniforms = {
      u_time: this._commonUniforms.u_time,
      number: { type: 'f', value: number },
      speed: { type: 'f', value: speed },
      length: { type: 'f', value: length },
      size: { type: 'f', value: size },
      color: { type: 'v3', value: color }
    };
    const lineMaterial = new THREE.ShaderMaterial({
      uniforms: singleUniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    return lineMaterial;
  };

  vertexShader = [
    'varying vec2 vUv;',
    'attribute float percent;',
    'uniform float u_time;',
    'uniform float number;',
    'uniform float speed;',
    'uniform float length;',
    'varying float opacity;',
    ' uniform float size;',
    'void main()',
    '{',
    ' vUv = uv;',
    '   vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
    '    float l = clamp(1.0-length,0.0,1.0);', // 空白部分长度
    ' gl_PointSize = clamp(fract(percent*number + l - u_time*number*speed)-l ,0.0,1.) * size * (1./length);',
    '  opacity = gl_PointSize/size;',
    '    gl_Position = projectionMatrix * mvPosition;',
    '}'
  ].join('\n');

  fragmentShader = [
    'varying float opacity;',
    'uniform vec3 color;',
    'void main(){',
    ' if(opacity <=0.2){',
    'discard;',
    ' }',
    'gl_FragColor = vec4(color,1.0);',
    '}'
  ].join('\n');
}

export default FlyLine;
