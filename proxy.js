import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(daftarCookie) {
        daftarCookie.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        daftarCookie.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (user && request.nextUrl.pathname !== "/admin/login") {
    const { data: profil, error } = await supabase.from("admin_profile").select("aktif").eq("user_id", user.id).maybeSingle();
    if (!error && !profil?.aktif) {
      return NextResponse.redirect(new URL("/admin/login?error=nonaktif", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
