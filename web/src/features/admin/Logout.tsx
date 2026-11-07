"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function Logout() {
  const router = useRouter(),
    [error, setError] = useState(false);
  return (
    <div>
      <button
        className="text-ink-700 underline"
        type="button"
        onClick={async () => {
          try {
            const response = await fetch("/api/admin/logout", {
              method: "POST",
            });
            if (!response.ok) throw new Error();
            router.replace("/admin/login");
            router.refresh();
          } catch {
            setError(true);
          }
        }}
      >
        Sair
      </button>
      {error && (
        <span role="alert" className="form-error">
          Não foi possível sair. Tente novamente.
        </span>
      )}
    </div>
  );
}
