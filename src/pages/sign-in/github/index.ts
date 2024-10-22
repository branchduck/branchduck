import type { APIContext } from "astro";
import { generateState } from "arctic";
import { github } from "@lib/server/oauth";

export function GET(context: APIContext): Response {
    const state = generateState();
    const url = github.createAuthorizationURL(state, ["user:email"]);

    context.cookies.set("github_oauth_state", state, {
        path: "/",
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax",
    });

    return context.redirect(url.toString());
}
