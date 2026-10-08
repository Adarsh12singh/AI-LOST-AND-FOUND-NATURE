import Link from "next/link";
import { TreePine, Shield, RefreshCw, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <TreePine className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-slate-200 text-sm tracking-wide">
                AI LOST AND FOUND NATURE
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              A real-world Lost, Found & Recovery platform designed for the outdoors and physical environments.
              Powered by persistent historical matching, environmental context, and privacy-first ownership verification.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] pt-1">
              <span>● Persistent Case Engine Active</span>
              <span className="text-slate-600">|</span>
              <span>● Nature Context Enabled</span>
            </div>
          </div>

          {/* Core Principles */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Platform Workflow
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Persistent Re-Matching</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Terrain & Environmental Drift</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Private Ownership Verification</span>
              </li>
            </ul>
          </div>

          {/* Environments */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Environments Supported
            </h4>
            <p className="text-slate-400 leading-normal">
              Forests, Hiking Trails, Mountain Peaks, Waterfalls, River Corridors, Coastal Areas, Campsites, Parks, and Rural/Urban Outdoor Commons.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} AI LOST AND FOUND NATURE. Built for real-world environmental recovery.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-emerald-400 font-medium">Lost shouldn't mean gone.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
