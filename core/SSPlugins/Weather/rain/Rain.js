import * as THREE from 'three';
import ThreeLoop from '../../SSThreeLoop';

export default class Rain {
  threeJs = null;

  constructor(threejs) {
    this.threeJs = threejs;
  }

  /**
   * 下雨
   */
  addRain = () => {
    const box = new THREE.Box3(
      new THREE.Vector3(-4000, -4000, -4000),
      new THREE.Vector3(4000, 4000, 4000)
    );
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.8,
      map: new THREE.TextureLoader().load('./public/three/img/circle.png'),
      depthWrite: false
    });

    material.onBeforeCompile = function (shader, renderer) {
      const getFoot = `
                uniform float top;
                uniform float bottom;
                uniform float time;
                #include <common>
                float angle(float x, float y){
                  return atan(y, x);
                }
                vec2 getFoot(vec2 camera,vec2 normal,vec2 pos){
                    vec2 position;
    
                    float distanceLen = distance(pos, normal);
    
                    float a = angle(camera.x - normal.x, camera.y - normal.y);
    
                    if(pos.x > normal.x){
                      a -= 0.785; 
                    }
                    else{
                      a += 0.785; 
                    }
    
                    position.x = cos(a) * distanceLen;
                    position.y = sin(a) * distanceLen;
                    
                    return position + normal;
                }
                `;
      const begin_vertex = `
                vec2 foot = getFoot(vec2(cameraPosition.x, cameraPosition.z),  vec2(normal.x, normal.z), vec2(position.x, position.z));
                float height = top-bottom;
                float y = normal.y - bottom - height*time;
                if(y < 0.0) y += height;
                float ratio = (1.0 - y /height) * (1.0 - y /height);
                y = height * (1.0 - ratio);
                y += bottom;
                y += position.y - normal.y;
                vec3 transformed = vec3( foot.x, y, foot.y );
                // vec3 transformed = vec3( position );
                `;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', getFoot);
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', begin_vertex);

      shader.uniforms.cameraPosition = {
        value: new THREE.Vector3(0, 200, 0)
      };
      shader.uniforms.top = {
        value: 2000
      };
      shader.uniforms.bottom = {
        value: -2000
      };
      shader.uniforms.time = {
        value: 0
      };
      material.uniforms = shader.uniforms;
    };

    //   ----
    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < 10000; i++) {
      const pos = new THREE.Vector3();
      pos.x = Math.random() * (box.max.x - box.min.x) + box.min.x;
      pos.y = Math.random() * (box.max.y - box.min.y) + box.min.y;
      pos.z = Math.random() * (box.max.z - box.min.z) + box.min.z;

      const height = ((box.max.y - box.min.y) / 15) * 0.5;
      const width = (height / 50) * 0.5;

      vertices.push(
        pos.x + width,
        pos.y + height / 2,
        pos.z,
        pos.x - width,
        pos.y + height / 2,
        pos.z,
        pos.x - width,
        pos.y - height / 2,
        pos.z,
        pos.x + width,
        pos.y - height / 2,
        pos.z
      );

      normals.push(
        pos.x,
        pos.y,
        pos.z,
        pos.x,
        pos.y,
        pos.z,
        pos.x,
        pos.y,
        pos.z,
        pos.x,
        pos.y,
        pos.z
      );

      uvs.push(1, 1, 0, 1, 0, 0, 1, 0);

      indices.push(i * 4 + 0, i * 4 + 1, i * 4 + 2, i * 4 + 0, i * 4 + 2, i * 4 + 3);
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

    const mesh = new THREE.Mesh(geometry, material);

    let time = 0;
    const clock = new THREE.Clock();
    ThreeLoop.add(() => {
      time = (time + clock.getDelta() * 0.2) % 1;

      // console.log(time);
      if (!this.threeJs) {
        // return;
      }
      material.cameraPosition = this.threeJs.threeCamera.position;

      if (material.uniforms) {
        material.uniforms.cameraPosition.value = this.threeJs.threeCamera.position;
        material.uniforms.time.value = time;
      }
    }, 'rain render');

    return mesh;
  };
}
