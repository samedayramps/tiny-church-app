import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/types/supabase";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>
      <Separator />
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 sm:p-8">
          <ProfileForm user={session.user} initialData={profile} />
        </CardContent>
      </Card>
    </div>
  );
} 