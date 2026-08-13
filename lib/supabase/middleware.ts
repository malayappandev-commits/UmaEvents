import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isEmployee = path === "/employee" || path.startsWith("/employee/");
  const isLogin = path === "/login" || path.startsWith("/login/");

  if (!user && (isAdmin || isEmployee)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (user && (isAdmin || isEmployee || isLogin)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role as string | undefined;
    const active = profile?.status === "ACTIVE";

    if (!active) {
      await supabase.auth.signOut();
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("error", "disabled");
      return NextResponse.redirect(redirect);
    }

    if (isLogin) {
      const dest = role === "EMPLOYEE" ? "/employee" : "/admin";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isAdmin && role === "EMPLOYEE") {
      return NextResponse.redirect(new URL("/employee", request.url));
    }

    if (isEmployee && role !== "EMPLOYEE" && role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}
