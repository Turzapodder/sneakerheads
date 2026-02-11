import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export default function VerifyEmail() {
    const { signUp, isLoaded, setActive } = useSignUp();
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || !signUp) return;

        setError("");
        setIsLoading(true);

        try {
            // Verify the email with the code
            const result = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (result.status === "complete") {
                // Set the active session
                await setActive({ session: result.createdSessionId });
                // Redirect to dashboard
                navigate("/dashboard");
            } else {
                setError("Verification incomplete. Please try again.");
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.errors?.[0]?.message || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!isLoaded || !signUp) return;

        setError("");
        setIsLoading(true);

        try {
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });
            alert("Verification code resent to your email!");
        } catch (err: any) {
            console.error("Resend error:", err);
            setError(err.errors?.[0]?.message || "Failed to resend code");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a verification code to your email address. Please enter it below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
                                {error}
                            </div>
                        )}

                        <Field>
                            <FieldLabel htmlFor="code">Verification Code</FieldLabel>
                            <Input
                                id="code"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                                disabled={isLoading}
                                className="text-center text-2xl tracking-widest font-mono"
                            />
                        </Field>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isLoading}
                                className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50"
                            >
                                Didn't receive the code? Resend
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                ← Back to Sign Up
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
