import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-bold">Settings Not Found</h2>
      <p className="text-muted-foreground">
        The organization settings could not be found.
      </p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
} 