import { defineMiddleware, sequence } from "astro:middleware";
import {
    UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL,
} from "astro:env/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
    deleteSessionTokenCookie,
    setSessionTokenCookie,
    validateSessionToken,
} from "@lib/server/session";

const ratelimit = new Ratelimit({
    redis: new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
    }) as any,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
});

const rateLimitMiddleware = defineMiddleware(async (context, next) => {
    const clientAddress = context.request.headers.get("x-forwarded-for");
    console.log("[rateLimitMiddleware]", { clientAddress });

    if (!clientAddress) {
        return next();
    }

    const { success, limit, remaining } = await ratelimit.limit(clientAddress);

    if (!success) {
        return new Response("Too many requests", {
            status: 429,
            headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
            },
        });
    }

    return next();
});

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

export const onRequest = sequence(rateLimitMiddleware, authMiddleware);
