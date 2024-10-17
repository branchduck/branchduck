import { column, defineDb, defineTable } from "astro:db";

const Page = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        title: column.text(),
        url: column.text(),
    },
});

export default defineDb({
    tables: {
        Page,
    },
});
