import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserProfileMenu } from "./user-profile-menu";
import type { Database } from "@/types/supabase";

export async function Navbar() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  const { data: { session } } = await supabase.auth.getSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Your App</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/members">Members</Link>
            <Link href="/events">Events</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {session ? (
            <UserProfileMenu user={session.user} />
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 