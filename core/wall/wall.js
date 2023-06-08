/*
 * Author  Kayson.Wan
 * Date  2022-09-21 09:33:45
 * LastEditors  xie244135119
 * LastEditTime  2022-10-19 16:07:14
 * Description
 */

import * as THREE from 'three';
// import threeLoop from '../threeLoop';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import jianbian from './jianbian2.png';
// import flow2 from './flow.png';
import flow from './flow.png';

export default class wall {
  /**
   * 根据路径生成围墙
   * @param {Array} path [] 路径点
   * @param {*} meshName meshName
   * @param {*} height 高度 200
   * @returns mesh (未添加到scene)
   */
  createWallMesh = (path, meshName = '', height = 200) => {
    const wallMat = this.#createFlowWallMat({
      bgUrl: jianbian,
      flowUrl: flow,
      flowUrl2: flow,
      color: new THREE.Color(0 / 255, 68 / 255, 176 / 255)
    });
    const wallMesh = this.#creatWallGeometryByPath({
      material: wallMat,
      path,
      height
    });
    wallMesh.position.set(0, 0, 0);
    wallMesh.name = meshName;
    return wallMesh;
  };

  /**
   * 创建流体墙体材质
   * option =>
   * params bgUrl flowUrl
   * * */
  #createFlowWallMat = ({ bgUrl, flowUrl, flowUrl2, color }) => {
    // 顶点着色器
    const vertexShader = `
          varying vec2 vUv;
          varying vec3 fNormal;
          varying vec3 vPosition;
          void main(){
                  vUv = uv;
                  vPosition = position;
                  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                  gl_Position = projectionMatrix * mvPosition;
          }
      `;
    // 片元着色器
    const fragmentShader = `
          uniform float time;
          uniform float time2;
          varying vec2 vUv;
          uniform sampler2D flowTexture;
          uniform sampler2D flowTexture2;
          uniform sampler2D bgTexture;
          uniform vec3 bgColor;
          void main( void ) {
              vec2 position = vUv;
              vec4 colora = texture2D( flowTexture, vec2( vUv.x, fract(vUv.y - time )));
              vec4 colora_2 = texture2D( flowTexture2, vec2( vUv.x, fract(vUv.y - time2 )));
              vec4 colorb = texture2D( bgTexture , position.xy);
              // gl_FragColor = colorb + colorb * colora;
              vec4 colorBlend = colorb + colorb * colora + colorb * colora_2 ;
              gl_FragColor = vec4(colorBlend.rgb * bgColor.rgb, colorBlend.a) ;
          }
      `;
    const bgTexture = new THREE.TextureLoader().load(
      // bgUrl || './textures/mytexture/渐变蓝透.png',
      // bgUrl || '../assets/jianbian.png'
      bgUrl
    );
    const flowTexture = new THREE.TextureLoader().load(
      flowUrl || './flow.png'
      // 'https://model.3dmomoda.com/models/da5e99c0be934db7a42208d5d466fd33/0/gltf/F3E2E977BDB335778301D9A1FA4A4415.png',
      // 'https://model.3dmomoda.com/models/47007127aaf1489fb54fa816a15551cd/0/gltf/116802027AC38C3EFC940622BC1632BA.jpg',
    );
    // 允许平铺
    flowTexture.wrapS = THREE.RepeatWrapping;

    const flowTexture2 = new THREE.TextureLoader().load(flowUrl2 || '../assets/flow.png');
    // 允许平铺
    flowTexture2.wrapS = THREE.RepeatWrapping;

    const bgColor = color || new THREE.Color(1, 1, 1, 1);
    return new THREE.ShaderMaterial({
      uniforms: {
        time: {
          value: 0
        },
        time2: {
          value: 0
        },
        flowTexture: {
          value: flowTexture
        },
        flowTexture2: {
          value: flowTexture2
        },
        bgTexture: {
          value: bgTexture
        },
        bgColor: {
          value: bgColor
        }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader
    });
  };

  /**
   * 通过path构建墙体
   * option =>
   * params height path material expand(是否需要扩展路径)
   * * */
  #creatWallGeometryByPath = ({ height = 10, path = [], material, expand = true }) => {
    const pathArray = [];
    for (let i = 0; i < path.length; i++) {
      const data = path[i];
      const v3 = [data.x, data.y, data.z];
      pathArray.push(v3);
    }

    let verticesByTwo = null;
    // 1.处理路径数据  每两个顶点为为一组
    if (expand) {
      // 1.1向y方向拉伸顶点
      verticesByTwo = pathArray.reduce(
        (arr, [x, y, z]) =>
          arr.concat([
            [
              [x, y, z],
              [x, y + height, z]
            ]
          ]),
        []
      );
    } else {
      // 1.2 已经处理好路径数据
      verticesByTwo = pathArray;
    }
    // 2.解析需要渲染的四边形 每4个顶点为一组
    const verticesByFour = verticesByTwo.reduce((arr, item, i) => {
      if (i === verticesByTwo.length - 1) return arr;
      return arr.concat([[item, verticesByTwo[i + 1]]]);
    }, []);
    // 3.将四边形面转换为需要渲染的三顶点面
    const verticesByThree = verticesByFour.reduce((arr, item) => {
      const [[point1, point2], [point3, point4]] = item;
      return arr.concat(...point2, ...point1, ...point4, ...point1, ...point3, ...point4);
    }, []);
    const geometry = new THREE.BufferGeometry();
    // 4. 设置position
    const vertices = new Float32Array(verticesByThree);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]

    // 5.1 以18个顶点为单位分组
    const pointsGroupBy18 = new Array(verticesByThree.length / 3 / 6)
      .fill(0)
      .map((item, i) => verticesByThree.slice(i * 3 * 6, (i + 1) * 3 * 6));
    // 5.2 按uv周期分组
    const pointsGroupBy63 = pointsGroupBy18.map((item, i) =>
      new Array(item.length / 3).fill(0).map((it, i) => item.slice(i * 3, (i + 1) * 3))
    );
    // 5.3根据BoundingBox确定uv平铺范围
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    const rangeX = max.x - min.x;
    const uvs = [].concat(
      ...pointsGroupBy63.map((item) => {
        const point0 = item[0];
        const point5 = item[5];
        const distance =
          new THREE.Vector3(...point0).distanceTo(new THREE.Vector3(...point5)) / (rangeX / 10);
        return [0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1];
      })
    );
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    const meshMat =
      material ||
      new THREE.MeshBasicMaterial({
        // color: 0x00ffff,
        color: 0x00c0ff, // 65,94,194
        side: THREE.DoubleSide,
        transparent: true,
        // opacity: 0.5
        opacity: 0.25
      });
    return new THREE.Mesh(geometry, meshMat);
  };
}
