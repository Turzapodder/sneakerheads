import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function AuthPageGuard({ children }: any) {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    // If user is already signed in, redirect to dashboard
    if (isSignedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
