# ss-threejs

a 3dtool for web base three

## Installation

---

#### Use Npm

    npm install ss-threejs

#### Use Npx

    npx ss-threejs

#### Use Yarn

    yarn install ss-threejs

## Project

1、 install: yarn install ss-threejs（详细看 Installation ）
2、 Webpack: webpack.config.js 配置中增加 pulgin 额外配置

plugins: [
new CopyWebpackPlugin({
patterns: [
{
from: "node_modules/three/examples/jsm/libs/draco/",
to: "static/three/draco",
},
{
from: "node_modules/three/examples/jsm/libs/basis/",
to: "static/three/basis",
},
],
}),
]

3、vite：同理

## Update Versions log

    1.4.15
    增加星空效果Stars组件
    增加反射地面Reflector组件
    丰富SSTool工具类方法
    修复PostProcessPlugin组件bug
    WebGLRenderer默认关闭 alpha/logarithmicDepthBuffer

    1.4.14
    增加星空效果Stars组件
    增加反射地面Reflector组件
    丰富SSTool工具类方法
    修复PostProcessPlugin组件bug
    WebGLRenderer默认关闭 alpha/logarithmicDepthBuffer

    1.4.13
    优化tween动画效果；
    修复useTweenAnimate调用异常问题;
    完善SSPlugins/PostProcessPlugin组件;

    1.4.11
    1.4.12
    做SSThreeLoop.removeIds防御处理

    1.4.10
    修复DistanceMeasure组件 字体加载异常的问题；
    增加后处理PostProcessPlugin插件；
    优化完善路径 SSMesh/PathMesh组件；
    优化完善 SSPlugins/DrawLinePlugin 插件；

    1.4.9
    修复SSTransformControl组件 旋转事件冲突的问题

    1.4.8
    修复TransformControl组件添加boxhelper层级的问题;
    新增测距组件（SSPlugins/DistanceMeasure.ts）;

    1.0.3
    1）优化模型加载处理

    1.0.0
    1.0.1
    1.0.2
    更新日志

1）threejs 版本发布

## three 版本对应关系

    1.4.7 - threejs 0.152.1
