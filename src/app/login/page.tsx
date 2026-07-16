"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { signInAction, signInWithGoogleAction, resetPasswordAction } from "@/app/auth-actions";

function LoginForm() {
  useEffect(() => {
    document.title = "Sign In | Brick Health Energy";
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { refreshUser, setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await signInAction(formData);

      if (res?.error) {
        setError(res.error);
      } else {
        if (res?.user) setSession(res.user);
        await refreshUser();
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithGoogleAction(window.location.origin + callbackUrl);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.url) {
        window.location.assign(res.url);
      }
    } catch (err) {
      setError("Failed to initialize Google login");
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      const res = await resetPasswordAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setResetSent(true);
      }
    } catch {
      setError("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-none border-border/50 shadow-lg bg-white">
          <CardHeader className="space-y-2 text-center pt-8">
            <CardTitle className="text-3xl font-serif text-secondary">Welcome Back</CardTitle>
            <CardDescription className="font-light text-muted-foreground">
              Sign in to your Brick Health account to manage orders and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 text-sm font-light">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {resetMode ? (
                <motion.form
                  key="reset"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  {resetSent ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-6 text-center">
                      <p className="font-medium">Reset link sent!</p>
                      <p className="text-sm mt-1">Check your email for instructions to reset your password.</p>
                      <button
                        type="button"
                        onClick={() => { setResetMode(false); setResetSent(false); }}
                        className="mt-4 text-sm text-primary hover:underline font-medium"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground font-light">
                        Enter your email and we&apos;ll send you a password reset link.
                      </p>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        className="rounded-none h-12 border-slate-200 focus-visible:ring-primary"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <Button type="submit" className="w-full rounded-none py-6 text-base font-semibold" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => { setResetMode(false); setError(null); }}
                          className="text-sm text-muted-foreground hover:text-primary font-light"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </>
                  )}
                </motion.form>
              ) : (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email Address"
                      className="rounded-none h-12 border-slate-200 focus-visible:ring-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      className="rounded-none h-12 border-slate-200 focus-visible:ring-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setResetMode(true); setError(null); }}
                      className="text-sm text-muted-foreground hover:text-primary font-light"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Button type="submit" className="w-full rounded-none py-6 text-base font-semibold" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-muted-foreground font-light tracking-widest">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full rounded-none py-6 border-slate-200 text-secondary hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <div className="text-center text-sm font-light text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center font-sans font-light text-muted-foreground">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
