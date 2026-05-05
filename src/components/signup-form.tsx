"use client";

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
import { useAuthStore } from "@/stores/auth.store";
import { useState } from "react";
import { registerAction } from "../../services/auth.service";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";

export default function SignupForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { setLoading, isLoading, error, setError, login } = useAuthStore(); // ✅ Ambil login dari store
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validasi gender sebelum submit
    if (!formData.gender) {
      setError("Gender harus dipilih");
      return;
    }

    // ✅ Validasi password length
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("name", formData.name);
    form.append("gender", formData.gender);
    form.append("email", formData.email);
    form.append("password", formData.password);

    try {
      const result = await registerAction(form);

      console.log("Register result:", result);

      if (result && result.success) {
        // ✅ Perbaiki: result.user bukan result.data
        login(result.data);
        router.push(result.redirectTo);
        router.refresh();
      } else if (result && result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setError("Registrasi gagal, silakan coba lagi");
        setLoading(false);
      }
    } catch (error) {
      console.error("Register error:", error);
      setError("Registrasi gagal, silakan coba lagi");
      setLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm mb-4">
              {error}
            </div>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Choose One</SelectLabel>
                    <SelectItem value="LAKI_LAKI">MALE</SelectItem>
                    <SelectItem value="PEREMPUAN">FEMALE</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isLoading}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <FieldDescription>
                Must be at least 6 characters long.
              </FieldDescription>
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
