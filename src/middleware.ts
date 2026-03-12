import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/menu", "/orders", "/settings", "/promo", "/customers", "/report", "/qr"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

	// Only check auth for protected routes — everything else passes through instantly
	if (!isProtectedRoute) {
		return NextResponse.next();
	}

	// Protected route: need to verify auth
	try {
		let supabaseResponse = NextResponse.next({ request });

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

		const {
			data: { user },
		} = await supabase.auth.getUser();

		// Redirect unauthenticated users to login
		if (!user) {
			const url = request.nextUrl.clone();
			url.pathname = "/login";
			return NextResponse.redirect(url);
		}

		return supabaseResponse;
	} catch {
		// If Supabase is unreachable, redirect to login instead of hanging
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
