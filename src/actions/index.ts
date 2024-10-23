import { defineAction } from "astro:actions";
import { db, User } from "astro:db";
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
};
