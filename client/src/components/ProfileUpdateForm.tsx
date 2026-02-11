import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { authApi } from "@/lib/api";

interface ProfileFormProps {
    currentFirstName?: string;
    currentLastName?: string;
    onUpdate?: () => void;
}

export function ProfileUpdateForm({ currentFirstName, currentLastName, onUpdate }: ProfileFormProps) {
    const { getToken } = useAuth();
    const [firstName, setFirstName] = useState(currentFirstName || "");
    const [lastName, setLastName] = useState(currentLastName || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const token = await getToken();
            if (!token) {
                setError("Not authenticated");
                return;
            }

            const response = await authApi.updateProfile(token, {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
            });

            if (response.success) {
                setSuccess("Profile updated successfully!");
                if (onUpdate) onUpdate();
            } else {
                setError(response.message || "Failed to update profile");
            }
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Update Profile</CardTitle>
                <CardDescription>
                    Update your first and last name
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-700 border border-green-200 rounded-md p-3 text-sm">
                            {success}
                        </div>
                    )}

                    <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            disabled={loading}
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            disabled={loading}
                        />
                    </Field>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Updating..." : "Update Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
