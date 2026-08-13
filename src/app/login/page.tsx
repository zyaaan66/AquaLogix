"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Waves, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});
type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "AquaLogix" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login gagal.");
        return;
      }
      toast.success(`Selamat datang, ${data.user.name}`);
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-sonar-radial px-3">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-sm bg-accent/15 text-accent">
            <Waves className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-foreground font-display text-lg font-semibold">
            Masuk ke AquaLogix
          </CardTitle>
          <p className="text-xs text-muted-foreground">Smart Supply Chain Analytics</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-sm border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="nama@perusahaan.com"
              />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs text-muted-foreground">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full rounded-sm border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={submitting}>
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
