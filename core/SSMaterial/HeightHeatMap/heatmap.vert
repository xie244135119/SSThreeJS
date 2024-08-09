
varying vec2 vUv;
uniform float Zscale;
uniform sampler2D greyMap;
void main(){
  vUv=uv;
  vec4 frgColor=texture2D(greyMap,uv);//获取灰度图点位信息
  float height=Zscale*frgColor.a;//通过灰度图的rgb*需要设置的高度计算出热力图每个点位最终在z轴高度
  vec3 transformed=vec3(position.x,position.y,height);//重新组装点坐标
  gl_Position=projectionMatrix*modelViewMatrix*vec4(transformed,1.);//渲染点位
  
}