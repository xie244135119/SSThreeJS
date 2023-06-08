const path = require('path-browserify');

module.exports = {
  mode: 'production',
  entry: {
    index: './src/js/threeJs/index.js'
  },
  stats: 'none',
  output: {
    path: path.resolve(__dirname, '../core'),
    filename: 'ss-threejs.js',
    // chunkFilename: 'js/[name].[chunkhash].chunk.js',
    assetModuleFilename: 'assets/[hash][ext][query]',
    //
    publicPath: '/',
    sourcePrefix: '',
    clean: true,
    library: {
      name: 'ss-threejs',
      type: 'umd'
    }
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 2 * 1024 * 1024,
    maxEntrypointSize: 1 * 1024 * 1024
  },
  watch: true,
  watchOptions: {
    //
    aggregateTimeout: 300,
    //
    ignored: '/node_modules/',
    //
    poll: 1000
  },
  //  optimization: {
  //   // gzip
  //   minimize: isEnvProduction,
  //   chunkIds: 'named',
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     // async initial all
  //     chunks: 'all',
  //     // maxSize: 0,
  //     // maxAsyncRequests: 5,
  //     // maxInitialRequests: 3,
  //     // split chunk minist
  //     minChunks: 3,
  //     // 30 kb
  //     // minSize: 30 * 1024,
  //     minSize: 30 * 1024,
  //     //
  //     name: false,
  //     cacheGroups: {
  //       vendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         priority: -10,
  //         chunks: 'all'
  //       },
  //       css: {
  //         name: 'css',
  //         test: /\.css$/,
  //         minChunks: 1,
  //         enforce: true,
  //         priority: -5
  //       },
  //       default: {
  //         minChunks: 2,
  //         priority: -20,
  //         reuseExistingChunk: true
  //       }
  //     }
  //   }
  // },

  target: 'web',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|public)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: []
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|mp4|svg|fbx|FBX|obj|gltf|glb)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src/')
    },
    mainFields: ['es2015', 'browser', 'module', 'main'],
    mainFiles: ['index'],
    modules: ['node_modules']
  },
  plugins: [].filter((item) => item)
};
