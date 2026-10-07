"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Incident = {
  id: number;
  title: string;
  severity: string;
  createdAt: string;
  status: string;
  riskScore: number;
  description?: string;
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const response = await fetch(
          "http://localhost:5186/api/incidents"
        );

        if (!response.ok) {
          throw new Error("Ne mogu dohvatiti incidente.");
        }

        const data = await response.json();
        setIncidents(data);
      } catch {
        setError("Greška pri dohvaćanju incidenata.");
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "border-red-500/20 bg-red-500/10 text-red-500";

      case "high":
        return "border-orange-500/20 bg-orange-500/10 text-orange-400";

      case "medium":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      default:
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }
  };

  return (
    <main className="min-h-screen bg-[#080b0d] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm text-zinc-500">
            NEXUS Security Operations
          </p>

          <h1 className="mt-1 text-3xl font-semibold">
            Security Incidents
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Incidenti formirani povezivanjem povezanih sigurnosnih alerta.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6 text-zinc-400">
            Učitavanje incidenata...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && incidents.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-10 text-center text-zinc-500">
            Trenutno nema incidenata.
          </div>
        )}

        {!loading && !error && incidents.length > 0 && (
          <div className="space-y-5">
            {incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/incidents/${incident.id}`}
                className="block rounded-2xl border border-white/10 bg-[#0d1317] p-6 transition hover:border-emerald-500/30 hover:bg-[#10171b]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-zinc-600">
                        INCIDENT #{incident.id}
                      </span>

                      <span
                        className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase ${getSeverityClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-semibold">
                      {incident.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                      {incident.description}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 px-5 py-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Status
                    </p>

                    <p className="mt-1 font-semibold text-red-400">
                      {incident.status}
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Risk Score
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-orange-400">
                      {incident.riskScore}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      / 100
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Severity
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      {incident.severity}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Created
                    </p>

                    <p className="mt-2 text-sm text-zinc-300">
                      {new Date(incident.createdAt).toLocaleString(
                        "hr-HR"
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}