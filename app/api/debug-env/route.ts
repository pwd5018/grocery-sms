import { NextResponse } from "next/server";

export function GET() {
  const resolvedPassword = (process.env.APP_PASSWORD ?? process.env.PASSWORD ?? "").trim();

  return NextResponse.json({
    hasAppPassword: Boolean(resolvedPassword),
    usingLegacyPasswordVar: !process.env.APP_PASSWORD && Boolean(process.env.PASSWORD),
    appAuthCookie: process.env.APP_AUTH_COOKIE ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}

