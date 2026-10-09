
"use client";

import Link from "next/link";

const detectionRules = [
  {
    id: "DET-001",
    name: "Brute Force Detection",
    category: "Authentication",
    severity: "High",
    description:
      "Prepoznaje velik broj neuspjelih pokušaja prijave s iste IP adrese.",
    conditions: [
      "Događaj tipa FAILED_LOGIN",
      "Ista IP adresa",
      "Najmanje 5 neuspjelih prijava unutar 5 minuta",
    ],
    result: "Possible Brute Force Attack",
    timeWindow: "5 minutes",
  },
  {
    id: "DET-002",
    name: "Successful Login After Brute Force",
    category: "Authentication",
    severity: "High",
    description:
      "Prepoznaje uspješnu prijavu nakon niza neuspjelih pokušaja s iste IP adrese.",
    conditions: [
      "Događaj tipa SUCCESSFUL_LOGIN",
      "Ista IP adresa kao kod prethodnih pokušaja",
      "Najmanje 5 neuspjelih prijava unutar prethodnih 10 minuta",
    ],
    result: "Successful Login After Brute Force",
    timeWindow: "10 minutes",
  },
];

export default function DetectionRulesPage() {
  return (
    <main className="min-h-screen bg-[#080b0d] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition hover:text-emerald-400"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">
                NEXUS Security Operations
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Detection Rules
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Pravila kojima NEXUS prepoznaje sumnjive sigurnosne
                događaje i stvara upozorenja.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0d1317] px-4 py-3">
              <p className="text-xs text-zinc-500">
                Configured rules
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-400">
                {detectionRules.length}
              </p>
            </div>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            Detection rule catalog
          </h2>

          <span className="rounded-md border border-white/10 bg-[#0d1317] px-3 py-1.5 text-xs text-zinc-400">
            Read-only · Defined in backend code
          </span>
        </div>

        <div className="space-y-5">
          {detectionRules.map((rule) => (
            <article
              key={rule.id}
              className="rounded-2xl border border-white/10 bg-[#0d1317] p-6 transition hover:border-emerald-500/20"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-zinc-600">
                      {rule.id}
                    </span>

                    <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                      Configured
                    </span>

                    <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs font-semibold uppercase text-orange-400">
                      {rule.severity}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold">
                    {rule.name}
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                    {rule.description}
                  </p>
                </div>

                <div className="shrink-0 rounded-lg border border-white/10 px-4 py-3">
                  <p className="text-xs text-zinc-600">
                    Category
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    {rule.category}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 border-t border-white/10 pt-5 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-zinc-300">
                    Detection conditions
                  </h4>

                  <ul className="mt-3 space-y-3">
                    {rule.conditions.map((condition) => (
                      <li
                        key={condition}
                        className="flex items-start gap-3 text-sm text-zinc-400"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Alert generated
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {rule.result}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-sm text-zinc-500">
                      Time window
                    </span>
                    <span className="text-sm text-zinc-300">
                      {rule.timeWindow}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-[#0d1317] p-5">
          <h3 className="font-semibold">
            Alert correlation
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            NEXUS dodatno povezuje otvorene alerte iz posljednjih 10
            minuta ako dijele istu IP adresu ili korisničko ime.
            Povezani alerti mogu postati dio istog sigurnosnog incidenta.
          </p>

          <p className="mt-3 text-xs leading-5 text-zinc-600">
            Ovo je trenutno pravilo korelacije. Budući da se koristi
            isti korisnik ili ista IP adresa kao uvjet, različite IP
            adrese istog korisnika također se mogu povezati.
          </p>

          <Link
            href="/incidents"
            className="mt-4 inline-block text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
          >
            View incidents →
          </Link>
        </div>
      </div>
    </main>
  );
}