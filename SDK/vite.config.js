/*
 * Author  Murphy.xie
 * Date  2024-02-27 19:04:12
 * LastEditors  Murphy.xie
 * LastEditTime  2024-03-19 16:13:34
 * Description
 */
import { defineConfig } from 'vite';
import path from 'path';
// import react from '@vitejs/plugin-react-swc';
import { babel } from '@rollup/plugin-babel';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // babel({
    //   babelHelpers: 'bundled',
    //   extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts']
    //   // plugins: ['@babel/plugin-transform-runtime']
    // }),
    dts({
      entryRoot: '../core',
      tsconfigPath: './jsconfig.json'
      // outputDir: ['./dist/es', './dist/lib']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  publicDir: 'public',
  server: {
    host: true,
    open: true,
    hmr: true,
    proxy: {}
  },
  optimizeDeps: {
    exclude: []
  },
  build: {
    outDir: 'ss-threejs',
    assetsDir: 'assets',
    assetsInlineLimit: 4 * 1024,
    cssCodeSplit: true,
    copyPublicDir: true,
    sourcemap: false,
    minify: 'esbuild',
    write: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['three', 'lil-gui']
      // output: {
      //   // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      //   globals: {
      //     ssthingjs: 'ssthingjs'
      //   }
      // }
      // output: [
      //   {
      //     //打包格式
      //     format: 'es',
      //     //打包后文件名
      //     entryFileNames: '[name].mjs',
      //     //让打包目录和我们目录对应
      //     preserveModules: true,
      //     exports: 'named',
      //     //配置打包根目录
      //     dir: './dist/es'
      //   },
      //   {
      //     //打包格式
      //     format: 'cjs',
      //     //打包后文件名
      //     entryFileNames: '[name].js',
      //     //让打包目录和我们目录对应
      //     preserveModules: true,
      //     exports: 'named',
      //     //配置打包根目录
      //     dir: './dist/lib'
      //   }
      // ]
    },
    lib: {
      entry: {
        core: '../core/index.ts',
        'plugin/BaseLightSetting': '../core/SSPlugins/BaseLightSetting.ts',
        'plugin/PostProcessPlugin': '../core/SSPlugins/PostProcessPlugin.ts',
        'tool/file': '../core/SSTool/SSFile.ts'
      },
      // entry: '../core/index.ts',
      name: 'ssthingjs',
      formats: ['es', 'cjs']
    }
  },
  preview: {
    host: '0.0.0.0',
    open: true
  },
  css: {
    modules: {},
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "${path.resolve(__dirname, 'src/styles/vars.less')}";`
      },
      scss: {}
    }
  },
  json: {
    namedExports: true,
    stringify: false
  },
  logLevel: 'info',
  clearScreen: false
});
