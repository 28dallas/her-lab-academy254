import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Prevent confusing “blank page” failures when env vars are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      [
        'Supabase is not configured for this deployment.',
        'Missing env vars: ',
        !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : '',
        !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : '',
      ].join('')
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

