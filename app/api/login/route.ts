import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");

  const expected = (process.env.APP_PASSWORD ?? process.env.PASSWORD ?? "").trim();
  const cookieName = process.env.APP_AUTH_COOKIE || "grocery_auth";

  if (!expected) {
    return new NextResponse(
      "Server not configured: set APP_PASSWORD (or PASSWORD) in your environment.",
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.redirect(
      new URL(`login?next=${encodeURIComponent(next)}`, req.url),
      { status: 303 }
    );
  }

  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });

res.cookies.set(cookieName, "1", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ✅ works on localhost
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
});


  return res;
}