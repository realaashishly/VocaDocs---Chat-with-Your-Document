import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    try {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      console.log(user);

      if (!user?.id || !user?.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Check if the user is in the database
      const dbUser = await db.user.findFirst({
        where: {
          id: user.id,
        },
      });

      if (!dbUser) {
        await db.user.create({
          data: {
            id: user.id,
            email: user.email,
          },
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error in authCallback:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while processing the authentication callback.',
      });
    }
  }),
});

// Export type router type signature, NOT the router itself.
export type AppRouter = typeof appRouter;
