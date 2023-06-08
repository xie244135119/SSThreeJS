
# ss-threejs

a 3dtool for web base three

## Installation
***

#### Use Npm

    npm install ss-threejs

#### Use Npx

    npx ss-threejs

#### Use Yarn

    yarn install ss-threejs

## Project 

 	1, install: yarn install ss-threejs（详细看 Installation ）
 	2, Webpack:  webpack.config.js配置中增加pulgin额外配置
    		plugins: [
				new CopyWebpackPlugin({
				patterns: [
					{
						from: "node_modules/three/examples/js/libs/draco/",
						to: "static/three/draco",
					},
					{
						from: "node_modules/three/examples/js/libs/basis/",
						to: "static/three/basis",
					},
				],
			}),
	]
   	 vite：同理

## Update Versions log

1.0.0 1.0.1 1.0.2 更新日志
 1）threejs版本发布

1.0.3
1）优化模型加载处理
