"use client";

import {
  AuthShell,
  AuthFormMessage,
  PasswordInput,
  Button,
  Input,
  Link,
  useState,
  type FormEvent,
} from "@/components/auth/AuthShell";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/common/Toast";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const submitting = useAuthStore((s) => s.submitting);
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      push("Welcome back!", "success");
      const role = useAuthStore.getState().user?.role;
      const onboarded = useAuthStore.getState().user?.onboardingCompleted;
      if (role === "admin") {
        window.location.assign("/admin");
        return;
      }
      window.location.assign(onboarded ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your meal prep workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <AuthFormMessage tone="error" message={error} /> : null}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" isLoading={submitting} size="lg">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
