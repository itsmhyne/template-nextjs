"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth.store";
import { useEffect, useState } from "react";
import { loginAction } from "../../services/auth.service";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { setLoading, isLoading, setError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "developer@dev.com",
    password: "password",
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        // Cek apakah masih loading setelah timeout
        if (useAuthStore.getState().isLoading) {
          setLoading(false);
          setError("Login timeout, silakan coba lagi");
        }
      }, 10000); // 10 detik timeout
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading, setLoading, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set loading state
    setLoading(true);
    setError(null);

    // Validasi client-side dulu
    if (!formData.email || !formData.password) {
      setError("Email dan password wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("email", formData.email);
      form.append("password", formData.password);

      // Panggil server action
      const result = await loginAction(form);

      // Jika server action mengembalikan error
      if (result && "error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Jika sukses, redirect akan terjadi di server action
      // Tapi kita perlu handle kemungkinan redirect tidak terjadi
      router.push("/dashboard");
    } catch (error) {
      // Redirect akan menyebabkan error, tapi itu normal
      // Kita cek apakah error karena redirect
      console.error("Login error:", error);
      setLoading(false);
    } finally {
      // Jangan lupa reset loading jika tidak terjadi redirect
      // Set timeout untuk kasus redirect tidak terjadi
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {useAuthStore.getState().error && (
              <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
                {useAuthStore.getState().error}
              </div>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
