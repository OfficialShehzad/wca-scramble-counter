import { cookies } from "next/headers";

export default async function CompetitionDetail({ params }: any) {
  const token = (await cookies()).get("wca_token")?.value;
  const id = params.id; // dynamic param

  if (!token) {
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold mb-4">Not logged in</h1>
        <a href="/" className="text-blue-600 underline">Go to Login</a>
      </div>
    );
  }

  // Fetch competition schedule
  const res = await fetch(
    `https://www.worldcubeassociation.org/api/v0/competitions/${id}/schedule`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  let data;

    try {
        data = await res.json();
    } catch (e) {
        console.error("Invalid JSON from WCA API:", e);
        return (
            <div className="p-10">
                <h1 className="text-xl font-bold">Schedule not available</h1>
                <p>The WCA API returned an unexpected response.</p>
            </div>
        );
    }

  const schedule = data.schedule;

  const rooms = schedule?.venues?.flatMap((v: any) => v.rooms) || [];
  const activities = rooms.flatMap((r: any) => r.activities);

  // Group activities by day
  const days = activities.reduce((acc: any, a: any) => {
    const day = a.startTime.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(a);
    return acc;
  }, {});

  return (
    <div className="p-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{id}</h1>

      <h2 className="text-xl font-semibold mb-4">Days</h2>

      <div className="space-y-6">
        {Object.entries(days).map(([day, events]: any) => (
          <div key={day} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-bold text-lg mb-3">{day}</h3>

            {events.map((ev: any) => (
              <div
                key={ev.id}
                className="p-3 border rounded mb-2 bg-gray-50"
              >
                <p className="font-semibold">{ev.name}</p>
                <p className="text-sm text-gray-600">
                  {ev.startTime} → {ev.endTime}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
