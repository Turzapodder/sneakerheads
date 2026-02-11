import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { ProfileUpdateForm } from "@/components/ProfileUpdateForm";

export default function Dashboard() {
    const { user: clerkUser } = useUser();
    const { signOut } = useClerk();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [dbUser, setDbUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUserFromBackend = async () => {
        try {
            console.log('Fetching user from backend...');
            const token = await getToken();
            console.log('Token received:', token ? 'Yes' : 'No');

            if (token) {
                console.log('Making API call to /api/auth/me');
                const response = await authApi.getCurrentUser(token);
                console.log('API Response:', response);

                if (response.success) {
                    setDbUser(response.data);
                    console.log('User data set:', response.data);
                } else {
                    console.error('API returned success: false', response);
                    setError(response.message || 'Failed to load user data');
                }
            } else {
                console.error('No token available');
                setError('Authentication token not available');
            }
        } catch (err: any) {
            console.error("Error fetching user from backend:", err);
            setError(err.message || "Failed to load user data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserFromBackend();
    }, [getToken]);

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    const handleProfileUpdate = () => {
        // Refetch user data after profile update
        fetchUserFromBackend();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Information Card */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg">
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl font-bold">Welcome to Your Dashboard</CardTitle>
                                <CardDescription className="text-lg">
                                    You're successfully authenticated with Clerk + Backend!
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {error && (
                                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">User Information</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4">
                                            {clerkUser?.imageUrl && (
                                                <img
                                                    src={clerkUser.imageUrl}
                                                    alt="Profile"
                                                    className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                                                />
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-600">Full Name</p>
                                                <p className="font-semibold text-gray-900">
                                                    {dbUser?.firstName || dbUser?.lastName
                                                        ? `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim()
                                                        : "Not provided"}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">Email Address</p>
                                            <p className="font-semibold text-gray-900">
                                                {clerkUser?.primaryEmailAddress?.emailAddress || "Not provided"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">Clerk User ID</p>
                                            <p className="font-mono text-sm text-gray-700 bg-white px-3 py-2 rounded border">
                                                {clerkUser?.id}
                                            </p>
                                        </div>

                                        {dbUser && (
                                            <>
                                                <div className="border-t pt-3 mt-3">
                                                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Database Information</h3>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-600">Database User ID</p>
                                                    <p className="font-mono text-sm text-gray-700 bg-white px-3 py-2 rounded border">
                                                        {dbUser.id}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-600">Role</p>
                                                    <p className="font-semibold text-gray-900 capitalize">
                                                        {dbUser.role}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-600">Last Login</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {dbUser.lastLoginAt ? new Date(dbUser.lastLoginAt).toLocaleString() : "Unknown"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-600">Account Created</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString() : "Unknown"}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-center pt-4">
                                    <Button
                                        onClick={() => navigate("/")}
                                        variant="outline"
                                        className="px-6"
                                    >
                                        Go to Home
                                    </Button>
                                    <Button
                                        onClick={handleSignOut}
                                        variant="destructive"
                                        className="px-6"
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Update Form */}
                    <div className="lg:col-span-1">
                        <ProfileUpdateForm
                            currentFirstName={dbUser?.firstName || ""}
                            currentLastName={dbUser?.lastName || ""}
                            onUpdate={handleProfileUpdate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
