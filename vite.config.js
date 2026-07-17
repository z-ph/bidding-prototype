import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
// GitHub Pages 项目站点挂在子路径 /bidding-prototype/ 下；
// Cloudflare Pages 等根路径托管平台需要 base 为 '/'。
// Cloudflare Pages 构建环境自动注入 CF_PAGES=1
// （https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables）
export default defineConfig({
  base: process.env.CF_PAGES ? '/' : '/bidding-prototype/',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  build: {
    rolldownOptions: {
      output: {
        // 保留函数/类的 name 属性（组件名），不被压缩混淆，
        // 方便 React DevTools 与错误堆栈定位组件
        // https://oxc.rs/docs/guide/usage/minifier/mangling.html
        minify: {
          mangle: {
            keepNames: true
          }
        }
      }
    }
  }
})
