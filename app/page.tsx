// app/page.tsx
import Link from "next/link";
import React from "react";

export default function Home() {
  // These are available in a server component (page.tsx)
  const clientId = process.env.NEXT_PUBLIC_WCA_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_WCA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">WCA OAUTH not configured (missing env vars)</div>
      </div>
    );
  }

  const loginUrl =
    "https://www.worldcubeassociation.org/oauth/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=${encodeURIComponent("public manage_competitions")}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Link
        href={loginUrl}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        WCA Login
      </Link>
    </div>
  );
}
