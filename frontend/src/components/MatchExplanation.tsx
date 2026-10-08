import Link from "next/link";
import { PotentialMatch } from "@/lib/api";
import { Sparkles, CheckCircle, ArrowRight, ShieldCheck, MapPin, Calendar, Building2 } from "lucide-react";

interface MatchExplanationProps {
  match: PotentialMatch;
  currentCaseType: "LOST" | "FOUND";
  onOpenVerification?: (foundCaseId: number) => void;
}

export default function MatchExplanation({ match, currentCaseType, onOpenVerification }: MatchExplanationProps) {
  const counterpart = match.counterpart;

  const confidenceStyles = {
    VERY_HIGH: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    HIGH: "bg-teal-500/15 text-teal-300 border-teal-500/40",
    MEDIUM: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    LOW: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    VERY_LOW: "bg-slate-700/20 text-slate-400 border-slate-700/40",
  }[match.confidence];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-purple-500/30 p-5 shadow-xl shadow-purple-950/20">
      {/* Header with Score and Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">
                Potential Match with {counterpart.case_type} Case #{counterpart.case_number}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${confidenceStyles}`}>
                {match.confidence.replace("_", " ")} CONFIDENCE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-signal compatibility score: <span className="font-bold text-purple-300">{match.overall_score}%</span>
            </p>
          </div>
        </div>

        {/* Action Button: Verify Ownership */}
        {currentCaseType === "LOST" && onOpenVerification && (
          <button
            onClick={() => onOpenVerification(counterpart.id)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Ownership to Claim</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* Counterpart Card Preview */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Counterpart Report Preview
          </div>
          <h4 className="font-semibold text-slate-200 text-sm mb-2">{counterpart.title}</h4>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{counterpart.location_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Reported Date: {counterpart.event_date}</span>
            </div>
            {counterpart.current_storage_place && (
              <div className="flex items-center gap-2 text-blue-300">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Safely held at: {counterpart.current_storage_place}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-900 flex justify-end">
            <Link
              href={`/cases/${counterpart.id}`}
              className="text-xs text-purple-300 hover:text-purple-200 font-medium flex items-center gap-1"
            >
              <span>View full counterpart case</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Explainable Evidence Section (Section 6 Feature 6) */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          <div className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why This May Be The Same Item</span>
          </div>
          <ul className="space-y-2">
            {match.evidence_explanation.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
