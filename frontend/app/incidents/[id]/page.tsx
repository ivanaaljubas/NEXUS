"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";  

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

type IncidentNote = {
  id: number;
  incidentId: number;
  content: string;
  createdAt: string;
  author: string;
};

type IncidentDetails = {
  incident: Incident;
  alerts: Alert[];
  events: SecurityEvent[];
  notes: IncidentNote[];
};

export default function IncidentDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<IncidentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("Open");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
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
        setSelectedStatus(result.incident.status);
      } catch {
        setError("Greška pri dohvaćanju incidenta.");
      } finally {
        setLoading(false);
      }
    };

    loadIncident();
  }, [id]);

  
async function handleSaveNote(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const content = noteContent.trim();

  if (!content) {
    setNoteMessage("Prvo upiši tekst bilješke.");
    return;
  }

  setSavingNote(true);
  setNoteMessage("");

  try {
    const response = await fetch(
      `http://localhost:5186/api/incidents/${id}/notes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          author: "Analyst",
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);

      throw new Error(
        errorBody?.message ?? "Bilješku nije moguće spremiti."
      );
    }

    setNoteContent("");

    // Ponovno učitavamo incident kako bismo prikazali novu bilješku.
    const refreshResponse = await fetch(
      `http://localhost:5186/api/incidents/${id}`
    );

    if (refreshResponse.ok) {
      const refreshedData: IncidentDetails =
        await refreshResponse.json();

      setData(refreshedData);
      setNoteMessage("Bilješka je uspješno spremljena.");
    } else {
      setNoteMessage(
        "Bilješka je spremljena, ali prikaz nije osvježen. Ponovno učitaj stranicu."
      );
    }
  } catch (err) {
    setNoteMessage(
      err instanceof Error
        ? err.message
        : "Došlo je do greške pri spremanju bilješke."
    );
  } finally {
    setSavingNote(false);
  }
}

async function handleStatusUpdate(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setUpdatingStatus(true);
  setStatusMessage("");

  try {
    const response = await fetch(
      `http://localhost:5186/api/incidents/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);

      throw new Error(
        errorBody?.message ?? "Status nije moguće promijeniti."
      );
    }

    const result = await response.json();
    const newStatus = result.status ?? selectedStatus;

    setSelectedStatus(newStatus);

    setData((current) =>
      current
        ? {
            ...current,
            incident: {
              ...current.incident,
              status: newStatus,
            },
          }
        : current
    );

    setStatusMessage(`Status je promijenjen u: ${newStatus}.`);
  } catch (err) {
    setStatusMessage(
      err instanceof Error
        ? err.message
        : "Došlo je do greške pri promjeni statusa."
    );
  } finally {
    setUpdatingStatus(false);
  }
}

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

  const { incident, alerts, events, notes } = data;

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
        
        {/* Incident management */}
        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          {/* Status */}
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6">
            <h2 className="text-xl font-semibold">Manage Incident</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Promijeni status ovog incidenta.
            </p>

            <form onSubmit={handleStatusUpdate} className="mt-5 space-y-4">
              <label
                htmlFor="incident-status"
                className="block text-sm text-zinc-400"
              >
                Incident status
              </label>

              <select
                id="incident-status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                disabled={updatingStatus}
                className="w-full rounded-lg border border-white/10 bg-[#080b0d] px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              >
                <option value="Open">Open</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <button
                type="submit"
                disabled={updatingStatus}
                className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {updatingStatus ? "Saving..." : "Save status"}
              </button>

              {statusMessage && (
                <p className="text-sm text-zinc-400" role="status">
                  {statusMessage}
                </p>
              )}
            </form>
          </div>

          {/* Analyst notes */}
          <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6">
            <h2 className="text-xl font-semibold">Analyst Notes</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Zapiši zapažanja i korake tijekom istrage.
            </p>

            <form onSubmit={handleSaveNote} className="mt-5 space-y-4">
              <label
                htmlFor="incident-note"
                className="block text-sm text-zinc-400"
              >
                New note
              </label>

              <textarea
                id="incident-note"
                value={noteContent}
                onChange={(event) => setNoteContent(event.target.value)}
                maxLength={4000}
                rows={4}
                placeholder="Opiši što si provjerila i što treba napraviti..."
                disabled={savingNote}
                className="w-full resize-y rounded-lg border border-white/10 bg-[#080b0d] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
              />

              <button
                type="submit"
                disabled={savingNote || !noteContent.trim()}
                className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingNote ? "Saving..." : "Add note"}
              </button>

              {noteMessage && (
                <p className="text-sm text-zinc-400" role="status">
                  {noteMessage}
                </p>
              )}
            </form>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <h3 className="text-sm font-semibold text-zinc-300">
                Previous notes ({notes.length})
              </h3>

              {notes.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Još nema bilješki za ovaj incident.
                </p>
              ) : (
                notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-lg border border-white/5 bg-black/20 p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                      {note.content}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-zinc-600">
                      <span>{note.author}</span>
                      <span>
                        {new Date(note.createdAt).toLocaleString("hr-HR")}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

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