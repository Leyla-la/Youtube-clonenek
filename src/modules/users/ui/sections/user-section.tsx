"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { UserPageBanner, UserPageBannerSkeleton } from "../components/user-page-banner";
import { ErrorBoundary } from "react-error-boundary";
import { UserPageInfo, UserPageInfoSkeleton } from "../components/user-page-info";
import { Separator } from "@/components/ui/separator";

interface UserSectionProps {
    userId: string;
}

const UserSectionSkeleton = () => {
    return (
        <div className="flex flex-col">
            <UserPageBannerSkeleton />
            <UserPageInfoSkeleton />
            <Separator />
        </div>
    )
}
export const UserSection = ( props: UserSectionProps ) => {
    return (
        <Suspense fallback={<UserSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading user...</p>}>
                <UserSectionSuspense {...props} />    
            </ErrorBoundary>
        </Suspense>
    );
};

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
    const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

    return (
        <div className="flex flex-col">
            <UserPageBanner user={user} />
            <UserPageInfo user={user} />
            <Separator />
        </div>
    );
};