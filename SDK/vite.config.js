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
    // react(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts']
      // plugins: ['@babel/plugin-transform-runtime']
    }),
    dts({
      entryRoot: '../core',
      tsconfigPath: '../jsconfig.json'
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
    outDir: 'dist',
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
      external: ['react']
      // output: {
      //   // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      //   globals: {
      //     // OCSDK: 'OCSDK'
      //   }
      // }
    },
    lib: {
      entry: '../core',
      name: 'thingjs',
      formats: ['es', 'umd', 'cjs', 'iife']
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
