
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SecurityEvent = {
  id: number;
  timestamp: string;
  eventType: string;
  username?: string | null;
  sourceIp?: string | null;
  hostname?: string | null;
  severity: string;
  message?: string | null;
};

type SecurityAlert = {
  id: number;
  title: string;
  ruleName: string;
  severity: string;
  detectedAt: string;
  sourceIp?: string | null;
  username?: string | null;
  eventCount: number;
  status: string;
};

type SecurityIncident = {
  id: number;
  title: string;
  severity: string;
  createdAt: string;
  status: string;
  riskScore: number;
  description?: string | null;
};

type HourBucket = {
  label: string;
  count: number;
  key: string;
};

const API_URL = "http://localhost:5186";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("hr-HR");
}

function formatTimeAgo(value: string) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Unknown time";
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60_000)
  );

  if (minutes < 1) return "Upravo sada";
  if (minutes < 60) return `Prije ${minutes} min`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `Prije ${hours} h`;

  return `Prije ${Math.floor(hours / 24)} d`;
}

function getSeverityClass(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "text-red-400";

    case "high":
      return "text-orange-400";

    case "medium":
      return "text-yellow-400";

    default:
      return "text-emerald-400";
  }
}

function getSeverityDot(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-500";

    case "high":
      return "bg-orange-500";

    case "medium":
      return "bg-yellow-500";

    default:
      return "bg-emerald-400";
  }
}

