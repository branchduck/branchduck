import { column, defineDb, defineTable } from "astro:db";

const User = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        name: column.text(),
        email: column.text(),
    },
});

const Environment = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        userId: column.number({ references: () => User.columns.id }),
    },
});

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
