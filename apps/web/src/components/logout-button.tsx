"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true);
    setError("");
    try {
      await api("/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log out. Try again.",
      );
      setPending(false);
    }
  }
  return (
    <div className="logout-wrap">
      <button
        type="button"
        className="text-button"
        disabled={pending}
        onClick={logout}
      >
        {pending ? "Logging out…" : "Log out"}
      </button>
      {error && (
        <span className="compact-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
