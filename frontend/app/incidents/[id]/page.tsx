"use client";

import { useParams } from "next/navigation";
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
  incidentId?: number;
};

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

type Incident = {
  id: number;
  title: string;
  severity: string;
  createdAt: string;
  status: string;
  riskScore: number;
  description?: string;
};

type IncidentDetails = {
  incident: Incident;
  alerts: Alert[];
  events: SecurityEvent[];
};

export default function IncidentDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<IncidentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIncident = async () => {
      try {
        const response = await fetch(
          `http://localhost:5186/api/incidents/${id}`
        );

        if (!response.ok) {
          throw new Error("Incident nije pronađen.");
        }

        const result = await response.json();
        setData(result);
      } catch {
        setError("Greška pri dohvaćanju incidenta.");
      } finally {
        setLoading(false);
      }
    };

    loadIncident();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080b0d] p-8 text-white">
        <div className="mx-auto max-w-7xl text-zinc-400">
          Učitavanje incidenta...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#080b0d] p-8 text-white">
        <div className="mx-auto max-w-7xl rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error || "Incident nije pronađen."}
        </div>
      </main>
    );
  }

  const { incident, alerts, events } = data;

  return (
    <main className="min-h-screen bg-[#080b0d] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-zinc-500">
            NEXUS Security Operations
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-zinc-600">
              INCIDENT #{incident.id}
            </span>

            <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs font-semibold uppercase text-orange-400">
              {incident.severity}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold">
            {incident.title}
          </h1>

          <p className="mt-2 max-w-3xl text-zinc-500">
            {incident.description}
          </p>
        </div>

        {/* Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
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

          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Severity
            </p>

            <p className="mt-2 text-lg font-semibold">
              {incident.severity}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Status
            </p>

            <p className="mt-2 text-lg font-semibold text-red-400">
              {incident.status}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Created
            </p>

            <p className="mt-2 text-sm text-zinc-300">
              {new Date(incident.createdAt).toLocaleString("hr-HR")}
            </p>
          </div>
        </div>

        {/* Related Alerts */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Related Alerts
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Alerti povezani s ovim incidentom.
            </p>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-white/10 bg-[#0d1317] p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Alert #{alert.id}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      {alert.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Rule: {alert.ruleName}
                    </p>
                  </div>

                  <span className="w-fit rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs font-semibold uppercase text-orange-400">
                    {alert.severity}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-zinc-600">
                      Source IP
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {alert.sourceIp ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">
                      Username
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {alert.username ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">
                      Events
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {alert.eventCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">
                      Detected
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {new Date(alert.detectedAt).toLocaleString(
                        "hr-HR"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Attack Timeline
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Događaji povezani s ovim incidentom.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6">
            <div className="space-y-5">
              {events.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />

                    {index < events.length - 1 && (
                      <div className="mt-2 h-full w-px bg-white/10" />
                    )}
                  </div>

                  <div className="pb-4">
                    <p className="text-xs text-zinc-600">
                      {new Date(event.timestamp).toLocaleString(
                        "hr-HR"
                      )}
                    </p>

                    <p className="mt-1 font-semibold text-emerald-400">
                      {event.eventType}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {event.message}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600">
                      <span>
                        User: {event.username ?? "-"}
                      </span>

                      <span>
                        IP: {event.sourceIp ?? "-"}
                      </span>

                      <span>
                        Host: {event.hostname ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}