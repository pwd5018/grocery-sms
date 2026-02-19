import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    hasAppPassword: Boolean(process.env.APP_PASSWORD),
    appAuthCookie: process.env.APP_AUTH_COOKIE ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}

