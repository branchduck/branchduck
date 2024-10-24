import { defineAction } from "astro:actions";
import { db, eq, Session, User } from "astro:db";
import { z } from "astro:schema";

export const server = {
    createUser: defineAction({
        input: z.object({
            githubId: z.number(),
            email: z.string(),
            username: z.string(),
        }),
        handler: async ({ githubId, email, username }) => {
            return (
                await db
                    .insert(User)
                    .values({
                        github_id: githubId,
                        email: email,
                        username: username,
                    })
                    .returning({ id: User.id })
            )[0];
        },
    }),
    getUserByGithubId: defineAction({
        input: z.number(),
        handler: async (input) => {
            return (
                await db
                    .select({
                        id: User.id,
                        github_id: User.github_id,
                        email: User.email,
                        username: User.username,
                    })
                    .from(User)
                    .where(eq(User.github_id, input))
            )[0];
        },
    }),
    createSession: defineAction({
        input: z.object({
            sessionId: z.string(),
            userId: z.number(),
            expiresAt: z.date(),
        }),
        handler: async ({ sessionId, userId, expiresAt }) => {
            await db.insert(Session).values({
                id: sessionId,
                user_id: userId,
                expires_at: Math.floor(expiresAt.getTime() / 1000),
            });
        },
    }),
    getSessionAndUserBySessionId: defineAction({
        input: z.string(),
        handler: async (input) => {
            return (
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
                    .where(eq(Session.id, input))
            )[0];
        },
    }),

    invalidateSession: defineAction({
        input: z.string(),
        handler: async (input) => {
            await db.delete(Session).where(eq(Session.id, input));
        },
    }),
    updateSessionExpireDate: defineAction({
        input: z.object({
            sessionId: z.string(),
            expiresAt: z.date(),
        }),
        handler: async ({ sessionId, expiresAt }) => {
            await db
                .update(Session)
                .set({ expires_at: Math.floor(expiresAt.getTime() / 1000) })
                .where(eq(Session.id, sessionId));
        },
    }),
};
