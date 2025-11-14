import { cookies } from "next/headers";

export default async function Competitions() {
  const token = (await cookies()).get("wca_token")?.value;

  if (!token) {
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold mb-4">Not logged in</h1>
        <a href="/" className="text-blue-600 underline">Go to Login</a>
      </div>
    );
  }

  // Fetch competitions
  const res = await fetch(
    "https://www.worldcubeassociation.org/api/v0/competitions?managed_by_me=true",
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

    const data = await res.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize

    // Keep only competitions that start today or later
    const competitions = data.filter((c: any) => {
        const start = new Date(c.start_date);
        return start >= today;
    });


  console.log('competitions: ', competitions)

  return (
    <div className="min-h-screen bg-zinc-100 p-10">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">My Competitions</h1>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </form>
      </div>

      {competitions.length === 0 && (
        <p>No competitions found.</p>
      )}

      <div className="space-y-4">
        {competitions?.map((c: any) => (
          <div
            key={c.id}
            className="p-4 bg-white rounded-lg shadow border"
          >
            <h2 className="font-semibold text-lg">{c.name}</h2>
            <p className="text-sm text-gray-600">
              {c.city}, {c.country_iso2}
            </p>
            <p className="text-sm">
              {c.start_date} → {c.end_date}
            </p>
            <a
              href={`/competitions/${c.id}`}
              className="text-blue-600 underline text-sm"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
