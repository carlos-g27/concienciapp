import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "@/lib/utils";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Si las variables de entorno no están configuradas, saltar
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: no poner código entre createServerClient y getClaims()
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;

  // ── Redirección global si no hay sesión ─────────────────────
  if (
    !user &&
    pathname !== "/" &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // ── Usuario ya autenticado en landing/login/sign-up → mandarlo directo a su app ──
  // No incluye otras rutas /auth/* (update-password, forgot-password, sign-up-success, etc.)
  // para no interrumpir esos flujos.
  if (
    user &&
    (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/sign-up")
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.sub)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // ── Protección de rutas /admin ───────────────────────────────
  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.sub)        // sub es el user id en los claims
      .single();

    if (!profile || profile.role !== "admin") {
      // Usuario sin rol admin → redirigir a su dashboard
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANTE: retornar siempre supabaseResponse para no romper las cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};