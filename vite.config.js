import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bidding-prototype/',
  plugins: [react()],
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
