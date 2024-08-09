
varying vec2 vUv;
uniform sampler2D heatMap;//热力图
uniform vec3 u_color;//基础颜色
uniform float u_opacity;// 透明度
void main(){
  //vec4 alphaColor = texture2D(heatMap, vUv);
  // gl_FragColor = alphaColor;
  gl_FragColor=vec4(u_color,u_opacity)*texture2D(heatMap,vUv);//把热力图颜色和透明度进行渲染
}