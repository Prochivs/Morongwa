"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@queuemate/shared";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "./ui/button";

type UserResponse = { user: { role: "CUSTOMER" | "ADMIN" | "AGENT" } };
function FieldError({ message }: { message?: string }) { return message ? <p className="field-error">{message}</p> : null; }

export function LoginForm() {
  const router = useRouter(); const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const submit = handleSubmit(async (values) => { try { setServerError(""); const result = await apiFetch<UserResponse>("/auth/login", { method: "POST", body: JSON.stringify(values) }); router.push(result.user.role === "ADMIN" ? "/admin" : result.user.role === "AGENT" ? "/agent" : "/customer"); router.refresh(); } catch (error) { setServerError(error instanceof Error ? error.message : "Unable to sign in"); } });
  return <form className="space-y-5" onSubmit={submit}><div><label className="field-label" htmlFor="email">Email address</label><input id="email" className="field" type="email" autoComplete="email" {...register("email")} /><FieldError message={errors.email?.message} /></div><div><div className="flex justify-between"><label className="field-label" htmlFor="password">Password</label><Link className="text-xs font-semibold text-brand" href="/forgot-password">Forgot password?</Link></div><input id="password" className="field" type="password" autoComplete="current-password" {...register("password")} /><FieldError message={errors.password?.message} /></div>{serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}<Button className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Sign in <ArrowRight size={18} /></>}</Button></form>;
}

export function RegisterForm() {
  const router = useRouter(); const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const submit = handleSubmit(async (values) => { try { setServerError(""); await apiFetch<UserResponse>("/auth/register", { method: "POST", body: JSON.stringify(values) }); router.push("/customer"); router.refresh(); } catch (error) { setServerError(error instanceof Error ? error.message : "Unable to create the account"); } });
  return <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}><div className="sm:col-span-2"><label className="field-label" htmlFor="fullName">Full name</label><input id="fullName" className="field" autoComplete="name" {...register("fullName")} /><FieldError message={errors.fullName?.message} /></div><div><label className="field-label" htmlFor="register-email">Email address</label><input id="register-email" className="field" type="email" autoComplete="email" {...register("email")} /><FieldError message={errors.email?.message} /></div><div><label className="field-label" htmlFor="mobile">Botswana mobile</label><input id="mobile" className="field" placeholder="+267 71 123 456" autoComplete="tel" {...register("mobile")} /><FieldError message={errors.mobile?.message} /></div><div><label className="field-label" htmlFor="new-password">Password</label><input id="new-password" className="field" type="password" autoComplete="new-password" {...register("password")} /><FieldError message={errors.password?.message} /></div><div><label className="field-label" htmlFor="confirm-password">Confirm password</label><input id="confirm-password" className="field" type="password" autoComplete="new-password" {...register("passwordConfirmation")} /><FieldError message={errors.passwordConfirmation?.message} /></div><label className="sm:col-span-2 flex gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 h-4 w-4" {...register("acceptTerms")} /><span>I accept the <Link className="font-semibold text-brand" href="/terms">terms and conditions</Link>.</span></label><FieldError message={errors.acceptTerms?.message} /><label className="sm:col-span-2 flex gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 h-4 w-4" {...register("acceptPrivacy")} /><span>I have read the <Link className="font-semibold text-brand" href="/privacy">privacy policy</Link>.</span></label><FieldError message={errors.acceptPrivacy?.message} />{serverError && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}<Button className="sm:col-span-2 w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Create customer account <ArrowRight size={18} /></>}</Button></form>;
}
