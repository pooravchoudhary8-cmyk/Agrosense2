import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images.js";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        metaImagesPlugin(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
            "@assets": path.resolve(import.meta.dirname, "attached_assets"),
        },
        dedupe: ["react", "react-dom"],
    },
    css: {
        postcss: {
            plugins: [],
        },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        host: "0.0.0.0",
        allowedHosts: true,
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
                secure: false,
            },
            '/socket.io': {
                target: 'http://localhost:5001',
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
});
