"use client";

import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

interface PlaylistHeaderSectionProps {
    playlistId: string;
};


export const PlaylistHeaderSection = ({
    playlistId,
}: PlaylistHeaderSectionProps) => {
    return (
        <Suspense
            key={playlistId}
            fallback={<PlaylistHeaderSectionSkeleton />}
        >
            <ErrorBoundary fallback={<p>Error...</p>}>
                <PlaylistHeaderSectionSuspense playlistId={playlistId} />
            </ErrorBoundary>
        </Suspense>
    );
};

const PlaylistHeaderSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
};

const PlaylistHeaderSectionSuspense = ({
    playlistId,
}: PlaylistHeaderSectionProps) => {
    const [playlist] = trpc.playlists.getOne.useSuspenseQuery({
        id: playlistId,
    });

    const utils = trpc.useUtils();
    const router = useRouter();

    const remove = trpc.playlists.remove.useMutation({
        onSuccess: () => {
            toast.success("Playlist removed");
            utils.playlists.getMany.invalidate();
            router.push("/playlists");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });


    return (
        <div className="flex justify-between  items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold">{playlist.name}</h1>
                <p className="text-xs text-muted-foreground">
                    {playlist.description || "No description available"}
                </p>
            </div>

            <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                onClick={() => remove.mutate({ id: playlistId })}
                disabled={remove.isPending}
            >
                <Trash2Icon />
            </Button>
        </div>
    );
};