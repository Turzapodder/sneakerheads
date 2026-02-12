import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileUpdateForm } from "@/components/ProfileUpdateForm";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
    clerkUser: any;
    dbUser: any;
    onProfileUpdate: () => void;
}

export function UserProfile({ clerkUser, dbUser, onProfileUpdate }: UserProfileProps) {
    const { signOut } = useClerk();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Information Card */}
            <div className="lg:col-span-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>User Profile</CardTitle>
                        <CardDescription>
                            Manage your personal information and account settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted/50 p-6 rounded-lg border">
                            <h2 className="text-lg font-semibold mb-4">Account Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {clerkUser?.imageUrl && (
                                        <img
                                            src={clerkUser.imageUrl}
                                            alt="Profile"
                                            className="w-16 h-16 rounded-full border-2 border-background shadow-sm"
                                        />
                                    )}
                                    <div>
                                        <p className="text-sm text-muted-foreground">Full Name</p>
                                        <p className="font-semibold text-foreground">
                                            {dbUser?.firstName || dbUser?.lastName
                                                ? `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim()
                                                : "Not provided"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-1">
                                    <p className="text-sm text-muted-foreground">Email Address</p>
                                    <p className="font-medium text-foreground">
                                        {clerkUser?.primaryEmailAddress?.emailAddress || "Not provided"}
                                    </p>
                                </div>

                                <div className="grid gap-1">
                                    <p className="text-sm text-muted-foreground">Clerk User ID</p>
                                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                        {clerkUser?.id}
                                    </code>
                                </div>

                                {dbUser && (
                                    <div className="pt-4 mt-4 border-t space-y-4">
                                        <div className="grid gap-1">
                                            <p className="text-sm text-muted-foreground">Role</p>
                                            <p className="font-medium capitalize badge">{dbUser.role}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1">
                                                <p className="text-sm text-muted-foreground">Last Login</p>
                                                <p className="text-sm font-medium">
                                                    {dbUser.lastLoginAt ? new Date(dbUser.lastLoginAt).toLocaleString() : "Unknown"}
                                                </p>
                                            </div>
                                            <div className="grid gap-1">
                                                <p className="text-sm text-muted-foreground">Member Since</p>
                                                <p className="text-sm font-medium">
                                                    {dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString() : "Unknown"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button onClick={handleSignOut} variant="destructive">
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
                    onUpdate={onProfileUpdate}
                />
            </div>
        </div>
    );
}
