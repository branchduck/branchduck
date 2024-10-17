import type { APIRoute } from "astro";
import { db, Page } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.formData();
    const title = data.get("title");
    const url = data.get("url");

    if (!title || !url) {
        return new Response(
            JSON.stringify({
                message: "Missing required fields",
            }),
            { status: 400 },
        );
    }

    const insertedPage = (
        await db
            .insert(Page)
            .values({ title: title.toString(), url: url.toString() })
            .returning()
    )[0];

    return new Response(JSON.stringify(insertedPage), { status: 200 });
};
