import {defineConfig} from 'vite';
export default defineConfig({base:'/Nous-deux/',esbuild:{jsx:'automatic'},build:{outDir:'dist-web',emptyOutDir:true},css:{postcss:{plugins:[]}}});
