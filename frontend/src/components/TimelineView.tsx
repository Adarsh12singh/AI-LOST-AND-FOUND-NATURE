import { TimelineEvent } from "@/lib/api";
import { CheckCircle2, Clock, User, Shield, Sparkles, FileText, ArrowRight } from "lucide-react";

interface TimelineViewProps {
  events: TimelineEvent[];
}

export default function TimelineView({ events }: TimelineViewProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm bg-slate-900/40 rounded-xl border border-slate-800">
        No timeline events recorded yet.
      </div>
    );
  }

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "AUTHORITY":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-medium">
            <Shield className="w-3 h-3 text-blue-400" /> Station Authority
          </span>
        );
      case "OWNER":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-medium">
            <User className="w-3 h-3 text-rose-400" /> Case Reporter
          </span>
        );
      case "FINDER":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
            <User className="w-3 h-3 text-emerald-400" /> Finder
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Automated System
          </span>
        );
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("MATCH")) return <Sparkles className="w-4 h-4 text-purple-400" />;
    if (action.includes("VERIFICATION") || action.includes("APPROVED")) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (action.includes("CREATED")) return <FileText className="w-4 h-4 text-blue-400" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events.map((ev) => {
        const dateStr = new Date(ev.timestamp).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={ev.id} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center -translate-x-1/2 shadow-sm shadow-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            </div>

            <div className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl p-4 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {getActionIcon(ev.action)}
                  <h4 className="text-sm font-semibold text-slate-200">
                    {ev.headline}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {getActorBadge(ev.actor)}
                  <span className="text-[11px] font-mono text-slate-500">{dateStr}</span>
                </div>
              </div>

              {ev.details && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed pl-6">
                  {ev.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
