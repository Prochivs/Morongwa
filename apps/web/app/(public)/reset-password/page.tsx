"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
function ResetPasswordForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <AuthCard
      title="Choose a new password"
      intro="Use at least 12 characters with uppercase, lowercase, number, and symbol."
      alternate={null}
    >
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (submitting) return;
          setSubmitting(true);
          const form = new FormData(event.currentTarget);
          try {
            const result = await apiFetch<{ message: string }>(
              "/auth/reset-password",
              {
                method: "POST",
                body: JSON.stringify({
                  token: params.get("token"),
                  password: form.get("password"),
                  passwordConfirmation: form.get("passwordConfirmation"),
                }),
              },
            );
            setMessage(result.message);
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to reset password",
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div>
          <label className="field-label">New password</label>
          <input
            className="field"
            name="password"
            type="password"
            placeholder="Create a secure password"
            required
            minLength={12}
          />
        </div>
        <div>
          <label className="field-label">Confirm new password</label>
          <input
            className="field"
            name="passwordConfirmation"
            type="password"
            placeholder="Re-enter your new password"
            required
            minLength={12}
          />
        </div>
        {message && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            {message}
          </p>
        )}
        <Button className="w-full" loading={submitting} type="submit">
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
