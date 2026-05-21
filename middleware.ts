import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Avant chaque page : si pas de session, redirection vers /login.
 * Les routes /api/auth/* sont exclues (échange de cookies, CSRF géré par Auth.js).
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname === "/login") return NextResponse.next();
  if (!req.auth) {
    const login = new URL("/login", req.nextUrl);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
