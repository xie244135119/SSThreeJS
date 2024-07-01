import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import Shader from './shader';
import { Radar, Wall, Fly } from './effect/index';

const radarData = [
  {
    position: {
      x: 666,
      y: 22,
      z: 0
    },
    radius: 150,
    color: '#ff0000',
    opacity: 0.5,
    speed: 2
  },
  {
    position: {
      x: -666,
      y: 25,
      z: 202
    },
    radius: 320,
    color: '#efad35',
    opacity: 0.6,
    speed: 1
  }
];
const wallData = [
  {
    position: {
      x: -150,
      y: 15,
      z: 100
    },
    speed: 0.5,
    color: '#efad35',
    opacity: 0.6,
    radius: 420,
    height: 120,
    renderOrder: 5
  }
];
const flyData = [
  {
    source: {
      x: -150,
      y: 15,
      z: 100
    },
    target: {
      x: -666,
      y: 25,
      z: 202
    },
    range: 120,
    height: 100,
    color: '#efad35',
    speed: 1,
    size: 30
  },
  {
    source: {
      x: -150,
      y: 15,
      z: 100
    },
    target: {
      x: 666,
      y: 22,
      z: 0
    },
    height: 300,
    range: 150,
    color: '#ff0000',
    speed: 1,
    size: 40
  }
];

class SetMeshShader {
  surroundLineMaterial = null;

  constructor() {
    this.fbxLoader = new FBXLoader();
    this.group = new THREE.Group();

    this.effectGroup = new THREE.Group();

    this.group.add(this.effectGroup);

    this.time = {
      value: 0
    };
    this.StartTime = {
      value: 0
    };
    this.isStart = false; // 是否启动

    // ---
    this.startTime = { value: 0 };
    this.startLength = { value: 2 };

    // // 需要做城市效果的mesh
    // const cityArray = ['CITY_UNTRIANGULATED'];

    // const floorArray = ['LANDMASS'];

    // this.loadFbx('/public/models/0921yasuo_chaifen/shanghai.FBX').then((scene) => {
    //   this.group.add(scene);
    //   // 遍历整个场景找到对应的对象
    //   scene.traverse((child) => {
    //     // 城市效果
    //     if (cityArray.includes(child.name)) {
    //       // 建筑
    //       console.log('child', child);
    //       this.setCityMaterial(child);
    //       // 添加包围线条效
    //       this.surroundLine(child);
    //     }
    //     if (floorArray.includes(child.name)) {
    //       this.setFloor(child);
    //     }
    //   });
    // });
    // 加载

    this.init();
    // this.loadObj();
  }

  loadObj = (object) => {
    // 需要做城市效果的mesh
    // const cityArray = ['CITY_UNTRIANGULATED'];____039_1.001
    const cityArray = ['"____039001"'];

    const floorArray = ['LANDMASS'];

    // this.loadFbx('/public/models/0921yasuo_chaifen/shanghai.FBX').then((scene) => {
    this.loadFbx('/public/models/9.26yasuo/station/New Folder/he.fbx').then((scene) => {
      this.group.add(scene);
      console.log(scene);
      // 遍历整个场景找到对应的对象
      scene.traverse((child) => {
        console.log(child);
        // this.setCityMaterial(child);
        // // 添加包围线条效
        // this.surroundLine(child);
        // 城市效果
        if (cityArray.includes(child.name)) {
          // 建筑
          // console.log('child', child);
          this.setCityMaterial(child);
          // 添加包围线条效
          this.surroundLine(child);
        }
        if (floorArray.includes(child.name)) {
          this.setFloor(child);
        }
      });
    });
  };

