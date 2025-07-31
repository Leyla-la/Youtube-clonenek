import { cn } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";

interface PlaylistThumbnailProps {
    title: string;
    videoCount: number;
    className?: string;
    imageUrl?: string | null;
};

export const PlaylistThumbnail = ({
    title,
    videoCount,
    className,
    imageUrl,
}: PlaylistThumbnailProps) => {
    return (
        <div className={cn("relative pt-3 group", className)}>
            <div className="relative">
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl bg-black/20 aspect-video "
                />
                <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video "
                />

                <div className="relative overflow-hidden w-full rounded-xl aspect-video">
                    <Image
                        
                    />
                </div>
            </div>
        </div>
    );
};