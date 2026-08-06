"use client";

import {
  AuthShell,
  AuthFormMessage,
  Button,
  Input,
  Link,
  useState,
  type FormEvent,
} from "@/components/auth/AuthShell";
import { apiSend } from "@/lib/api-client";
import { useToast } from "@/components/common/Toast";

export default function ForgotPasswordPage() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiSend<{ message: string }>(
        "/api/auth/forgot-password",
        "POST",
        { email }
      );
      setMessage(res.message);
      push("Check your email for next steps", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send reset instructions if an account exists."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <AuthFormMessage tone="error" message={error} /> : null}
        {message ? <AuthFormMessage tone="success" message={message} /> : null}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Button type="submit" className="w-full" isLoading={loading} size="lg">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
