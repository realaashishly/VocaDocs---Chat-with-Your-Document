"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { useEffect } from "react";

const Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const origin = searchParams.get("origin");

    const { data, error } = trpc.authCallback.useQuery(undefined, {
        retry: true,
        retryDelay: 500,
    });

    useEffect(() => {
        if (data?.success) {
            router.push(origin ? `/${origin}` : `/dashboard`);
        } else if (error && error.data?.code === "UNAUTHORIZED") {
            router.push("/sign-in");
        }
    }, [data, error, origin, router]);

    return null; // Ensure the component returns something
};

export default Page;
