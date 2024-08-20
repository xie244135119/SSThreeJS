/* eslint-disable no-tabs */
/*
 * Author  xie244135119
 * Date  2022-09-23 17:21:18
 * LastEditors  xie244135119
 * LastEditTime  2022-10-19 16:18:54
 * Description 通用光效扫描材质<未测试>
 */
import * as THREE from 'three';

export default class SSLightScanMaterial {
  /**
   * 获取光效扫描材质
   */
  static getLightScanMaterial = () => {
    const vertexShader = [
      'varying vec3 vColor;',
      'varying vec3	vVertexNormal;',
      'varying vec2 vUv;',
      'varying float v_pz; ',
      'void main(){',
      '   v_pz = position.y; ', // 获取顶点位置的y
      'vVertexNormal= normal;', // 顶点法向量---内置
      '   vColor = color;', // 顶点颜色
      'gl_Position= projectionMatrix * modelViewMatrix * vec4(position, 1.0);', // 顶点位置
      '}'
    ].join('\n');
    const fragmentShader = [
      'uniform float	boxH;', // 立方体高度，uniform传入
      'varying vec3	vVertexNormal;', // 顶点法向量，由顶点着色器传入--插值
      'varying vec3 vColor;', // 顶点颜色，由顶点着色器传入--插值
      'varying vec2 vUv;', // 纹理坐标，顶点着色器传入
      'varying float v_pz; ', // y的值，顶点着色器传入
      'float plot ( float pct){', // pct是box的高度，v_pz是y的值
      'return  smoothstep( pct-8.0, pct, v_pz) -', // （smoothstep(edge1,edge2,x)）smoothstep函数定义从0到1之间由edge1和edge2上下边界，x为输入值，返回插值
      'smoothstep( pct, pct+0.02, v_pz);', // 不在0-1范围内的数会被归一化到0和1内，越界会被设为0/1
      '}',
      'void main(){',
      'float f1 = plot(boxH);', // 以当前盒子的高度（光效），和y的值计算出颜色
      'vec4 b1 = mix(vec4(1.0,1.0,1.0,1.0),vec4(f1,f1,f1,1.0),0.8);',
      'gl_FragColor = mix(vec4(vColor,1.0),b1, f1);', // 混合两种颜色
      'gl_FragColor = vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,0.9);', // 重新设置片元颜色
      '}'
    ].join('\n');

    //
    const ShaderBar = {
      uniforms: {
        boxH: { value: 0 }
      },
      vertexShader,
      fragmentShader
    };
    const material = new THREE.ShaderMaterial({
      uniforms: ShaderBar.uniforms,
      vertexShader: ShaderBar.vertexShader,
      fragmentShader: ShaderBar.fragmentShader,
      // vertexColors: ShaderBar // 暂时未理解该处作用
    });
    material.needsUpdate = true;
    return [material, ShaderBar];
  };
}
