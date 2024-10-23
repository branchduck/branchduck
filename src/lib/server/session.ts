import type { APIContext } from "astro";
import { db, eq, Session, User } from "astro:db";
import { actions } from "astro:actions";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

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
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await actions.createSession({
        id: session.id,
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

    const row = (
        await db
            .select({
                sessionId: Session.id,
                userId: Session.user_id,
                expiresAt: Session.expires_at,
                githubId: User.github_id,
                email: User.email,
                username: User.username,
            })
            .from(Session)
            .innerJoin(User, eq(Session.user_id, User.id))
            .where(eq(Session.id, sessionId))
    )[0];

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
        await db.delete(Session).where(eq(Session.id, session.id));
        return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db
            .update(Session)
            .set({ expires_at: Math.floor(session.expiresAt.getTime() / 1000) })
            .where(eq(Session.id, session.id));
    }

    return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(Session).where(eq(Session.id, sessionId));
}
