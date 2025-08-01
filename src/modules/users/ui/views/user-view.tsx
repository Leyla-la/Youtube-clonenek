import { UserSection } from "../sections/user-section";
import { VideosSection } from "../sections/videos-section";

interface UserViewProps {
    userId: string; 
}

export const UserView = ({ userId }: UserViewProps) => {
    return (
        <div className="max-w-[1300px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
            <UserSection userId={userId} />
            <VideosSection userId={userId} />
        </div>
    );
}