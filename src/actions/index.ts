import { defineAction } from "astro:actions";
import { db, Session, User } from "astro:db";
import { z } from "astro:schema";

export const server = {
    createUser: defineAction({
        input: z.object({
            githubId: z.number(),
            email: z.string(),
            username: z.string(),
        }),
        handler: async (input) => {
            return (
                await db
                    .insert(User)
                    .values({
                        github_id: input.githubId,
                        email: input.email,
                        username: input.username,
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
        handler: async (input) => {
            await db.insert(Session).values({
                id: input.id,
                user_id: input.userId,
                expires_at: Math.floor(input.expiresAt.getTime() / 1000),
            });
        },
    }),
};
