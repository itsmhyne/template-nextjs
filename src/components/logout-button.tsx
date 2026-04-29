// components/LogoutButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "../../services/auth.service";
import { ResponseType } from "../../types/response.type";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result: ResponseType = await logoutAction();

      if (result.success) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        console.error("Logout failed:", result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="destructive">
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
