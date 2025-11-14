"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CompetitionDetail() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // scramble sets: { [activityName]: ["a","b","c"] }
  const [scrambles, setScrambles] = useState<any>({});

  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({});

  // Load scrambles
  useEffect(() => {
    const saved = localStorage.getItem("scramble_sets");
    if (saved) setScrambles(JSON.parse(saved));
  }, []);

  // Save scrambles
  useEffect(() => {
    localStorage.setItem("scramble_sets", JSON.stringify(scrambles));
  }, [scrambles]);

  useEffect(() => {
    async function load() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("wca_token="))
          ?.split("=")[1];

        if (!token) {
          setError("NOT_LOGGED_IN");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `https://www.worldcubeassociation.org/api/v0/competitions/${id}/schedule`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          setError("WCA_ERROR");
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!data) {
          setError("NO_SCHEDULE");
          setLoading(false);
          return;
        }

        setSchedule(data);
      } catch (err) {
        console.error(err);
        setError("FETCH_FAILED");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ----------------------------
  // STATES
  // ----------------------------
  if (loading) return <div className="p-10 text-xl">Loading schedule...</div>;

  if (error === "NOT_LOGGED_IN")
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold mb-4">Not logged in</h1>
        <Link href="/" className="text-blue-600 underline">
          Go to Login
        </Link>
      </div>
    );

  if (error === "NO_SCHEDULE")
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold mb-4">No schedule uploaded</h1>
        <p>The organizers have not published a schedule.</p>
      </div>
    );

  if (error)
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold mb-4">Failed to load schedule</h1>
        <p>An unexpected error occurred.</p>
      </div>
    );

  // ----------------------------
  // PROCESS
  // ----------------------------
  const rooms = schedule?.venues?.flatMap((v: any) => v.rooms) || [];
  const activities = rooms.flatMap((r: any) => r.activities);

  const days = activities.reduce((acc: any, a: any) => {
    const day = a.startTime.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(a);
    return acc;
  }, {});

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  // Use ACTIVITY NAME instead of ID
  const addScramble = (activityName: string) => {
    setScrambles((prev: any) => {
      const existing = prev[activityName] || [];
      const nextLetter = alphabet[existing.length];
      if (!nextLetter) return prev; // limit to a-z

      return {
        ...prev,
        [activityName]: [...existing, nextLetter],
      };
    });
  };

  const removeScramble = (activityName: string) => {
    setScrambles((prev: any) => {
      const existing = prev[activityName] || [];
      if (existing.length === 0) return prev;

      return {
        ...prev,
        [activityName]: existing.slice(0, -1),
      };
    });
  };

  const toggleDay = (day: string) =>
    setOpenDays((prev) => ({ ...prev, [day]: !prev[day] }));

  const copyScrambleData = () => {
    navigator.clipboard.writeText(JSON.stringify(scrambles, null, 2));
    alert("Scramble data copied!");
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="p-10 min-h-screen">
        <Link
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          href={'/competitions'}
        >
          Go back
        </Link>
      <div className="flex justify-between items-center mb-6 mt-3">
        <h1 className="text-3xl font-bold">{id}</h1>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          onClick={copyScrambleData}
        >
          Copy Scramble Data
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Schedule</h2>

      <div className="space-y-4">
        {Object.entries(days).map(([day, events]: any) => (
          <div key={day} className="border rounded-lg overflow-hidden bg-white">
            {/* Day Collapsible Button */}
            <button
              onClick={() => toggleDay(day)}
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 font-bold"
            >
              {day} {openDays[day] ? "▲" : "▼"}
            </button>

            {openDays[day] && (
              <div className="p-4 space-y-3">
                {events.filter((ev: any) => ev.name.includes('Round')).map((ev: any) => (
                  <div
                    key={ev.name}
                    className="p-3 border rounded bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{ev.name}</p>
                      <p className="text-sm text-gray-600">
                        {ev.startTime} → {ev.endTime}
                      </p>

                      {/* Show scrambles */}
                      {scrambles[ev.name]?.length > 0 && (
                        <p className="mt-1 text-sm text-green-700">
                          Sets: {scrambles[ev.name].join(", ")}
                        </p>
                      )}
                    </div>

                    {/* + / - Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeScramble(ev.name)}
                        className="px-3 py-1 bg-red-500 text-white rounded disabled:bg-gray-300"
                        disabled={!scrambles[ev.name]?.length}
                      >
                        −
                      </button>

                      <button
                        onClick={() => addScramble(ev.name)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
