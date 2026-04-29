"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../../stores/auth.store";
import {
  getCurrentUser,
  logoutAction,
} from "../../../../services/auth.service";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToogle } from "@/components/theme-toogle";

export default function Page() {
  const router = useRouter();
  const { user, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    };
    loadUser();
  }, [router, setUser]);

  if (!user) {
    return (
      <div className="h-screen w-full justify-center items-center flex">
        <h6>Loading...</h6>
      </div>
    );
  }

  return (
    <div className="h-screen w-full justify-center items-center flex flex-col gap-5">
      <h1 className="text-5xl font-bold leading-relaxed">
        Halo, {user.name || user.email}!
      </h1>
      <LogoutButton />
      <ThemeToogle />
    </div>
  );
}
// Author : M. Hamdan Yusuf 😎
