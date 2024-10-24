import type { APIContext } from "astro";
import { Session, User } from "astro:db";
import { actions } from "astro:actions";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

const TIME_DAY = 1000 * 60 * 60 * 24;
const TIME_DAYS_15 = TIME_DAY * 15;
const TIME_DAYS_30 = TIME_DAY * 30;

type SessionValidationResult =
    | { session: Session; user: typeof User.$inferSelect }
    | { session: null; user: null };

export interface Session {
    id: string;
    userId: number;
    expiresAt: Date;
}

export function generateSessionToken(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32(tokenBytes).toLowerCase();
    return token;
}

export async function createSession(
    token: string,
    userId: number,
): Promise<Session> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
    );
    const session: Session = {
        id: sessionId,
        userId: userId,
        expiresAt: new Date(Date.now() + TIME_DAYS_30),
    };
    await actions.createSession({
        sessionId: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
    });
    return session;
}

export function setSessionTokenCookie(
    context: APIContext,
    token: string,
    expiresAt: Date,
): void {
    context.cookies.set("session", token, {
        httpOnly: true,
        path: "/",
        secure: import.meta.env.PROD,
        sameSite: "lax",
        expires: expiresAt,
    });
}

export function deleteSessionTokenCookie(context: APIContext): void {
    context.cookies.set("session", "", {
        httpOnly: true,
        path: "/",
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 0,
    });
}

export async function validateSessionToken(
    token: string,
): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
    );

    const { data: row } = await actions.getSessionAndUserBySessionId(sessionId);
    if (!row) {
        return { session: null, user: null };
    }

    const session: Session = {
        id: row.sessionId,
        userId: row.userId,
        expiresAt: new Date(row.expiresAt * 1000),
    };

    const user: typeof User.$inferSelect = {
        id: row.userId,
        github_id: row.githubId,
        email: row.email,
        username: row.username,
    };

    if (Date.now() >= session.expiresAt.getTime()) {
        await actions.invalidateSession(session.id);
        return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - TIME_DAYS_15) {
        session.expiresAt = new Date(Date.now() + TIME_DAYS_30);
        await actions.updateSessionExpireDate({
            sessionId: session.id,
            expiresAt: session.expiresAt,
        });
    }

    return { session, user };
}
