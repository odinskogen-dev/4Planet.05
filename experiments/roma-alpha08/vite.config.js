import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{outDir:'dist',rollupOptions:{input:{main:'index.html',rome:'roma-alpha08.html'}}}});
