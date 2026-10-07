"use client";

import { useEffect, useState } from "react";

type SecurityEvent = {
  id: number;
  timestamp: string;
  eventType: string;
  username?: string;
  sourceIp?: string;
  hostname?: string;
  severity: string;
  message?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch("http://localhost:5186/api/events");

        if (!response.ok) {
          throw new Error("Ne mogu dohvatiti događaje.");
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError("Greška pri dohvaćanju security eventa.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <main className="min-h-screen bg-[#080b0d] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm text-zinc-500">NEXUS Security Operations</p>
          <h1 className="mt-1 text-3xl font-semibold">Security Events</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Događaji dohvaćeni iz NEXUS backend API-ja.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6">
            Učitavanje događaja...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1317]">
            <div className="grid grid-cols-7 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-wider text-zinc-500">
              <span>ID</span>
              <span>Vrijeme</span>
              <span>Tip</span>
              <span>Korisnik</span>
              <span>IP</span>
              <span>Računalo</span>
              <span>Severity</span>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                Nema sigurnosnih događaja.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-7 border-b border-white/5 px-5 py-4 text-sm"
                >
                  <span className="text-zinc-400">{event.id}</span>

                  <span className="text-zinc-400">
                    {new Date(event.timestamp).toLocaleString("hr-HR")}
                  </span>

                  <span className="font-medium text-emerald-400">
                    {event.eventType}
                  </span>

                  <span className="text-zinc-300">
                    {event.username ?? "-"}
                  </span>

                  <span className="text-zinc-300">
                    {event.sourceIp ?? "-"}
                  </span>

                  <span className="text-zinc-300">
                    {event.hostname ?? "-"}
                  </span>

                  <span
                    className={
                      event.severity.toLowerCase() === "high"
                        ? "font-semibold text-red-400"
                        : "text-yellow-400"
                    }
                  >
                    {event.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}