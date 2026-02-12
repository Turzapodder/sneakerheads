import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
    title: string;
    user?: {
        firstName?: string;
        lastName?: string;
        imageUrl?: string;
        role?: string;
    };
    onToggleSidebar?: () => void;
}

export function Header({ title, user, onToggleSidebar }: HeaderProps) {
    const fullName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "User";

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-6 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
                    <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium leading-none">{fullName}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {user?.role || "Admin"}
                    </p>
                </div>
                <Avatar>
                    <AvatarImage src={user?.imageUrl} alt={fullName} />
                    <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
