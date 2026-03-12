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

    v1.5.12
    1.SSTransformControl更新
    2.BaseLightSetting更新

    v1.5.1
    1.更新three版本至^0.172.0

    v1.5.0
    1.更新three版本至^0.161.0
    2.postprocessing.js版本升级至^6.37.8
    2.修复路径引用问题

    v1.4.21
    1.增加动画控制器 AnimationController
    2.SSPostProcessPlugin新增效果，默认开启frameBufferType
    3.修复已知问题

    v1.4.20
    1.增加VolumetricClouds体积云效果
    2.修复draco模型加载以及dracoLoader未释放内存溢出问题
    3.SSPostProcessPlugin内存释放优化
    4.修复window平台鼠标拖拽限制问题

    v1.4.19
    v1.4.18
    1.修复缓存偶尔崩溃数据销毁的问题
    2.增加动画定时渲染机制

    v1.4.17
    修复缓存偶尔崩溃的问题
    修复视角转场偶尔崩溃的问题

    v1.4.16
    v1.4.15

    v1.4.14
    修复SSCore addSky的问题
    增加星空效果Stars组件
    增加反射地面Reflector组件
    丰富SSTool工具类方法
    修复PostProcessPlugin组件bug
    WebGLRenderer默认关闭 alpha/logarithmicDepthBuffer

    v1.4.13
    优化tween动画效果；
    修复useTweenAnimate调用异常问题;
    完善SSPlugins/PostProcessPlugin组件;

    v1.4.11
    v1.4.12
    做SSThreeLoop.removeIds防御处理

    v1.4.10
    修复DistanceMeasure组件 字体加载异常的问题；
    增加后处理PostProcessPlugin插件；
    优化完善路径 SSMesh/PathMesh组件；
    优化完善 SSPlugins/DrawLinePlugin 插件；

    v1.4.9
    修复SSTransformControl组件 旋转事件冲突的问题

    v1.4.8
    修复TransformControl组件添加boxhelper层级的问题;
    新增测距组件（SSPlugins/DistanceMeasure.ts）;

    v1.0.3
    1）优化模型加载处理

    v1.0.0
    v1.0.1
    v1.0.2
    更新日志

## three 版本对应关系

    v1.5.1 threejs版本 0.172.0
    v1.5.0 threejs版本 0.161.0
    v1.4.7-v1.4.21 threejs版本 0.152.1
