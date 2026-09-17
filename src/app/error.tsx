"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <EmptyState
          title="Algo deu errado."
          description={error.message || "Tente novamente em alguns segundos."}
          action={<Button onClick={reset}>Tentar de novo</Button>}
        />
      </div>
    </main>
  );
}
