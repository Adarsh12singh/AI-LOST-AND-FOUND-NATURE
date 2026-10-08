"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Case, fetchCases, fetchHotspotAnalytics, HotspotAnalytics } from "@/lib/api";
import CaseCard from "@/components/CaseCard";
import {
  Compass,
  PlusCircle,
  Search,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  MapPin,
  ArrowRight,
  TreePine,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [analytics, setAnalytics] = useState<HotspotAnalytics | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [caseList, stats] = await Promise.all([
          fetchCases(),
          fetchHotspotAnalytics().catch(() => null),
        ]);
        setCases(caseList);
        setAnalytics(stats);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCases = cases.filter((c) => {
    if (filterType === "ALL") return true;
    return c.case_type === filterType;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-emerald-950/40 bg-radial-[at_top_center] from-emerald-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <TreePine className="w-3.5 h-3.5" />
            <span>Outdoor & Nature Environmental Recovery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
            Lost shouldn't mean <span className="text-emerald-400">gone</span>.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Report, discover, match, verify, and recover belongings in the real-world environment.
            Featuring persistent historical re-matching, terrain displacement awareness, and private ownership verification.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report-lost"
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-rose-950/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              href="/report-found"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-950/40"
            >
              <Compass className="w-4 h-4" />
              <span>Report Found Item</span>
            </Link>

            <Link
              href="/cases"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Explore Cases</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live System Metrics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs uppercase font-medium text-slate-400">Active Lost Cases</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">
              {analytics?.summary.total_lost ?? "..."}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Continuous persistent search</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs uppercase font-medium text-slate-400">Reported Found Items</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">
              {analytics?.summary.total_found ?? "..."}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Held in safe storage</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs uppercase font-medium text-slate-400">Potential Matches</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-1">
              {analytics?.summary.active_potential_matches ?? "..."}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Multi-signal verified</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs uppercase font-medium text-slate-400">Recovered Belongings</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              {analytics?.summary.total_recovered ?? "..."}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Safely handed over</div>
          </div>
        </div>
      </section>

      {/* The 5-Step Workflow: Lost -> Discovery -> Matching -> Verification -> Recovery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            The Complete Recovery Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Real-world recovery is more than a simple match. We support the entire journey from reporting to safe handover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-rose-400">01</span>
              <h3 className="font-semibold text-slate-200 text-sm mt-1">Lost Report</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Report with smart question assistance. Profile permanent wear and changeable accessories.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400">02</span>
              <h3 className="font-semibold text-slate-200 text-sm mt-1">Discovery</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Items found on trails, rivers, or parks are safely recorded with holding station locations.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-purple-400">03</span>
              <h3 className="font-semibold text-slate-200 text-sm mt-1">Persistent Matching</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                If no match exists today, the search stays active. Future reports trigger automatic re-matching.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400">04</span>
              <h3 className="font-semibold text-slate-200 text-sm mt-1">Verification</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                AI Match != Confirmed Ownership. Claimant must prove hidden marks or secret details privately.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400">05</span>
              <h3 className="font-semibold text-slate-200 text-sm mt-1">Safe Handover</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Recover items at authorized ranger stations, visitor booths, or secure public meeting points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Cases Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              Active Cases in the Field
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse current lost and found cases across natural environments
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === "ALL"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Cases
            </button>
            <button
              onClick={() => setFilterType("LOST")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === "LOST"
                  ? "bg-rose-500/20 text-rose-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setFilterType("FOUND")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === "FOUND"
                  ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <p className="text-slate-400 text-sm">No cases found matching the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.slice(0, 6).map((c) => (
              <CaseCard key={c.id} item={c} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 transition"
          >
            <span>View All Active Cases & Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Core Principles Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-900/40">
          <div className="max-w-3xl">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
              Why AI LOST AND FOUND NATURE is Different
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Most lost and found systems rely on immediate identical keyword matching. In real-world environments, items are carried by water currents, found days or weeks later, or described using completely different words.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Persistent Historical Re-Matching</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Day 1 has no match? The system keeps searching. When a new found report arrives 10 days later, historical lost cases are automatically re-evaluated.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Explainable Evidence</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    No blind confidence percentages. Clear human-readable evidence: brand match, distance, temporal proximity, and distinctive marks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Nature & Movement Intelligence</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accounts for item drift: downhill slopes, river flow down stream, and transit to park visitor booths.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Privacy & Multi-Claimant Defense</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Serial numbers, secret scratches, and known contents are kept in a private vault, preventing fraudulent claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
