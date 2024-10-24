import type { APIContext } from "astro";
import { actions } from "astro:actions";
import type { OAuth2Tokens } from "arctic";
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

    const { existingUser, userResult } = await getGithubUser(
        tokens.accessToken(),
    );
    if (existingUser) {
        const { sessionToken, session } = await newSession(existingUser.id);
        setSessionTokenCookie(context, sessionToken, session.expiresAt);
        return context.redirect("/dashboard");
    }

    const { email, error } = await checkIfEmailVerified(tokens.accessToken());
    if (error) {
        return error;
    }

    const { data: user } = await actions.createUser({
        githubId: userResult.id,
        email,
        username: userResult.login,
    });
    if (user) {
        const { sessionToken, session } = await newSession(user.id);
        setSessionTokenCookie(context, sessionToken, session.expiresAt);
        return context.redirect("/dashboard");
    }

    return new Response("Please restart the process.", {
        status: 400,
    });
}

async function newSession(userId: number) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);
    return { sessionToken, session };
}

async function getGithubUser(accessToken: string) {
    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const userResult = await userResponse.json();
    const { data: existingUser } = await actions.getUserByGithubId(
        userResult.id,
    );

    return { existingUser, userResult };
}

async function checkIfEmailVerified(accessToken: string) {
    const emailListResponse = await fetch(
        "https://api.github.com/user/emails",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
    const emailListResult = await emailListResponse.json();
    let error: Response | undefined;

    if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
        error = new Response("Please restart the process.", {
            status: 400,
        });
    }

    let email;
    for (const emailRecord of emailListResult) {
        if (emailRecord.primary && emailRecord.verified) {
            email = emailRecord.email;
        }
    }

    if (!email) {
        error = new Response("Please verify your GitHub email address.", {
            status: 400,
        });
    }

    return { email, error };
}
