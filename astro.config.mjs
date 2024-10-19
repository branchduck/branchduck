// @ts-check
import { defineConfig, envField } from "astro/config";
import db from "@astrojs/db";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import auth from "auth-astro";

export default defineConfig({
    integrations: [db(), vue({ appEntrypoint: "/src/pages/_app" }), auth()],
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
