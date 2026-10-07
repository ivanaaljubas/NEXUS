"use client";

import { useEffect, useState } from "react";

type Alert = {
  id: number;
  ruleName: string;
  title: string;
  severity: string;
  detectedAt: string;
  sourceIp?: string;
  username?: string;
  eventCount: number;
  description?: string;
  status: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await fetch("http://localhost:5186/api/alerts");

        if (!response.ok) {
          throw new Error("Ne mogu dohvatiti alerte.");
        }

        const data = await response.json();
        setAlerts(data);
      } catch {
        setError("Greška pri dohvaćanju alerta.");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";

      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";

      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";

      default:
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
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
            Security Alerts
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Upozorenja koja je NEXUS automatski detektirao.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6 text-zinc-400">
            Učitavanje alerta...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-10 text-center">
            <p className="text-zinc-400">
              Trenutno nema aktivnih alerta.
            </p>
          </div>
        )}

        {!loading && !error && alerts.length > 0 && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-white/10 bg-[#0d1317] p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-xl font-semibold">
                        {alert.title}
                      </h2>

                      <span
                        className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase ${getSeverityClass(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-500">
                      Pravilo:{" "}
                      <span className="text-zinc-300">
                        {alert.ruleName}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-red-400">
                      {alert.status}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Source IP
                    </p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {alert.sourceIp ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Korisnik
                    </p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {alert.username ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Broj događaja
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                      {alert.eventCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Detektirano
                    </p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {new Date(alert.detectedAt).toLocaleString("hr-HR")}
                    </p>
                  </div>
                </div>

                {alert.description && (
                  <div className="mt-6 rounded-lg border border-white/5 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Detection details
                    </p>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {alert.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}