"use client";
import { useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
export default function Page() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <AuthCard
      title="Reset your password"
      intro="Enter your account email. For privacy, the response is the same whether or not an account exists."
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
              "/auth/forgot-password",
              {
                method: "POST",
                body: JSON.stringify({ email: form.get("email") }),
              },
            );
            setMessage(result.message);
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to process request",
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div>
          <label className="field-label">Email address</label>
          <input
            className="field"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        {message && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            {message}
          </p>
        )}
        <Button className="w-full" loading={submitting} type="submit">
          Send reset instructions
        </Button>
      </form>
    </AuthCard>
  );
}
