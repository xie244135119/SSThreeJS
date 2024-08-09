import * as THREE from 'three';
import FragShader from './heatmap.frag?raw';
import VertShader from './heatmap.vert?raw';

/**
 * 高度热力图
 */
export default class HeightHeatMaterial {
  /**
   * 获取热力图材质
   * @returns
   */
  static getMaterial(heatMapContainer: HTMLDivElement, params?: THREE.ShaderMaterialParameters) {
    const heatMapMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: VertShader,
      fragmentShader: FragShader,
      uniforms: {
        heatMap: {
          value: { value: undefined }
        },
        greyMap: {
          value: { value: undefined }
        },
        Zscale: { value: 100.0 },
        u_color: { value: new THREE.Color('rgb(255, 255, 255)') },
        u_opacity: {
          value: 1.0
        }
      },
      ...(params || {})
    });
    let texture = new THREE.Texture(heatMapContainer);
    texture.needsUpdate = true;
    let texture2 = new THREE.Texture(heatMapContainer);
    texture2.needsUpdate = true;
    heatMapMaterial.uniforms.heatMap.value = texture;
    heatMapMaterial.side = THREE.DoubleSide; // 双面渲染
    heatMapMaterial.uniforms.greyMap.value = texture2;
    return heatMapMaterial;
  }
}
