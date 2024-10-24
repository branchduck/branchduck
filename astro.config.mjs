// @ts-check
import { defineConfig, envField } from "astro/config";
import db from "@astrojs/db";
import node from "@astrojs/node";
import svelte from "@astrojs/svelte";

export default defineConfig({
    integrations: [db(), svelte()],
    adapter: node({
        mode: "standalone",
    }),
    output: "server",
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
