import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5175, // আপনার বর্তমান পোর্টটি নির্দিষ্ট করে দেওয়া হলো
    proxy: {
      // '/blogger-api' দিয়ে শুরু হওয়া সব রিকোয়েস্ট এই প্রক্সির মাধ্যমে যাবে
      '/blogger-api': {
        target: 'https://akkahrchitro.blogspot.com',
        changeOrigin: true,
        // ইউআরএল থেকে '/blogger-api' অংশটি বাদ দিয়ে আসল ব্লগস্পট লিঙ্কে ফরওয়ার্ড করবে
        rewrite: (path) => path.replace(/^\/blogger-api/, '')
      }
    }
  }
})