export default function Home() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
useEffect(() => {
  let cancelled = false;
  let firstLoad = true;

  async function loadDashboard() {
    try {
      // Prikazujemo stanje učitavanja samo pri prvom otvaranju.
      if (firstLoad && !cancelled) {
        setLoading(true);
      }

      const [
        eventsResponse,
        alertsResponse,
        incidentsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/events`),
        fetch(`${API_URL}/api/alerts`),
        fetch(`${API_URL}/api/incidents`),
      ]);

      if (
        !eventsResponse.ok ||
        !alertsResponse.ok ||
        !incidentsResponse.ok
      ) {
        throw new Error("API request failed");
      }

      const [
        eventsData,
        alertsData,
        incidentsData,
      ] = await Promise.all([
        eventsResponse.json(),
        alertsResponse.json(),
        incidentsResponse.json(),
      ]);

      if (!cancelled) {
        setEvents(eventsData);
        setAlerts(alertsData);
        setIncidents(incidentsData);
        setError("");
      }
    } catch (err) {
      console.error("NEXUS dashboard error:", err);

      if (!cancelled) {
        setError(
          "Podatke nije moguće dohvatiti. Provjeri radi li backend na portu 5186."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }

      firstLoad = false;
    }
  }

  // Prvo učitavanje odmah pri otvaranju Dashboarda.
  void loadDashboard();

  // Ponovno dohvaćanje podataka svakih 15 sekundi.
  const intervalId = window.setInterval(() => {
    void loadDashboard();
  }, 15_000);

  // Zaustavi interval kada napustimo stranicu.
  return () => {
    cancelled = true;
    window.clearInterval(intervalId);
  };
}, []);

  // Otvoreni alerti
  const activeAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => alert.status?.toLowerCase() === "open"
      ),
    [alerts]
  );

  // Otvoreni incidenti
  const activeIncidents = useMemo(
    () =>
      incidents.filter(
        (incident) => incident.status?.toLowerCase() === "open"
      ),
    [incidents]
  );

  // Kritični alerti koji su još otvoreni
  const criticalAlerts = activeAlerts.filter(
    (alert) => alert.severity?.toLowerCase() === "critical"
  );

  // Najnoviji otvoreni incidenti
  const recentIncidents = useMemo(
    () =>
      [...activeIncidents]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 3),
    [activeIncidents]
  );

  // Broj događaja po satu u posljednja 24 sata
  const hourlyActivity = useMemo<HourBucket[]>(() => {
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);

    return Array.from({ length: 24 }, (_, index) => {
      const hour = new Date(
        currentHour.getTime() -
          (23 - index) * 60 * 60 * 1000
      );

      const nextHour = new Date(
        hour.getTime() + 60 * 60 * 1000
      );

      const count = events.filter((event) => {
        const timestamp = new Date(event.timestamp).getTime();

        return (
          timestamp >= hour.getTime() &&
          timestamp < nextHour.getTime()
        );
      }).length;

      return {
        key: hour.toISOString(),
        label: hour.toLocaleTimeString("hr-HR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        count,
      };
    });
  }, [events]);

  const maxHourlyCount = Math.max(
    0,
    ...hourlyActivity.map((hour) => hour.count)
  );

  // Jednostavna projektna procjena rizika:
  // bodovi se računaju na temelju ozbiljnosti otvorenih alerta.
  
  // Bodovi prema ozbiljnosti pojedinog otvorenog alerta.
  const threatWeights: Record<string, number> = {
    low: 25,
    medium: 50,
    high: 70,
    critical: 100,
  };

  // Računamo prosječnu ozbiljnost otvorenih alerta.
  const averageThreatScore =
    activeAlerts.length === 0
      ? 0
      : Math.round(
          activeAlerts.reduce(
            (total, alert) =>
              total +
              (threatWeights[alert.severity?.toLowerCase()] ?? 0),
            0
          ) / activeAlerts.length
        );

  // Barem jedan otvoreni Critical alert podiže
  // ukupnu procjenu na najmanje 85 bodova.
  const threatScore =
    criticalAlerts.length > 0
      ? Math.max(85, averageThreatScore)
      : averageThreatScore;

  const threatLevel =
    threatScore >= 80
      ? "Critical"
      : threatScore >= 60
        ? "High"
        : threatScore >= 35
          ? "Medium"
          : "Low";

  const severityCounts = {
    low: activeAlerts.filter(
      (a) => a.severity?.toLowerCase() === "low"
    ).length,
    medium: activeAlerts.filter(
      (a) => a.severity?.toLowerCase() === "medium"
    ).length,
    high: activeAlerts.filter(
      (a) => a.severity?.toLowerCase() === "high"
    ).length,
    critical: criticalAlerts.length,
  };

  function severityPercentage(count: number) {
    if (activeAlerts.length === 0) return 0;

    return Math.round((count / activeAlerts.length) * 100);
  }

  return (
    <main className="min-h-screen bg-[#080b0d] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0b0f12] px-5 py-6">
          <Link href="/" className="mb-10 block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                N
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-wide">
                  NEXUS
                </h1>
                <p className="text-xs text-zinc-500">
                  Security Operations
                </p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              href="/"
              className="flex items-center rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400"
            >
              Dashboard
            </Link>

            <Link
              href="/incidents"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Incidents
            </Link>

            <Link
              href="/alerts"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Alerts
            </Link>

            <Link
              href="/events"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Events
            </Link>

            <Link
              href="/attack-simulator"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Attack Simulator
            </Link>

          <Link
            href="/detection-rules"
            className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Detection Rules
          </Link>
          </nav>

          {/* System status */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="mb-3 text-xs uppercase tracking-wider text-zinc-600">
              System
            </p>

            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  error
                    ? "bg-red-500"
                    : loading
                      ? "bg-yellow-400"
                      : "bg-emerald-400"
                }`}
              />

              {error
                ? "Backend unavailable"
                : loading
                  ? "Connecting..."
                  : "API connected"}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1 p-8">
          {/* Header */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">
                Security Operations Center
              </p>

              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Security Overview
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Pregled stvarnih sigurnosnih podataka iz NEXUS baze.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0d1317] px-4 py-2 text-sm text-zinc-400">
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${
                  error
                    ? "bg-red-500"
                    : loading
                      ? "bg-yellow-400"
                      : "bg-emerald-400"
                }`}
              />
              {error
                ? "Connection error"
                : loading
                  ? "Loading data"
                  : "API connected"}
            </div>
          </header>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Real database statistics */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Total Events</p>

              <p className="mt-2 text-3xl font-semibold">
                {loading || error
                  ? "—"
                  : events.length.toLocaleString("hr-HR")}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Ukupan broj događaja u bazi
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Active Alerts</p>

              <p className="mt-2 text-3xl font-semibold">
                {loading || error ? "—" : activeAlerts.length}
              </p>

              <p className="mt-2 text-xs text-yellow-400">
                Otvoreni alerti
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Critical Alerts</p>

              <p className="mt-2 text-3xl font-semibold text-red-400">
                {loading || error ? "—" : criticalAlerts.length}
              </p>

              <p className="mt-2 text-xs text-red-400">
                Otvoreni alerti kritične ozbiljnosti
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Active Incidents</p>

              <p className="mt-2 text-3xl font-semibold text-orange-400">
                {loading || error ? "—" : activeIncidents.length}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Incidenti sa statusom Open
              </p>
            </div>
          </div>

          {/* Threat Activity and Threat Level */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6 xl:col-span-2">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Threat Activity
                  </h3>

                  <p className="text-sm text-zinc-500">
                    Broj događaja po satu u posljednja 24 sata
                  </p>
                </div>

                <span className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400">
                  Last 24 hours
                </span>
              </div>

              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                  Učitavanje aktivnosti...
                </div>
              ) : error ? (
                <div className="flex h-64 items-center justify-center text-sm text-red-400">
                  Aktivnost nije dostupna.
                </div>
              ) : (
                <>
                  {hourlyActivity.every((hour) => hour.count === 0) && (
                    <p className="mb-3 text-xs text-zinc-500">
                      Nema zabilježenih događaja u posljednja 24 sata.
                    </p>
                  )}

                  <div
                    className="flex h-64 items-end gap-1"
                    aria-label="Broj sigurnosnih događaja po satu"
                  >
                    {hourlyActivity.map((hour) => {
                      const height =
                        maxHourlyCount === 0
                          ? 2
                          : Math.max(
                              5,
                              (hour.count / maxHourlyCount) * 100
                            );

                      return (
                        <div
                          key={hour.key}
                          title={`${hour.label}: ${hour.count} događaja`}
                          className="flex h-full flex-1 items-end"
                        >
                          <div
                            className="w-full rounded-t bg-emerald-500/50 transition hover:bg-emerald-400"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-zinc-600">
                    <span>{hourlyActivity[0]?.label}</span>
                    <span>{hourlyActivity[12]?.label}</span>
                    <span>{hourlyActivity[23]?.label}</span>
                  </div>
                </>
              )}
            </div>

            {/* Threat Level */}
            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6">
              <h3 className="text-lg font-semibold">Threat Level</h3>

              <p className="mt-1 text-sm text-zinc-500">
                Projektna procjena prema ozbiljnosti otvorenih alerta
              </p>

              <div className="mt-8 flex justify-center">
                <div
                  className={`flex h-40 w-40 items-center justify-center rounded-full border-8 ${
                    threatLevel === "Critical"
                      ? "border-red-500/30"
                      : threatLevel === "High"
                        ? "border-orange-500/30"
                        : threatLevel === "Medium"
                          ? "border-yellow-500/20"
                          : "border-emerald-500/20"
                  }`}
                >
                  <div className="text-center">
                    <p
                      className={`text-4xl font-bold ${
                        threatLevel === "Critical"
                          ? "text-red-400"
                          : threatLevel === "High"
                            ? "text-orange-400"
                            : threatLevel === "Medium"
                              ? "text-yellow-400"
                              : "text-emerald-400"
                      }`}
                    >
                      {loading || error ? "—" : threatScore}
                    </p>

                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      {loading || error ? "Loading" : threatLevel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Low</span>
                  <span className="text-emerald-400">
                    {loading || error
                      ? "—"
                      : `${severityPercentage(severityCounts.low)}%`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">Medium</span>
                  <span className="text-yellow-400">
                    {loading || error
                      ? "—"
                      : `${severityPercentage(severityCounts.medium)}%`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">High</span>
                  <span className="text-orange-400">
                    {loading || error
                      ? "—"
                      : `${severityPercentage(severityCounts.high)}%`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">Critical</span>
                  <span className="text-red-400">
                    {loading || error
                      ? "—"
                      : `${severityPercentage(severityCounts.critical)}%`}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-zinc-600">
                Score je jednostavna projektna heuristika, a ne potvrđena
                procjena stvarnog rizika.
              </p>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#0d1317] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Active Incidents
                </h3>

                <p className="text-sm text-zinc-500">
                  Najnoviji otvoreni incidenti iz baze
                </p>
              </div>

              <Link
                href="/incidents"
                className="shrink-0 text-sm text-emerald-400 hover:text-emerald-300"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <p className="py-6 text-sm text-zinc-500">
                Učitavanje incidenata...
              </p>
            ) : error ? (
              <p className="py-6 text-sm text-red-400">
                Incidenti nisu dostupni.
              </p>
            ) : recentIncidents.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">
                Trenutno nema otvorenih incidenata.
              </p>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/incidents/${incident.id}`}
                    className="flex flex-col justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4 transition hover:border-emerald-500/20 hover:bg-white/[0.04] sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${getSeverityDot(
                            incident.severity
                          )}`}
                        />

                        <p className="font-medium">
                          {incident.title}
                        </p>
                      </div>

                      <p className="ml-5 mt-2 text-sm text-zinc-500">
                        Incident #{incident.id} · Risk Score:{" "}
                        {incident.riskScore}/100
                      </p>

                      <p className="ml-5 mt-1 text-xs text-zinc-600">
                        Kreiran: {formatDate(incident.createdAt)}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p
                        className={`text-sm font-semibold ${getSeverityClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity.toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {incident.status}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {formatTimeAgo(incident.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}