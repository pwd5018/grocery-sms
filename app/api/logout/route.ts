import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieName = process.env.APP_AUTH_COOKIE || "grocery_auth";
  const res = NextResponse.redirect(new URL("/login", req.url), { status: 303 });

  res.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
