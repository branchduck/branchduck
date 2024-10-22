import { column, defineDb, defineTable } from "astro:db";

const User = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        github_id: column.number({ unique: true }),
        email: column.text({ unique: true }),
        username: column.text(),
    },
    indexes: [{ on: "github_id", unique: true }],
});

const Session = defineTable({
    columns: {
        id: column.text({ primaryKey: true }),
        user_id: column.number({ references: () => User.columns.id }),
        expires_at: column.number(),
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
        User,
        Session,
    },
});
