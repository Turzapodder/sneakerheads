import { useUser, useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { Header } from "@/features/dashboard/components/Header";
import { UserProfile } from "@/features/dashboard/components/UserProfile";
import { LiveDrops } from "@/features/drops/components/LiveDrops";

export default function Dashboard() {
    const { user: clerkUser } = useUser();
    const { getToken } = useAuth();

    // Default mock user if not fetched yet
    const [dbUser, setDbUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("live-drops");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default on mobile

    const fetchUserFromBackend = async () => {
        try {
            const token = await getToken();
            if (token) {
                const response = await authApi.getCurrentUser(token);
                if (response.success) {
                    setDbUser(response.data);
                }
            }
        } catch (err: any) {
            console.error("Error fetching user from backend:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserFromBackend();
    }, [getToken]);

    const handleProfileUpdate = () => {
        fetchUserFromBackend();
    };

    const getTitle = (view: string) => {
        switch (view) {
            case "live-drops": return "Live Sneaker Drops";
            case "my-reservations": return "My Reservations";
            case "upcoming": return "Upcoming Releases";
            case "collection": return "Sneaker Collection";
            case "history": return "Order History";
            case "settings": return "Settings";
            case "profile-update": return "My Profile";
            default: return "Live Sneaker Drops";
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleViewChange = (view: string) => {
        setActiveView(view);
        setIsSidebarOpen(false); // Close sidebar on mobile when navigating
    };

    const renderView = () => {
        switch (activeView) {
            case "live-drops":
                return <LiveDrops />;
            case "my-reservations":
            case "upcoming":
            case "collection":
            case "history":
                return (
                    <div className="flex h-[50vh] flex-col items-center justify-center text-muted-foreground bg-white rounded-lg border border-dashed">
                        <h3 className="text-lg font-medium">Coming Soon</h3>
                        <p className="text-sm">The {getTitle(activeView)} page is under construction.</p>
                    </div>
                );
            case "profile-update":
                return (
                    <UserProfile
                        clerkUser={clerkUser}
                        dbUser={dbUser}
                        onProfileUpdate={handleProfileUpdate}
                    />
                );
            default:
                return <LiveDrops />;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden">
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                activeView={activeView}
                setActiveView={handleViewChange}
                isOpen={isSidebarOpen}
            />

            <div className="flex flex-1 flex-col md:ml-64 transition-all duration-300 overflow-hidden w-full">
                <Header
                    title={getTitle(activeView)}
                    user={dbUser || {
                        firstName: clerkUser?.firstName,
                        lastName: clerkUser?.lastName,
                        imageUrl: clerkUser?.imageUrl,
                        role: 'User'
                    }}
                    onToggleSidebar={toggleSidebar}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
                    <div className="mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
    );
}
