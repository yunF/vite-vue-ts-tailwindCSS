import type { UserConfig, ConfigEnv } from 'vite'

import * as path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import fs from 'fs'
// 热重载
import viteRestart from 'vite-plugin-restart'

// 向上兼容浏览器
import browserslist from 'browserslist'
import legacy from '@vitejs/plugin-legacy'
import topLevelAwait from 'vite-plugin-top-level-await'

import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import viteCompression from 'vite-plugin-compression'
// 自动生成路由
// import pages from 'vite-plugin-pages';
// import layouts from 'vite-plugin-vue-layouts';
// 自动导入
import components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'

import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// 图标
import icons from 'unplugin-icons/vite'
import iconsResolver from 'unplugin-icons/resolver'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

import { getEnvConfig, createProxy } from './build'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const envConfig = getEnvConfig(env)
  const isBuild = command.includes('build')
  const browserslistConfig = browserslist.loadConfig({ path: '.' })
  let dynamicConfig: UserConfig
  // 动态添加的一些配置
  if (isBuild) {
    // 新建一个build文件，用来告诉用户是否需要刷新页面升级，正常来说不需要告知用户
    fs.writeFileSync(path.join(__dirname, './public/build.json'), JSON.stringify({ version: `${Date.now()}` }))
    dynamicConfig = {}
  } else {
    // command === "build"
    dynamicConfig = {}
  }

  const defaultConfig: UserConfig = {
    plugins: [
      vue({
        script: {
          refSugar: true
        }
      }),
      vueSetupExtend(),
      legacy({
        renderLegacyChunks: false,
        modernPolyfills: ['es.global-this'],
        targets: browserslistConfig
      }),
      viteRestart({
        restart: ['vite.config.[jt]s']
      }),
      // pages(),
      // layouts(),
      autoImport({
        include: [
          /\.[tj]s?$/, // .ts, .tsx, .js, .jsx
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/ // .md
        ],
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/head', '@vueuse/core', 'vue-i18n'],
        dirs: ['./hooks', './hooks/**', './components', './components/**'],
        dts: true,
        eslintrc: {
          enabled: true
        },
        resolvers: [
          iconsResolver({
            //   prefix: false
          })
        ]
      }),
      components({
        extensions: ['vue', 'md'],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          iconsResolver({
            // enabledCollections: ['iconoir']
          })
        ],
        dts: 'src/components.d.ts'
      }),
      vueI18n({
        // runtimeOnly: true,
        // compositionOnly: true,
        include: [path.resolve(__dirname, './src/locales/modules/**')]
      }),
      icons({
        compiler: 'vue3',
        autoInstall: true
      }),
      topLevelAwait({
        // The export name of top-level await promise for each chunk module
        promiseExportName: '__tla',
        // The function to generate import names of top-level await promise in each chunk module
        promiseImportName: (i) => `__tla_${i}`
      })
    ],
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()]
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      extensions: ['.js', '.json', '.ts']
    },
    server: {
      // host: "localhost",
      port: envConfig.VITE_PORT,
      strictPort: true, // 存在冲突端口，则继续下找可用端口
      // https: "", // boolean | https.ServerOptions
      open: false, // boolean | string
      proxy: createProxy(envConfig.VITE_PROXY),
      // proxy: {
      //   // string shorthand
      //   // "/foo": "http://localhost:4567/foo",
      //   '/admincenter-dev': {
      //     target: 'https://s0.socialhub.ai:6443',
      //     changeOrigin: true
      //     // rewrite: (path) => path.replace(/^\/api/, '')
      //   }
      //   // with RegEx
      //   // "^/fallback/.*": {
      //   //   target: "http://jsonplaceholder.typicode.com",
      //   //   changeOrigin: true,
      //   //   rewrite: (path) => path.replace(/^\/fallback/, "")
      //   // },
      //   // 使用 proxy 实例
      //   // "api": {
      //   //   target: "http://jsonplaceholder.typicode.com",
      //   //   changeOrigin: true,
      //   //   configure: () => {
      //   //      // proxy http-proxy
      //   //   },
      //   // },
      //   // '/socket.io': {
      //   // 	target: 'ws://localhost:3000',
      //   // 	ws: true
      //   // }
      // },
      cors: true, // boolean | CorsOptions
      // headers: false, // OutgoingHttpHeaders 指定服务器响应的 header
      hmr: true // boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean }
      // watch: "", // object
      // middlewareMode: "",
      // base: "", // string | undefined
      // fs: {
      //  strict: "",
      //  allow: "",
      //  deny: "",
      // },
      // origin: "",
      // sourcemapIgnoreList: "", // false | (sourcePath: string, sourcemapPath: string) => boolean
    },
    build: {
      target: 'modules',
      // modulePreload: true,
      // polyfillDynamicImport: "", // boolean
      outDir: path.join(__dirname, 'dist'), // path.join(__dirname, "dist/render"),
      assetsDir: path.join(__dirname, 'assets'),
      assetsInlineLimit: 5120, // 5KB
      // 如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
      cssCodeSplit: true,
      // cssTarget: true, // 与 build.target 一致
      // cssMinify: true, // 与 build.minify 一致
      sourcemap: false,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, './index.html')
        },
        output: {
          dir: 'dist',
          // Static resource classification and packaging
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          compact: true,
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia']
          }
        }
      },
      // commonjsOptions: "",
      // dynamicImportVarsOptions: "",
      // lib: "",
      // manifest: false, // manifest.json
      // ssrManifest: false,
      // ssr: false,
      minify: 'terser', // boolean | "terser" | "esbuild"
      terserOptions: {
        compress: {
          drop_console: isBuild, // 生产环境去除console
          drop_debugger: isBuild // 生产环境去除debugger
        }
      },
      // write: true,
      // emptyOutDir: true, // outDiroutDir--emptyOutDir
      // copyPublicDir: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 2048
      // watch: 1024,
    },
    test: {
      include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
    }
  }

  return Object.assign(defaultConfig, dynamicConfig)
})
