"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Case,
  fetchCases,
  fetchHotspotAnalytics,
  HotspotAnalytics,
  OwnershipClaim,
  fetchClaimsForCase,
  reviewClaimApi,
  updateCaseStatusApi,
} from "@/lib/api";
import {
  ShieldCheck,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Lock,
  ArrowRight,
  Eye,
} from "lucide-react";

export default function AuthorityDashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [analytics, setAnalytics] = useState<HotspotAnalytics | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [claims, setClaims] = useState<OwnershipClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [casesList, stats] = await Promise.all([
        fetchCases(),
        fetchHotspotAnalytics().catch(() => null),
      ]);
      setCases(casesList);
      setAnalytics(stats);
      if (casesList.length > 0 && !selectedCase) {
        // Default to first found case or first case
        const foundOne = casesList.find((c) => c.case_type === "FOUND") || casesList[0];
        handleSelectCase(foundOne);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCase = async (c: Case) => {
    setSelectedCase(c);
    setLoadingClaims(true);
    setActionMessage(null);
    try {
      const claimsList = await fetchClaimsForCase(c.id);
      setClaims(claimsList);
    } catch (err) {
      console.error(err);
      setClaims([]);
    } finally {
      setLoadingClaims(false);
    }
  };

  const handleReviewClaim = async (claimId: number, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewClaimApi(claimId, status, reviewNotes || undefined);
      setActionMessage(`Claim ${status === "APPROVED" ? "approved" : "rejected"} successfully.`);
      setReviewNotes("");
      await loadData();
      if (selectedCase) {
        handleSelectCase(selectedCase);
      }
    } catch (err: any) {
      setActionMessage(err.message || "Failed to update claim.");
    }
  };

  const handleMarkRecovered = async (caseId: number) => {
    try {
      await updateCaseStatusApi(
        caseId,
        "RECOVERED",
        "Physical item handover completed at authorized station.",
        "AUTHORITY"
      );
      setActionMessage("Case successfully marked as RECOVERED.");
      await loadData();
      if (selectedCase) {
        setSelectedCase({ ...selectedCase, status: "RECOVERED" });
      }
    } catch (err: any) {
      setActionMessage(err.message || "Failed to update status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Organization Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Station & Authority Case Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review ownership claims, verify physical markings against private claimant records, and manage handovers.
          </p>
        </div>
      </div>

      {/* Hotspot & Environmental Analytics Summary (Section 30) */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Loss Landmarks */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Top Environmental Hotspots</span>
              </h3>
            </div>
            <div className="space-y-2">
              {analytics.top_locations.slice(0, 4).map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span className="text-slate-300 truncate max-w-[200px]">{loc.location}</span>
                  <span className="font-mono font-bold text-emerald-400">{loc.cases} cases</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terrain Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Terrain Distribution</span>
            </h3>
            <div className="space-y-2">
              {analytics.terrain_breakdown.slice(0, 4).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span className="text-slate-300">{t.terrain}</span>
                  <span className="font-mono font-bold text-blue-400">{t.cases} cases</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery Overview */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                System Recovery Velocity
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Persistent matching continuously surfaces correlations across historical reports.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Active Matches</span>
                <span className="block text-xl font-black text-purple-400">
                  {analytics.summary.active_potential_matches}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Recovered Items</span>
                <span className="block text-xl font-black text-emerald-400">
                  {analytics.summary.total_recovered}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Operational Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cases Selector List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Station Cases Queue ({cases.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCase(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-slate-800 border-emerald-500/50 shadow-md"
                      : "bg-slate-900/60 hover:bg-slate-900 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.case_type === "LOST"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {c.case_type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{c.case_number}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">{c.status}</span>
                  </div>

                  <h4 className="font-semibold text-xs text-slate-200 line-clamp-1">{c.title}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{c.location_name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Claim Review Queue & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCase ? (
            <div className="space-y-6">
              {/* Case Action Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-slate-500">Managing Case #{selectedCase.case_number}</span>
                    <h2 className="text-lg font-bold text-slate-100">{selectedCase.title}</h2>
                  </div>
                  <Link
                    href={`/cases/${selectedCase.id}`}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Public Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {actionMessage && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 text-xs">
                    {actionMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Current Status</span>
                    <span className="font-bold text-slate-200">{selectedCase.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Holding Place</span>
                    <span className="font-semibold text-blue-300">
                      {selectedCase.current_storage_place || "Unspecified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Handover Method</span>
                    <span className="font-semibold text-slate-300">
                      {selectedCase.handover_preference.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Mark as Recovered Button */}
                {selectedCase.status !== "RECOVERED" && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleMarkRecovered(selectedCase.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Physical Handover & Mark Recovered</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Ownership Claims Verification Section */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Submitted Ownership Claims ({claims.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Compare claimant's private evidence against physical item properties before authorizing release.
                    </p>
                  </div>
                </div>

                {loadingClaims ? (
                  <p className="text-xs text-slate-500">Loading claims...</p>
                ) : claims.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-500">
                    No ownership verification claims submitted yet for this item.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-200 text-sm">{claim.claimant_name}</span>
                            <span className="text-slate-400 text-xs ml-2">({claim.claimant_contact})</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              claim.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : claim.status === "REJECTED"
                                ? "bg-red-500/20 text-red-300 border-red-500/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            }`}
                          >
                            {claim.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Claimant Submitted Private Proof */}
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                            Claimant's Private Proof & Hidden Details:
                          </span>
                          <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                            {claim.claimant_evidence}
                          </p>
                        </div>

                        {claim.authority_notes && (
                          <div className="text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300">Station Reviewer Notes:</span>{" "}
                            {claim.authority_notes}
                          </div>
                        )}

                        {/* Claim action buttons */}
                        {claim.status === "PENDING_REVIEW" && (
                          <div className="pt-2 border-t border-slate-900 flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReviewClaim(claim.id, "REJECTED")}
                              className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject Proof</span>
                            </button>
                            <button
                              onClick={() => handleReviewClaim(claim.id, "APPROVED")}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Authorize Handover</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
              Select a case from the queue to review claims and status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
