import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-7xl select-none">🔍</div>
      <h1 className="text-3xl font-semibold font-serif text-secondary mb-4">
        Page not found
      </h1>
      <p className="text-muted-foreground font-light max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button className="rounded-none px-8 py-6">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
