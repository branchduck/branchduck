// @ts-check
import { defineConfig } from "astro/config";
import db from "@astrojs/db";
import node from "@astrojs/node";
import vue from "@astrojs/vue";

export default defineConfig({
    integrations: [db(), vue({ appEntrypoint: "/src/pages/_app" })],
    adapter: node({
        mode: "standalone",
    }),
    output: "server",
});
