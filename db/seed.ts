import { db, Page } from "astro:db";

export default async function seed() {
    await db.insert(Page).values([
        { id: 1, title: "Home", url: "/" },
        { id: 2, title: "Landing page 1", url: "/landing-page-1" },
        { id: 3, title: "Landing page 2", url: "/landing-page-2" },
    ]);
}
