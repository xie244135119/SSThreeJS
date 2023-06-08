/*
 * Author  Kayson.Wan
 * Date  2022-09-27 13:41:21
 * LastEditors  xie244135119
 * LastEditTime  2022-10-19 16:14:14
 * Description
 */
/*
 * Author  Kayson.Wan
 * Date  2022-09-27 10:52:09
 * LastEditors  Kayson.Wan
 * LastEditTime  2022-09-27 12:19:01
 * Description
 */
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import * as THREE from 'three';
import ThreeLoop from '../threeLoop';

export default class Saomiao2 {
  // scene = null;
  // camera = null;
  // renderer = null;
  // material = null;
  // isSetupLoop = false;
  // composer = null;
  threeJs = null;

  constructor(_threeJs) {
    this.threeJs = _threeJs;
    // this.scene = _scene;
    // composer = _composer;
    // this.camera = _camera;
    // this.renderer = _renderer;
    // this.create();

    const getCity = () => {
      const uniform = {
        // u_color: { value: new THREE.Color('#3694ff') },
        u_color: { value: new THREE.Color('black') },
        // u_tcolor: { value: new THREE.Color('#00ffd1') },
        u_tcolor: { value: new THREE.Color('#00FFFF') },
        u_r: { value: 25 },
        u_length: { value: 100 }, // 扫过区域
        u_max: { value: 300 } // 扫过最大值
      };
      const Shader = {
        vertexShader: `
                varying vec3 vp;
                void main(){
                vp = position;
                gl_Position=projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
        fragmentShader: `
                varying vec3 vp;
                uniform vec3 u_color;
                uniform vec3 u_tcolor;
                uniform float u_r;
                uniform float u_length;
                uniform float u_max;
                float getLeng(float x, float y){
                    return  sqrt((x-0.0)*(x-0.0)+(y-0.0)*(y-0.0));
                }
                void main(){
                    float uOpacity = 0.3;
                    vec3 vColor = u_color;
                    float uLength = getLeng(vp.x,vp.z);
                    if ( uLength <= u_r && uLength > u_r - u_length ) {
                        float op = sin( (u_r - uLength) / u_length ) * 0.6 + 0.3 ;
                        uOpacity = op;
                        if( vp.y<0.0){
                            vColor  = u_tcolor * 0.6;
                        }else{
                            vColor = u_tcolor;
                        };
                    }
                    gl_FragColor = vec4(vColor,uOpacity);
                }
            `
      };
      this.material = new THREE.ShaderMaterial({
        vertexShader: Shader.vertexShader,
        fragmentShader: Shader.fragmentShader,
        // side: THREE.DoubleSide,
        side: THREE.BackSide,
        uniforms: uniform,
        transparent: true,
        depthWrite: false
      });
      // var loaderobj = new OBJLoader();
      // loaderobj.load('./public/models/city-gry1.obj', (object) => {
      //   object.children.forEach((element) => {
      //     element.material = this.material;
      //   });
      //   // let size = 0.3;
      //   // object.scale.set(size, size, size);
      //   this.scene.add(object);
      //   object.name = 'city';
      // });
    };

    const load = () => {
      getCity();
    };
    load();
    // animation();
    const clock = new THREE.Clock();
    ThreeLoop.add(() => {
      const delta = clock.getDelta();
      if (this.material) {
        this.material.uniforms.u_r.value += delta * 500;
        if (this.material.uniforms.u_r.value >= 3000) {
          this.material.uniforms.u_r.value = 20;
        }
      }
    }, 'saomiao2 render');

    if (!this.isSetupLoop) {
      this.isSetupLoop = true;
      // var clock = new THREE.Clock();
      // ThreeLoop.add(() => {
      //   var delta = clock.getDelta();
      //   if (this.material) {
      //     this.material.uniforms.u_r.value += delta * 500;
      //     if (this.material.uniforms.u_r.value >= 3000) {
      //       this.material.uniforms.u_r.value = 20;
      //     }
      //   }
      // });
    }
  }

  setMaterial = (mesh) => {
    if (mesh instanceof THREE.Mesh) {
      mesh.material = this.material;
    }
  };

  // 后处理 ,延迟
  initComposer = () => {
    const _pixelRatio = window.devicePixelRatio;
    console.log('this.threeJs.threeRenderer', this.threeJs.threeRenderer);
    const composer = new EffectComposer(this.threeJs.threeRenderer);
    composer.setSize(
      this.threeJs.threeContainer.clientWidth * _pixelRatio,
      this.threeJs.threeContainer.clientHeight * _pixelRatio
    );
    const renderScene = new RenderPass(this.threeJs.threeScene, this.threeJs.threeCamera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.5;
    bloomPass.strength = 1;
    bloomPass.radius = 1;
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    this.threeJs._effectComposer = composer;
  };
}
