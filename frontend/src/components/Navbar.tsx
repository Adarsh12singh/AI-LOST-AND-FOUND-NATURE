import Link from "next/link";
import { Compass, Search, PlusCircle, ShieldCheck, TreePine } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-emerald-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600/30 transition shadow-inner">
              <TreePine className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-1.5 text-slate-100 group-hover:text-emerald-400 transition">
                <span>AI LOST AND FOUND</span>
                <span className="text-emerald-400 font-black">NATURE</span>
              </div>
              <p className="text-[10px] text-emerald-400/80 tracking-wider uppercase font-medium">
                Lost shouldn't mean gone.
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/cases"
              className="text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-emerald-500" />
              <span>Explore Cases</span>
            </Link>
            <Link
              href="/authority"
              className="text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Authority & Stations</span>
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/report-lost"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </Link>

            <Link
              href="/report-found"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center gap-1.5 shadow-sm shadow-emerald-950"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Report Found</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