  setMaterial = (object) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.group.add(object);
      }
      // this.setCityMaterial(child);
      // // 添加包围线条效
      // this.surroundLine(child);
    });

    this.group.add(object);
    // this.setCityMaterial(object);
    // 添加包围线条效
    // this.surroundLine(object);
  };

  /**
   *  Loader Model
   */
  loadFbx(url) {
    return new Promise((resolve, reject) => {
      try {
        this.fbxLoader.load(url, (obj) => {
          resolve(obj);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  init() {
    setTimeout(() => {
      this.isStart = true;
      // 加载扫描效果
      radarData.forEach((data) => {
        const mesh = Radar(data);
        mesh.material.uniforms.time = this.time;
        this.effectGroup.add(mesh);
      });
      // 光墙
      wallData.forEach((data) => {
        const mesh = Wall(data);
        mesh.material.uniforms.time = this.time;
        this.effectGroup.add(mesh);
      });
      // 光墙
      flyData.forEach((data) => {
        const mesh = Fly(data);
        mesh.material.uniforms.time = this.time;
        mesh.renderOrder = 10;
        this.effectGroup.add(mesh);
      });
    }, 1000);
  }

  // 设置地板
  setFloor(object) {
    this.forMaterial(object.material, (material) => {
      material.color.setStyle('#040912');
    });
  }

  // Mesh
  /**
   *
   */
  setCityMaterial(object) {
    // console.log('object', object);
    // 确定oject的geometry的box size
    object.geometry.computeBoundingBox();
    object.geometry.computeBoundingSphere();

    const { geometry } = object;

    // 获取geometry的长宽高 中心点
    const { center, radius } = geometry.boundingSphere;

    const { max, min } = geometry.boundingBox;

    const size = new THREE.Vector3(max.x - min.x, max.y - min.y, max.z - min.z);

    this.forMaterial(object.material, (material) => {
      // material.opacity = 0.6;
      material.transparent = true;
      material.color.setStyle('#1B3045');

      material.onBeforeCompile = (shader) => {
        shader.uniforms.time = this.time;
        shader.uniforms.uStartTime = this.StartTime;
        // console.log('shader.uniforms.time', shader.uniforms.time);

        // 中心点
        shader.uniforms.uCenter = {
          value: center
        };

        // geometry大小
        shader.uniforms.uSize = {
          value: size
        };

        shader.uniforms.uMax = {
          value: max
        };

        shader.uniforms.uMin = {
          value: min
        };
        shader.uniforms.uTopColor = {
          value: new THREE.Color('#FFFFDC')
        };

        // 效果开关
        shader.uniforms.uSwitch = {
          value: new THREE.Vector3(
            0, // 扩散
            0, // 左右横扫
            0 // 向上扫描
          )
        };
        // 扩散
        shader.uniforms.uDiffusion = {
          value: new THREE.Vector3(
            1, // 0 1开关
            120, // 范围
            600 // 速度
          )
        };
        // 扩散中心点
        shader.uniforms.uDiffusionCenter = {
          value: new THREE.Vector3(0, 0, 0)
        };

        // 扩散中心点
        shader.uniforms.uFlow = {
          value: new THREE.Vector3(
            1, // 0 1开关
            10, // 范围
            20 // 速度
          )
        };

        // 效果颜色
        shader.uniforms.uColor = {
          value: new THREE.Color('#5588aa')
        };
        // 效果颜色
        shader.uniforms.uFlowColor = {
          value: new THREE.Color('#5588AA')
        };

        // 效果透明度
        shader.uniforms.uOpacity = {
          value: 1
        };

        // 效果透明度
        shader.uniforms.uRadius = {
          value: radius
        };

        /**
         * 对片元着色器进行修改
         */
        const fragment = `
    float distanceTo(vec2 src, vec2 dst) {
        float dx = src.x - dst.x;
        float dy = src.y - dst.y;
        float dv = dx * dx + dy * dy;
        return sqrt(dv);
    }

    float lerp(float x, float y, float t) {
        return (1.0 - t) * x + t * y;
    }

    vec3 getGradientColor(vec3 color1, vec3 color2, float index) {
        float r = lerp(color1.r, color2.r, index);
        float g = lerp(color1.g, color2.g, index);
        float b = lerp(color1.b, color2.b, index);
        return vec3(r, g, b);
    }

    varying vec4 vPositionMatrix;
    varying vec3 vPosition;

    uniform float time;
    // 扩散参数
    uniform float uRadius;
    uniform float uOpacity;
    // 初始动画参数
    uniform float uStartTime; 

    uniform vec3 uMin;
    uniform vec3 uMax;
    uniform vec3 uSize;
    uniform vec3 uFlow;
    uniform vec3 uColor;
    uniform vec3 uCenter;
    uniform vec3 uSwitch;
    uniform vec3 uTopColor;
    uniform vec3 uFlowColor;
    uniform vec3 uDiffusion; 
    uniform vec3 uDiffusionCenter;

    void main() {
        `;
        const fragmentColor = `
    vec3 distColor = outgoingLight;
    float dstOpacity = diffuseColor.a;
    
    float indexMix = vPosition.z / (uSize.z * 0.6);
    distColor = mix(distColor, uTopColor, indexMix);
    
    // 开启扩散波
    vec2 position2D = vec2(vPosition.x, vPosition.y);
    if (uDiffusion.x > 0.5) {
        // 扩散速度
        float dTime = mod(time * uDiffusion.z, uRadius * 2.0);
        // 当前的离中心点距离
        float uLen = distanceTo(position2D, vec2(uCenter.x, uCenter.z));

        // 扩散范围
        if (uLen < dTime && uLen > dTime - uDiffusion.y) {
            // 颜色渐变
            float dIndex = sin((dTime - uLen) / uDiffusion.y * PI);
            distColor = mix(uColor, distColor, 1.0 - dIndex);
        }
    }

    // 流动效果
    if (uFlow.x > 0.5) {
        // 扩散速度
        float dTime = mod(time * uFlow.z, uSize.z); 
        // 流动范围
        float topY = vPosition.z + uFlow.y;
        if (dTime > vPosition.z && dTime < topY) {
            // 颜色渐变 
            float dIndex = sin((topY - dTime) / uFlow.y * PI);

            distColor = mix(distColor, uFlowColor,  dIndex); 
        }
    }
  

    gl_FragColor = vec4(distColor, dstOpacity * uStartTime);
        `;
        shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragment);
        shader.fragmentShader = shader.fragmentShader.replace(
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
          fragmentColor
        );

        /**
         * 对顶点着色器进行修改
         */
        const vertex = `
    varying vec4 vPositionMatrix;
    varying vec3 vPosition;
    uniform float uStartTime;
    void main() {
            vPositionMatrix = projectionMatrix * vec4(position, 1.0);
            vPosition = position;
            `;
        const vertexPosition = `
    vec3 transformed = vec3(position.x, position.y, position.z * uStartTime);
            `;

        shader.vertexShader = shader.vertexShader.replace('void main() {', vertex);
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          vertexPosition
        );
      };
    });
  }

  // Line
  /**
   * 获取包围线条效果
   */
  surroundLine(object) {
    // 获取线条geometry
    const geometry = this.surroundLineGeometry(object);
    // 获取物体的世界坐标 旋转等
    const worldPosition = new THREE.Vector3();
    object.getWorldPosition(worldPosition);

    // 传递给shader重要参数
    const { max, min } = object.geometry.boundingBox;

    const size = new THREE.Vector3(max.x - min.x, max.y - min.y, max.z - min.z);

    // this.effectGroup.add();
    const material = this.createSurroundLineMaterial({
      max,
      min,
      size
    });

    const line = new THREE.LineSegments(geometry, material);

    line.name = 'surroundLine';

    line.scale.copy(object.scale);
    line.rotation.copy(object.rotation);
    line.position.copy(worldPosition);

    this.effectGroup.add(line);
  }

  /**
   * 创建包围线条材质
   */
  createSurroundLineMaterial({ max, min, size }) {
    if (this.surroundLineMaterial) return this.surroundLineMaterial;

    this.surroundLineMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: {
          value: new THREE.Color('#4C8BF5')
        },
        uActive: {
          value: new THREE.Color('#fff')
        },
        time: this.time,
        uOpacity: {
          value: 0.6
        },
        uMax: {
          value: max
        },
        uMin: {
          value: min
        },
        uRange: {
          value: 200
        },
        uSpeed: {
          value: 0.2
        },
        uStartTime: this.StartTime
      },
      vertexShader: Shader.surroundLine.vertexShader,
      fragmentShader: Shader.surroundLine.fragmentShader
    });

    return this.surroundLineMaterial;
  }

  animate = (dt) => {
    if (dt > 1) return;
    this.time.value += dt;

    // 启动
    if (this.isStart) {
      this.StartTime.value += dt * 0.5;
      if (this.StartTime.value >= 1) {
        this.StartTime.value = 1;
        this.isStart = false;
      }
    }
  };

  // 获取到包围的线条
  surroundLineGeometry(object) {
    return new THREE.EdgesGeometry(object.geometry);
  }

  forMaterial(materials, callback) {
    if (!callback || !materials) return;
    if (Array.isArray(materials)) {
      materials.forEach((mat) => {
        callback(mat);
      });
    } else {
      callback(materials);
    }
  }

  // 光圈上下移动效果
  effect() {
    let cityBuildings; // 城市建筑群
    this.group.traverse((child) => {
      if (child.name !== 'CITY_UNTRIANGULATED') return;
      cityBuildings = child;
    });

    const { geometry } = cityBuildings;
    // geometry.computeBoundingBox();
    // geometry.computeBoundingSphere();

    // const { max, min } = geometry.boundingBox;
    const max = 100;
    const min = 0;

    const materials = Array.isArray(cityBuildings.material)
      ? cityBuildings.material
      : [cityBuildings.material];
    materials.forEach((material) => {
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uMax = {
          value: max
        };

        shader.uniforms.uMin = {
          value: min
        };

        shader.uniforms.uLightColor = {
          value: new THREE.Color('#98FFDC')
        };

        shader.uniforms.uBorderWidth = {
          value: 5
        };

        shader.uniforms.uCircleTime = {
          value: 5
        };

        shader.uniforms.uTime = this.time;

        const vertex = `
          varying vec4 vPosition;

          void main() {
             vPosition = modelMatrix * vec4(position,1.0);
        `;
        shader.vertexShader = shader.vertexShader.replace('void main() {', vertex);
        // 补充颜色渐变动画需要的各种变量
        const fragment = `

          uniform mat4 modelMatrix;
         varying vec4 vPosition;
          uniform vec3 uMax; 
          uniform vec3 uMin; 
          uniform float uBorderWidth; 
          uniform vec3 uLightColor;
          uniform float uCircleTime; 
          uniform float uTime; 
          vec4 uMax_world;
          vec4 uMin_world;

          void main() {
            // 转世界坐标

            uMax_world =  modelMatrix * vec4(uMax,1.0);
            uMin_world =  modelMatrix * vec4(uMin,1.0);
  
        `;
        const fragmentColor = `
       

          vec3 distColor = outgoingLight;
           

          float residue = uTime - floor(uTime / uCircleTime) * uCircleTime;
          float rate = residue / uCircleTime;

          float lightOffset = rate * (uMax_world.y - uMin_world.y);


          if (uMin_world.y + lightOffset < vPosition.y && uMin_world.y + lightOffset + uBorderWidth > vPosition.y) {

            gl_FragColor = vec4(uLightColor, diffuseColor.a);
          } else {

            gl_FragColor = vec4(distColor, diffuseColor.a);
          }
        `;
        shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragment);
        shader.fragmentShader = shader.fragmentShader.replace(
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
          fragmentColor
        );
      };
    });
  }

  // city实例数据更新
  updateData = () => {
    if (!this.isStart) return;
    const dt = this.clock.getDelta();
    this.time.value += dt;
    this.startTime.value += dt;
    if (this.startTime.value >= this.startLength.value) {
      this.startTime.value = this.startLength.value;
    }
  };
}

export default SetMeshShader;
