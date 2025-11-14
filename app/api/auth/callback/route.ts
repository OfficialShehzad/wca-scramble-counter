// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code received" }, { status: 400 });
  }

  const tokenRes = await fetch(
    "https://www.worldcubeassociation.org/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.WCA_CLIENT_ID,
        client_secret: process.env.WCA_CLIENT_SECRET,
        redirect_uri: process.env.WCA_REDIRECT_URI,
      }),
    }
  );

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return NextResponse.json({ error: tokenData }, { status: 500 });
  }

  // Fetch user profile
  const userRes = await fetch(
    "https://www.worldcubeassociation.org/api/v0/me",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );

  const userData = await userRes.json();

  return NextResponse.json({
    success: true,
    user: userData,
    tokens: tokenData,
  });
}
