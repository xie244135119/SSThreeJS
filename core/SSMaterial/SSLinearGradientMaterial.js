/* eslint-disable no-tabs */
import * as THREE from 'three';

export default class SSLinearGradientMaterial {
  /**
     *     const geometry = new THREE.BoxGeometry(40, 40, 40);
    geometry.computeBoundingBox();
    const material = BaiMo.defaultMaterial({
      uMin: geometry.boundingBox.min,
      uMax: geometry.boundingBox.max,
      uOffsetY: 20,
      uFromColor: new THREE.Color('#04f541'),
      uToColor: new THREE.Color('#0984ff'),
    });
    const box = new THREE.Mesh(geometry, material);
    this.threeJs.threeScene.add(box);
     */

  static shader = {
    vertextShader: `
varying vec3 vPosition;
varying mat4 vModelMatrix;
varying vec3 vNormal;
void main() {
    vPosition = position;
    vModelMatrix = modelMatrix;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`,
    fragmentShader: `
    varying mat4 vModelMatrix;
    uniform vec3 uMax; 
    uniform vec3 uMin; 
    uniform vec3 uFromColor; 
    uniform vec3 uToColor; 
    uniform float uOffsetY;
    vec4 uMax_world;
    vec4 uMin_world;
    varying vec3 vPosition;

    void main() {
        // 转世界坐标
        uMax_world =  vModelMatrix * vec4( uMax, 1.0 );
        uMin_world =  vModelMatrix * vec4(uMin, 1.0);

        //uMax_world = vec4(0.,100.0,0.,1.);
        //uMin_world = vec4(0.,0.0,0.,1.);

        // //vec3 distColor = outgoingLight;
        vec3 distColor= uToColor; // 底部颜色

        float rate = (vPosition.y+uOffsetY - uMin_world.y) / (uMax_world.y - uMin_world.y); 
        distColor = mix(distColor, uFromColor, rate);
        gl_FragColor = vec4(distColor, 1.0);

        //gl_FragColor = vec4(mix(distColor, uTopColor, vPosition.y), 1.0);
    }`
  };

  /**
   * model linear-gradient 渐变
   * @param {{ uMin: THREE.Vector3, uMax: THREE.Vector3, uFromColor: THREE.Color, uToColor: THREE.Color, uOffsetY: number }} param0
   * @returns
   */
  static defaultMaterial = ({ uMin, uMax, uFromColor, uToColor, uOffsetY }) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: this.shader.vertextShader,
      fragmentShader: this.shader.fragmentShader,
      transparent: true,
      uniforms: {
        uFromColor: {
          value: uFromColor || new THREE.Color(0, 1, 1)
        },
        uToColor: {
          value: uToColor || new THREE.Color(0, 0, 0)
        },
        uOffsetY: {
          value: parseFloat(uOffsetY)
        },
        uMax: {
          value: uMax || new THREE.Vector3(10, 10, 10)
        },
        uMin: {
          value: uMin || new THREE.Vector3(0, 0, 0)
        }
      }
    });
    return material;
  };
}

const vertexShader = `
  #define STANDARD
  varying vec3 vViewPosition;
  #ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
	  varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`;

const fragmentShader = `
#define STANDARD
#ifdef PHYSICAL
	#define REFLECTIVITY
	#define CLEARCOAT
	#define TRANSMISSION
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef TRANSMISSION
	uniform float transmission;
#endif
#ifdef REFLECTIVITY
	uniform float reflectivity;
#endif
#ifdef CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheen;
#endif
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <transmissionmap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#ifdef TRANSMISSION
		float totalTransmission = transmission;
	#endif
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <transmissionmap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#ifdef TRANSMISSION
		diffuseColor.a *= mix( saturate( 1. - totalTransmission + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) ), 1.0, metalness );
	#endif
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`;

const vertextShader1 = ` varying vec3 vNormal;
varying vec3 vPosition;
    void main() {
        //将attributes的normal通过varying赋值给了向量vNormal
    vNormal = normal;
    vPosition = position;
        //projectionMatrix是投影变换矩阵 modelViewMatrix是相机坐标系的变换矩阵
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, position.y, position.z, 1.0 );
}`;

const fragmentShader1 = `
uniform float uMaxY;
uniform vec3 uFromColor;
varying vec3 vNormal;
                        varying vec3 vPosition;
                        void main() {
                             float cy = (fract((vPosition.y - uMaxY / 2.0) / uMaxY) + 0.7) * 0.7;
                            // float cy = (vPosition.y/ height);
                            if(vNormal.x==0.0&&vNormal.y==1.0&&vNormal.z==0.0){
                                cy = 1.0;
                            }
                            gl_FragColor = vec4( uFromColor, cy );
                            // gl_FragColor = vec4(0, cy, cy, 1.0);
                            // gl_FragColor = vec4(1, 1, 1, cy);
                        }
`;
