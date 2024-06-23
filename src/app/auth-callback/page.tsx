"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const origin = searchParams.get("origin");

    trpc.authCallback.useQuery(undefined, {
      onSuccess: ({ success }) => {
        if (success) {
          // user is synced to db
          router.push(origin ? `/${origin}` : '/dashboard')
        }
      });
    return <div>{/* Render your component content here */}</div>;
};

export default Page;
