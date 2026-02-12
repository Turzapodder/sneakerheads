import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSignIn } from "@clerk/clerk-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else if (result.status === "needs_second_factor") {
        setVerifying(true);
        // Determine strategy (prefer TOTP)
        const hasTotp = result.supportedSecondFactors?.find((f: any) => f.strategy === "totp");
        if (hasTotp) {
          setSecondFactorStrategy("totp");
        } else {
          const hasPhone = result.supportedSecondFactors?.find((f: any) => f.strategy === "phone_code");
          if (hasPhone) {
            setSecondFactorStrategy("phone_code");
          } else {
            // Check for email code in second factors or fall back to it
            const hasEmailCode = result.supportedSecondFactors?.find((f: any) => f.strategy === "email_code");
            if (hasEmailCode) {
              setSecondFactorStrategy("email_code");
            } else {
              setError("Unsupported second factor method. Please contact support.");
            }
          }
        }
      } else if (result.status === "needs_first_factor") {
        // Usually means email verification code if password was skipped or logic implies it
        setVerifying(true);
        setSecondFactorStrategy("email_code"); // Simplification for common case
      } else {
        setError(`Sign in incomplete. Status: ${result.status}`);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      let result;
      if (secondFactorStrategy === "totp" || secondFactorStrategy === "phone_code" || secondFactorStrategy === "email_code") {
        result = await signIn.attemptSecondFactor({
          strategy: secondFactorStrategy as any,
          code,
        });
      } else {
        throw new Error("Unknown verification strategy");
      }

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_apple") => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      console.error("OAuth error:", err);
      setError(err.errors?.[0]?.message || "OAuth sign in failed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {verifying ? "Verification Required" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {verifying
              ? "Please enter the verification code to continue"
              : "Login with your Apple or Google account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifying ? (
            <form onSubmit={handleVerify}>
              <FieldGroup>
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
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                  <div className="mt-2 text-center">
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => setVerifying(false)}
                      className="text-xs"
                    >
                      Back to login
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={handleSignIn}>
              <FieldGroup>
                {error && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}

                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleOAuthSignIn("oauth_apple")}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Apple
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleOAuthSignIn("oauth_google")}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="/signup" className="underline underline-offset-4 hover:text-primary">Sign up</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
      {!verifying && (
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
          and <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
        </FieldDescription>
      )}
    </div>
  )
}
