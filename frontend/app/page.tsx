export default function Home() {
  return (
    <main className="min-h-screen bg-[#080b0d] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-[#0b0f12] px-5 py-6">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                N
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-wide">NEXUS</h1>
                <p className="text-xs text-zinc-500">Security Operations</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <a
              href="#"
              className="flex items-center rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400"
            >
              Dashboard
            </a>

            <a
              href="#"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Incidents
            </a>

            <a
              href="#"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Alerts
            </a>

            <a
              href="#"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Events
            </a>

            <a
              href="/attack-simulator"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Attack Simulator
            </a>

            <a
              href="#"
              className="flex items-center rounded-lg px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Detection Rules
            </a>
          </nav>

          {/* Bottom */}
          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="mb-3 text-xs uppercase tracking-wider text-zinc-600">
              System
            </p>

            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              All systems operational
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 p-8">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Security Operations Center</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Security Overview
              </h2>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0d1317] px-4 py-2 text-sm text-zinc-400">
              ● Live Monitoring
            </div>
          </header>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Total Events</p>
              <p className="mt-2 text-3xl font-semibold">12,481</p>
              <p className="mt-2 text-xs text-emerald-400">
                +8.2% from yesterday
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Active Alerts</p>
              <p className="mt-2 text-3xl font-semibold">37</p>
              <p className="mt-2 text-xs text-yellow-400">12 require review</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Critical Alerts</p>
              <p className="mt-2 text-3xl font-semibold text-red-400">8</p>
              <p className="mt-2 text-xs text-red-400">
                Immediate attention
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-5">
              <p className="text-sm text-zinc-500">Active Incidents</p>
              <p className="mt-2 text-3xl font-semibold text-orange-400">4</p>
              <p className="mt-2 text-xs text-zinc-500">
                2 currently investigating
              </p>
            </div>
          </div>

          {/* Threat activity */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6 xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Threat Activity</h3>
                  <p className="text-sm text-zinc-500">
                    Security events detected over time
                  </p>
                </div>

                <button className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5">
                  Last 24 hours
                </button>
              </div>

              <div className="flex h-64 items-end gap-3">
                {[35, 48, 42, 65, 52, 78, 58, 86, 62, 72, 95, 68, 80, 54, 88, 70, 92, 64, 76, 58].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t bg-emerald-500/40 transition hover:bg-emerald-400/60"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>
            </div>

            {/* Threat level */}
            <div className="rounded-xl border border-white/10 bg-[#0d1317] p-6">
              <h3 className="text-lg font-semibold">Threat Level</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Current environment risk
              </p>

              <div className="mt-8 flex justify-center">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-yellow-500/20">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-400">64</p>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Medium
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Low</span>
                  <span className="text-emerald-400">32%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">Medium</span>
                  <span className="text-yellow-400">51%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">High</span>
                  <span className="text-red-400">17%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incidents */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#0d1317] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Active Incidents</h3>
                <p className="text-sm text-zinc-500">
                  Incidents requiring analyst attention
                </p>
              </div>

              <button className="text-sm text-emerald-400 hover:text-emerald-300">
                View all
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <p className="font-medium">Possible Account Compromise</p>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    john.smith • WORKSTATION-23
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-red-400">CRITICAL</p>
                  <p className="text-xs text-zinc-600">2 min ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <p className="font-medium">Brute Force Attack</p>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    185.xxx.xxx.xxx • SSH
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-400">HIGH</p>
                  <p className="text-xs text-zinc-600">8 min ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <p className="font-medium">Suspicious PowerShell Activity</p>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    FINANCE-PC-04 • PowerShell
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-yellow-400">MEDIUM</p>
                  <p className="text-xs text-zinc-600">14 min ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}