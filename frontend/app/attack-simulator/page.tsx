"use client";

import { useState } from "react";

type SimulationResult = {
  scenario: string;
  eventsCreated: number;
  alertCreated: boolean;
  alert?: {
    id: number;
    title: string;
    severity: string;
    sourceIp: string;
    username: string;
    eventCount: number;
    status: string;
  };
};

export default function AttackSimulatorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  const simulateBruteForce = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5186/api/simulator/brute-force",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Simulation failed.");
      }

      const data: SimulationResult = await response.json();
      setResult(data);
    } catch {
      setError("Nije moguće pokrenuti simulaciju.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080b0d] p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm text-zinc-500">
            NEXUS Security Operations
          </p>

          <h1 className="mt-1 text-3xl font-semibold">
            Attack Simulator
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Generiraj kontrolirane sigurnosne scenarije za testiranje
            NEXUS detection enginea.
          </p>
        </div>

        {/* Brute force scenario */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1317] p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  ⚠
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    Brute Force Attack
                  </h2>

                  <p className="text-sm text-zinc-500">
                    5 neuspješnih prijava s iste IP adrese
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-zinc-400 sm:grid-cols-3">
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Events
                  </p>
                  <p className="mt-1 font-semibold text-white">5</p>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Detection
                  </p>
                  <p className="mt-1 font-semibold text-emerald-400">
                    Enabled
                  </p>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Expected result
                  </p>
                  <p className="mt-1 font-semibold text-red-400">
                    High Alert
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={simulateBruteForce}
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Simulating..." : "Simulate Attack"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1317] p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                ✓
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Simulation completed
                </h2>

                <p className="text-sm text-zinc-500">
                  NEXUS je obradio generirane događaje.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Scenario
                </p>
                <p className="mt-2 text-sm text-white">
                  {result.scenario}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Events created
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-400">
                  {result.eventsCreated}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Alert created
                </p>
                <p className="mt-2 text-2xl font-semibold text-red-400">
                  {result.alertCreated ? "YES" : "NO"}
                </p>
              </div>
            </div>

            {result.alert && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Detection result
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      {result.alert.title}
                    </h3>
                  </div>

                  <span className="w-fit rounded-md border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase text-orange-400">
                    {result.alert.severity}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-zinc-600">IP</p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {result.alert.sourceIp}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">User</p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {result.alert.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">Events</p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {result.alert.eventCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">Status</p>
                    <p className="mt-1 text-sm font-semibold text-red-400">
                      {result.alert.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}