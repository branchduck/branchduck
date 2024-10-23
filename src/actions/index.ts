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
    createSession: defineAction({
        input: z.object({
            id: z.string(),
            userId: z.number(),
            expiresAt: z.date(),
        }),
        handler: async ({ id, userId, expiresAt }) => {
            await db.insert(Session).values({
                id: id,
                user_id: userId,
                expires_at: Math.floor(expiresAt.getTime() / 1000),
            });
        },
    }),
    invalidateSession: defineAction({
        input: z.string(),
        handler: async (input) => {
            await db.delete(Session).where(eq(Session.id, input));
        },
    }),
};
