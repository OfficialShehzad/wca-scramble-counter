import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code received" }, { status: 400 });
  }

  // Exchange code for token
  const tokenRes = await fetch(
    "https://www.worldcubeassociation.org/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.NEXT_PUBLIC_WCA_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_WCA_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_WCA_REDIRECT_URI,
      }),
    }
  );

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return NextResponse.json(tokenData, { status: 500 });
  }

  const accessToken = tokenData.access_token;

  // Set secure HTTP-only cookie
  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/competitions`);
  response.cookies.set("wca_token", accessToken, {
    httpOnly: false,
    secure: false,        // set true in production HTTPS
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  return response;
}
