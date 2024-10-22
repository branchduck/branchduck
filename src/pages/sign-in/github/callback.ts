import { db, eq, User } from "astro:db";
import type { OAuth2Tokens } from "arctic";
import type { APIContext } from "astro";
import { github } from "@lib/server/oauth";
import {
    createSession,
    generateSessionToken,
    setSessionTokenCookie,
} from "@lib/server/session";

export async function GET(context: APIContext): Promise<Response> {
    const storedState =
        context.cookies.get("github_oauth_state")?.value ?? null;
    const code = context.url.searchParams.get("code");
    const state = context.url.searchParams.get("state");

    if (storedState === null || code === null || state === null) {
        return new Response("Please restart the process.", {
            status: 400,
        });
    }

    if (storedState !== state) {
        return new Response("Please restart the process.", {
            status: 400,
        });
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await github.validateAuthorizationCode(code);
    } catch (e) {
        return new Response("Please restart the process.", {
            status: 400,
        });
    }

    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
        },
    });
    const userResult = await userResponse.json();

    const existingUser = (
        await db
            .select({
                id: User.id,
                github_id: User.github_id,
                email: User.email,
                username: User.username,
            })
            .from(User)
            .where(eq(User.github_id, userResult.id))
    )[0];
    if (existingUser) {
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, existingUser.id);
        setSessionTokenCookie(context, sessionToken, session.expiresAt);
        return context.redirect("/sign-in");
    }

    const emailListResponse = await fetch(
        "https://api.github.com/user/emails",
        {
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`,
            },
        },
    );
    const emailListResult: unknown = await emailListResponse.json();
    if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
        return new Response("Please restart the process.", {
            status: 400,
        });
    }
    let email: string | null = null;
    for (const emailRecord of emailListResult) {
        if (emailRecord.primary && emailRecord.verified) {
            email = emailRecord.email;
        }
    }
    if (email === null) {
        return new Response("Please verify your GitHub email address.", {
            status: 400,
        });
    }

    const user = (
        await db
            .insert(User)
            .values({
                github_id: userResult.id,
                email,
                username: userResult.login,
            })
            .returning({ id: User.id })
    )[0];
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    setSessionTokenCookie(context, sessionToken, session.expiresAt);
    return context.redirect("/sign-in");
}
