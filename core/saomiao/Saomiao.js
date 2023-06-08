/*
 * Author  Kayson.Wan
 * Date  2022-09-27 10:52:09
 * LastEditors  xie244135119
 * LastEditTime  2022-10-19 16:17:27
 * Description
 */
import * as THREE from 'three';
import ThreeLoop from '../threeLoop';

export default class Saomiao {
  scene = null;

  camera = null;

  renderer = null;

  shadermaterial = null;

  constructor(_scene) {
    this.scene = _scene;
    // this.camera = _camera;
    // this.renderer = _renderer;

    // this.create();
  }

  create = () => {
    let groundShadermaterial = null;
    const shaderCircleWidth = 550;
    const clock = new THREE.Clock();
    const map = new THREE.TextureLoader().load('./public/threeTextures/building.png');
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;

    const vertexShader = `varying vec2 vUv;
          varying vec3 v_position;
          void main() {
              vUv = uv;
              v_position = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`;
    const fragmentShader = `varying vec2 vUv;
            // precision highp float;
          varying vec3 v_position;
      
          uniform float innerCircleWidth;
          uniform float circleWidth;
          uniform float opacity;
          uniform vec3 center;
          
          uniform vec3 color;
          uniform sampler2D texture;
      
          void main() {
              float dis = length(v_position - center);
              if(dis < (innerCircleWidth + circleWidth) && dis > innerCircleWidth) {
                  float r = (dis - innerCircleWidth) / circleWidth;
                  vec4 tex = texture2D( texture, vUv);
                  gl_FragColor = mix(tex, vec4(color, opacity), r);
              }else {
                  gl_FragColor = texture2D( texture, vUv);
              }
          }`;

    const groundVertexShader = ` varying vec2 vUv;
          varying vec3 v_position;
          void main() {
              vUv = uv;
              v_position = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`;

    const groundFragmentShader = `varying vec2 vUv;
        // precision highp float;
          varying vec3 v_position;
      
          uniform float innerCircleWidth;
          uniform float circleWidth;
          uniform float opacity;
          uniform vec3 center;
          
          uniform vec3 color;
          uniform vec3 diff;
      
          void main() {
              float dis = length(v_position - center);
              if(dis < (innerCircleWidth + circleWidth) && dis > innerCircleWidth) {
                  float r = (dis - innerCircleWidth) / circleWidth;
                 
                  gl_FragColor = mix(vec4(diff, 0.1), vec4(color, opacity), r);
              }else {
                  gl_FragColor = vec4(diff, 0.1);
              }
          }`;

    this.shadermaterial = new THREE.ShaderMaterial({
      uniforms: {
        texture: {
          value: map //--
        },
        innerCircleWidth: {
          value: 0
        },
        circleWidth: {
          value: shaderCircleWidth
        },
        color: {
          value: new THREE.Color(0.0, 0.0, 1.0)
        },
        opacity: {
          value: 0.9
        },
        center: {
          value: new THREE.Vector3(0, 0, 0)
        }
      },
      vertexShader,
      fragmentShader,
      // side: THREE.DoubleSide,              // 双面可见
      transparent: true
    });

    groundShadermaterial = new THREE.ShaderMaterial({
      uniforms: {
        innerCircleWidth: {
          value: 0
        },
        circleWidth: {
          value: shaderCircleWidth
        },
        diff: {
          value: new THREE.Color(0.2, 0.2, 0.2)
        },
        color: {
          value: new THREE.Color(0.0, 0.0, 1.0)
        },
        opacity: {
          value: 0.3
        },
        center: {
          value: new THREE.Vector3(0, 0, 0)
        }
      },
      vertexShader: groundVertexShader,
      fragmentShader: groundFragmentShader,
      // side: THREE.DoubleSide,              // 双面可见
      transparent: true
    });

    const groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
    // var groundMat = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeo, groundShadermaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    ThreeLoop.add(() => {
      if (!this.shadermaterial || !groundShadermaterial) {
        return;
      }
      this.shadermaterial.uniforms.innerCircleWidth.value += 10;
      if (this.shadermaterial.uniforms.innerCircleWidth.value > 3000) {
        this.shadermaterial.uniforms.innerCircleWidth.value = -shaderCircleWidth;
      }
      groundShadermaterial.uniforms.innerCircleWidth.value += 10;
      if (groundShadermaterial.uniforms.innerCircleWidth.value > 3000) {
        groundShadermaterial.uniforms.innerCircleWidth.value = -shaderCircleWidth;
      }
    }, 'saomiao');
  };
}
