"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-7xl select-none">⚠️</div>
      <h1 className="text-3xl font-semibold font-serif text-secondary mb-4">
        Something went wrong
      </h1>
      <p className="text-muted-foreground font-light max-w-md mb-8">
        An unexpected error occurred. Please try again or contact support if the issue persists.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} className="rounded-none px-8 py-6">
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="rounded-none px-8 py-6 border-secondary text-secondary">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
