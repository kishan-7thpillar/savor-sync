import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users to dashboard, otherwise to login
  if (user) {
    redirect("/dashboard/sales");
  } else {
    redirect("/login");
  }

  // This won't be reached due to redirects
  return null;
}
