import { LayoutDashboard, User, Users, Upload, Store, Settings } from "lucide-react";

    export const menuItems = [
        { id: "overview", label: "Dashboard", icon: LayoutDashboard },
        { id: "profile", label: "User Profile", icon: User },
        { id: "users", label: "User Management", icon: Users },
        { id: "upload", label: "Content Upload", icon: Upload },
        { id: "store", label: "Store Management", icon: Store },
    ];

    export const bottomItems = [
        { id: "settings", label: "Settings", icon: Settings },
    ];