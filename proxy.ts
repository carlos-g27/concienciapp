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

  // IMPORTANTE: no poner código entre createServerClient y getUser().
  // Se usa getUser() (patrón oficial de @supabase/ssr para middleware) porque
  // sí refresca la sesión y, vía setAll, escribe las cookies rotadas en
  // supabaseResponse. Con getClaims() (solo verificación local) el token nunca
  // se refrescaba desde el middleware y la sesión se desincronizaba (loop
  // /admin ⇄ /auth/login en Vercel).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirige preservando las cookies de sesión que `supabaseResponse` haya
  // refrescado. Sin esto, un `NextResponse.redirect` "pelado" descarta la
  // rotación del refresh token y la sesión queda desincronizada (loop de
  // redirección /admin ⇄ /auth/login). Patrón recomendado por @supabase/ssr.
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) =>
      redirectResponse.cookies.set(cookie),
    );
    return redirectResponse;
  };

  // ── Redirección global si no hay sesión ─────────────────────
  if (
    !user &&
    pathname !== "/" &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/login")
  ) {
    return redirectTo("/auth/login");
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
      .eq("id", user.id)
      .single();

    return redirectTo(profile?.role === "admin" ? "/admin" : "/dashboard");
  }

  // ── Protección de rutas /admin ───────────────────────────────
  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // Usuario sin rol admin → redirigir a su dashboard
      return redirectTo("/dashboard");
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