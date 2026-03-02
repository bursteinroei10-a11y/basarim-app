"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AdminSignOut() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
    >
      התנתק
    </Button>
  );
}
