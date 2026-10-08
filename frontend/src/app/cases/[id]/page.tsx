"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Case,
  PotentialMatch,
  OwnershipClaim,
  fetchCaseById,
  fetchMatchesForCase,
  fetchClaimsForCase,
  reviewClaimApi,
  triggerPersistentRematch,
  updateCaseStatusApi,
} from "@/lib/api";
import TimelineView from "@/components/TimelineView";
import MatchExplanation from "@/components/MatchExplanation";
import VerificationModal from "@/components/VerificationModal";
import {
  MapPin,
  Calendar,
  Compass,
  Building2,
  Lock,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Layers,
  AlertTriangle,
  XCircle,
  PartyPopper,
  User,
  Image as ImageIcon,
} from "lucide-react";

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params?.id as string;

  const [item, setItem] = useState<Case | null>(null);
  const [matches, setMatches] = useState<PotentialMatch[]>([]);
  const [claims, setClaims] = useState<OwnershipClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [rematching, setRematching] = useState(false);
  const [rematchMessage, setRematchMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [targetFoundCaseId, setTargetFoundCaseId] = useState<number | null>(null);

  const loadCase = async () => {
    try {
      const [caseData, matchData] = await Promise.all([
        fetchCaseById(caseId),
        fetchMatchesForCase(caseId),
      ]);
      setItem(caseData);
      setMatches(matchData);

      // If this is a found case, also fetch submitted ownership claims
      if (caseData.case_type === "FOUND") {
        const claimsList = await fetchClaimsForCase(caseData.id).catch(() => []);
        setClaims(claimsList);
      }
    } catch (err) {
      console.error("Error loading case", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) loadCase();
  }, [caseId]);

  const handleRematch = async () => {
    setRematching(true);
    setRematchMessage(null);
    try {
      const res = await triggerPersistentRematch(caseId);
      setRematchMessage(res.message);
      await loadCase();
    } catch (err) {
      setRematchMessage("Failed to execute re-matching.");
    } finally {
      setRematching(false);
    }
  };

  const handleReviewClaim = async (claimId: number, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewClaimApi(claimId, status, "Verified directly by finder/owner on case portal.");
      setActionMessage(`Ownership claim was ${status === "APPROVED" ? "approved" : "rejected"}!`);
      await loadCase();
    } catch (err: any) {
      setActionMessage(err.message || "Failed to update claim.");
    }
  };

  const handleMarkRecovered = async () => {
    if (!item) return;
    try {
      await updateCaseStatusApi(
        item.id,
        "RECOVERED",
        "Item successfully handed over and returned to rightful owner.",
        item.case_type === "LOST" ? "OWNER" : "FINDER"
      );
      setActionMessage("Success! Item marked as officially RECOVERED!");
      await loadCase();
    } catch (err: any) {
      setActionMessage(err.message || "Failed to mark as recovered.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-400">Loading case profile and persistent signals...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Case Not Found</h2>
        <p className="text-xs text-slate-400">The requested case could not be located in the database.</p>
        <Link href="/cases" className="text-xs text-emerald-400 underline">
          Return to Case Explorer
        </Link>
      </div>
    );
  }

  const isLost = item.case_type === "LOST";
  const isRecovered = item.status === "RECOVERED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button and case header */}
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Case Explorer</span>
        </Link>

        {/* Recovered Celebration Banner */}
        {isRecovered && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PartyPopper className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-bold text-emerald-300 text-sm">Case Solved & Item Recovered!</h3>
                <p className="text-xs text-slate-300">
                  This item has been safely returned to its rightful owner. Real-world recovery completed!
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              RECOVERED
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                  isLost
                    ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {item.case_type} REPORT
              </span>
              <span className="text-sm font-mono text-slate-400 font-semibold">
                {item.case_number}
              </span>
              {item.urgency === "URGENT" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700/60 uppercase">
                  Urgent
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{item.location_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.event_date} {item.event_time_approx ? `(${item.event_time_approx})` : ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terrain: {item.terrain_type}</span>
              </div>
            </div>
          </div>

          {/* Status Badge & Recovery Action Button */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium block md:text-right">Case Status</span>
              <div className="px-4 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{item.status.replace(/_/g, " ")}</span>
              </div>
            </div>

            {/* Quick Handover button for verified or in-progress cases */}
            {!isRecovered && (item.status === "MATCH_CONFIRMED" || item.status === "VERIFICATION_IN_PROGRESS" || item.status === "POTENTIAL_MATCH") && (
              <button
                onClick={handleMarkRecovered}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-950 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Handover & Mark Recovered</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Column Profile & Right Column Matching + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Item Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* General Description */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Item Profile & Description</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>

            {/* Key Physical Attributes */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Category</span>
                <span className="font-semibold text-slate-200">{item.category}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Brand</span>
                <span className="font-semibold text-slate-200">{item.brand || "Unspecified"}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Model</span>
                <span className="font-semibold text-slate-200">{item.model_name || "Unspecified"}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Primary Color</span>
                <span className="font-semibold text-slate-200">{item.primary_color || "Unspecified"}</span>
              </div>
            </div>
          </div>

          {/* Permanent vs Changeable Characteristics (Section 12) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Distinctive Characteristics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block mb-1">
                  Permanent / Structural Wear
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {item.permanent_features || "None specifically recorded."}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400 block mb-1">
                  Changeable Accessories / Stickers
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {item.changeable_features || "None specifically recorded."}
                </p>
              </div>
            </div>
          </div>

          {/* Environmental & Nature Context (Section 13 & 14) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Environmental & Terrain Context</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Terrain Type</span>
                <span className="font-semibold text-emerald-300">{item.terrain_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Approx Search Radius</span>
                <span className="font-semibold text-slate-300">{item.radius_meters || 200} meters</span>
              </div>
              {item.route_path_notes && (
                <div className="py-1">
                  <span className="text-slate-500 block text-[11px] mb-0.5">Route / Trail Alignment:</span>
                  <p className="text-slate-300 leading-relaxed">{item.route_path_notes}</p>
                </div>
              )}
              {item.movement_notes && (
                <div className="py-1">
                  <span className="text-slate-500 block text-[11px] mb-0.5">Potential Environmental Drift:</span>
                  <p className="text-slate-300 leading-relaxed">{item.movement_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Safe Holding Storage & Handover Preferences */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Safe Storage & Handover</span>
            </h3>

            {item.current_storage_place ? (
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/40 text-blue-200">
                <span className="font-semibold block text-[11px] text-blue-300">Holding Facility / Status:</span>
                {item.current_storage_place}
              </div>
            ) : (
              <p className="text-slate-400">Handover Preference: <span className="text-slate-200 font-medium">{item.handover_preference.replace(/_/g, " ")}</span></p>
            )}
            <p className="text-slate-400 text-[11px]">
              Contact Method: <span className="text-slate-200">{item.contact_preference.replace(/_/g, " ")}</span> (Platform-Mediated Privacy)
            </p>
          </div>

          {/* Private Verification Vault Status (Section 19) */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Private Verification Vault</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Identifying proofs are encrypted and masked from public listings to defend against false claims.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
              {item.has_serial_number && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ✓ Serial / IMEI On File
                </span>
              )}
              {item.has_secret_marks && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ✓ Secret Marks On File
                </span>
              )}
              {item.has_known_contents && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ✓ Known Contents On File
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Persistent Matching Engine & Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section: If this is a FOUND case and has submitted claims, show Finder Claims Queue */}
          {!isLost && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Submitted Ownership Claims ({claims.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Review what the claimant submitted. Compare their hidden details with the physical item in your hands.
                  </p>
                </div>
              </div>

              {claims.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-500 text-center">
                  No claims submitted for this found item yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-200 text-sm">{claim.claimant_name}</span>
                          <span className="text-slate-400 text-xs ml-2 font-mono">({claim.claimant_contact})</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
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

                      {/* Secret Proof Provided */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                          Claimant's Private Proof & Hidden Markings:
                        </span>
                        <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                          {claim.claimant_evidence}
                        </p>
                      </div>

                      {claim.status === "PENDING_REVIEW" && (
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReviewClaim(claim.id, "REJECTED")}
                            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleReviewClaim(claim.id, "APPROVED")}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Ownership & Authorize Handover</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Persistent Matches */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Persistent Matching Engine</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Candidate reports evaluated across category, attributes, location, and time.
                </p>
              </div>

              <button
                onClick={handleRematch}
                disabled={rematching}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${rematching ? "animate-spin" : ""}`} />
                <span>{rematching ? "Re-Matching..." : "Re-Check All Cases"}</span>
              </button>
            </div>

            {rematchMessage && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                {rematchMessage}
              </div>
            )}

            {matches.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No Candidate Match Found Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  This case remains active in persistent search. When another report matching these attributes arrives, the system will automatically re-evaluate and notify the case.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <MatchExplanation
                    key={m.match_id}
                    match={m}
                    currentCaseType={item.case_type}
                    onOpenVerification={(foundId) => {
                      setTargetFoundCaseId(foundId);
                      setIsVerificationOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section: Immutable Case Timeline Audit Log (Section 24) */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Case Event Timeline & Audit Log</span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete chronological sequence of all report activities, evaluations, and verifications.
              </p>
            </div>

            <TimelineView events={item.timeline_events} />
          </div>
        </div>
      </div>

      {/* Ownership Verification Claim Modal */}
      {targetFoundCaseId && (
        <VerificationModal
          isOpen={isVerificationOpen}
          onClose={() => setIsVerificationOpen(false)}
          foundCaseId={targetFoundCaseId}
          lostCaseId={isLost ? item.id : undefined}
          onClaimSubmitted={() => {
            loadCase();
          }}
        />
      )}
    </div>
  );
}
