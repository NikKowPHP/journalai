import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookies: Array<{ name: string; value: string }>) {
          cookies.forEach(({ name, value }) => {
            cookieStore.set({
              name,
              value,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          });
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}