import {defineConfig} from "vite";
import {directoryPlugin} from "vite-plugin-list-directory-contents";
export default defineConfig({
    plugins: [
        directoryPlugin({
            baseDir: __dirname,
            filterList: [
                '.git',
                '.idea',
                'js',
                'template',
                'templates',
                'src',
                'node_modules',
                'vendor',
                '.gitignore',
                'composer.json',
                'index.html',
                'package.json',
                'package-lock.json',
                'pnpm-lock.yaml',
                'README.md',
                'vite.config.js'
            ]
        })
    ],
});