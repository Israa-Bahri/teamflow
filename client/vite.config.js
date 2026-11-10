import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1) import the Tailwind plugin

export default defineConfig({
  // 2) plugins = tools Vite uses while building.
  //    react() lets Vite understand JSX; tailwindcss() turns on Tailwind.
  plugins: [react(), tailwindcss()],
})