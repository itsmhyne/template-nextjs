"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../../stores/auth.store";
import {
  getCurrentUser,
  logoutAction,
} from "../../../../services/auth.service";
import { useEffect } from "react";

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

  const handleLogout = async () => {
    clearAuth();
    await logoutAction();
  };

  if (!user) {
    return (
      <div className="h-screen w-full justify-center items-center">
        <h6>Loading...su</h6>
      </div>
    );
  }

  return (
    <div className="h-screen w-full justify-center items-center flex flex-col">
      <span>Halo, {user.name || user.email}!</span>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
// Author : M. Hamdan Yusuf 😎
