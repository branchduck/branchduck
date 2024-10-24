// @ts-check
import { defineConfig, envField } from "astro/config";
import db from "@astrojs/db";
import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
    site: "https://branchduck.studio",
    integrations: [
        db(),
        svelte(),
        sitemap({
            filter: (page) =>
                !page.startsWith("https://branchduck.studio/dashboard"),
        }),
    ],
    adapter: node({
        mode: "standalone",
    }),
    output: "server",
    vite: {
        css: {
            transformer: "lightningcss",
        },
        build: {
            cssMinify: "lightningcss",
        },
    },
    env: {
        schema: {
            GITHUB_CLIENT_ID: envField.string({
                context: "server",
                access: "secret",
            }),
            GITHUB_CLIENT_SECRET: envField.string({
                context: "server",
                access: "secret",
            }),
        },
    },
});
