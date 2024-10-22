import type { APIContext } from "astro";
import {
    deleteSessionTokenCookie,
    invalidateSession,
} from "@lib/server/session";

export async function POST(context: APIContext): Promise<Response> {
    if (context.locals.session === null) {
        return new Response(null, { status: 401 });
    }

    await invalidateSession(context.locals.session.id);
    deleteSessionTokenCookie(context);

    return new Response();
}
