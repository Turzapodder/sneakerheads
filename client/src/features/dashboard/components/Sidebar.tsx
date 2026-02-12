import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { bottomItems, menuItems } from "@/constants/sidebar";

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    isOpen?: boolean;
}

export function Sidebar({ activeView, setActiveView, isOpen = true }: SidebarProps) {
    const { signOut } = useClerk();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background border-r transition-transform duration-300 ease-in-out",
            !isOpen && "-translate-x-full md:translate-x-0" // Hide on mobile if closed, can be controlled via parent
        )}>
            {/* Logo Area */}
            <div className="flex h-16 items-center px-6 border-b">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <span>Sneaker Heads</span>
                </div>
            </div>

            {/* Main Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeView === item.id ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 px-3",
                                activeView === item.id && "font-medium"
                            )}
                            onClick={() => setActiveView(item.id)}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="flex-1 text-left">{item.label}</span>
                        </Button>
                    ))}
                </nav>
            </div>

            {/* Bottom Menu */}
            <div className="p-3 border-t">
                <nav className="space-y-1">
                    {bottomItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeView === item.id ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 px-3"
                            onClick={() => setActiveView(item.id)}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </Button>
                </nav>
            </div>
        </div>
    );
}
