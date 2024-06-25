import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        try {
            const { getUser } = getKindeServerSession();
            const user = await getUser();

            if (!user?.id || !user?.email) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID or email missing",
                });
            }

            // Check if the user is in the database
            const dbUser = await db.user.findFirst({
                where: { id: user.id },
            });

            if (!dbUser) {
                await db.user.create({
                    data: { id: user.id, email: user.email },
                });
            }

            return { success: true };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }

            console.error("Error in authCallback:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message:
                    "An error occurred while processing the authentication callback.",
            });
        }
    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;
        return await db.file.findMany({
            where: {
                userId,
            },
        });
    }),
    deleteFile: privateProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;
            const file = await db.file.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!file)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "File not found",
                });

            await db.file.delete({
                where: {
                    id: input.id,
                },
            });

            return file;
        }),
});

// Export type router type signature, NOT the router itself.
export type AppRouter = typeof appRouter;
