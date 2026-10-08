import Link from "next/link";
import { Case } from "@/lib/api";
import { MapPin, Calendar, Compass, ShieldAlert, Sparkles, Building2 } from "lucide-react";

interface CaseCardProps {
  item: Case;
}

export default function CaseCard({ item }: CaseCardProps) {
  const isLost = item.case_type === "LOST";

  // Status colors
  const statusStyles: Record<string, string> = {
    SEARCHING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    STORED_WAITING_CLAIM: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    POTENTIAL_MATCH: "bg-purple-500/10 text-purple-300 border-purple-500/30 font-semibold animate-pulse",
    VERIFICATION_IN_PROGRESS: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    MATCH_CONFIRMED: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    RECOVERY_IN_PROGRESS: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    RECOVERED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold",
    CLOSED: "bg-slate-700/20 text-slate-400 border-slate-700/40",
  };

  const statusLabel: Record<string, string> = {
    SEARCHING: "Actively Searching",
    STORED_WAITING_CLAIM: "Safely Stored (Awaiting Claim)",
    POTENTIAL_MATCH: "Potential Match Detected",
    VERIFICATION_IN_PROGRESS: "Verification in Progress",
    MATCH_CONFIRMED: "Ownership Verified",
    RECOVERY_IN_PROGRESS: "Handover in Progress",
    RECOVERED: "Item Recovered",
    CLOSED: "Case Closed",
  };

  return (
    <Link
      href={`/cases/${item.id}`}
      className="group block rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-200 overflow-hidden shadow-lg shadow-black/30 hover:shadow-emerald-950/20"
    >
      <div className="p-5 flex flex-col justify-between h-full">
        <div>
          {/* Top badges bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  isLost
                    ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {item.case_type}
              </span>
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-300">
                {item.case_number}
              </span>
            </div>

            {item.urgency === "URGENT" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700/60 uppercase">
                Urgent
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-100 text-base group-hover:text-emerald-300 transition line-clamp-1 mb-1">
            {item.title}
          </h3>

          {/* Category & Terrain badge */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
              {item.category}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-400" />
              {item.terrain_type}
            </span>
          </div>

          {/* Short description */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div>
          {/* Location & Time info */}
          <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-3">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{item.location_name}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.event_date}</span>
              </div>
              {item.current_storage_place && (
                <div className="flex items-center gap-1 text-slate-400 truncate max-w-[150px]">
                  <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{item.current_storage_place}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status pill bottom */}
          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                statusStyles[item.status] || "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {item.status === "POTENTIAL_MATCH" && <Sparkles className="w-3 h-3 text-purple-300" />}
              {statusLabel[item.status] || item.status}
            </span>

            <span className="text-xs font-medium text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              View Profile →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
