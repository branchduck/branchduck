import { defineMiddleware } from "astro:middleware";
import {
    deleteSessionTokenCookie,
    setSessionTokenCookie,
    validateSessionToken,
} from "@lib/server/session";

const authMiddleware = defineMiddleware(async (context, next) => {
    const token = context.cookies.get("session")?.value ?? null;
    if (token === null) {
        context.locals.session = null;
        context.locals.user = null;

        if (context.url.pathname.startsWith("/dashboard")) {
            return context.redirect("/sign-in");
        }

        return next();
    }

    const { user, session } = await validateSessionToken(token);
    if (session !== null) {
        setSessionTokenCookie(context, token, session.expiresAt);
    } else {
        deleteSessionTokenCookie(context);
    }

    context.locals.session = session;
    context.locals.user = user;

    return next();
});

export const onRequest = authMiddleware;
