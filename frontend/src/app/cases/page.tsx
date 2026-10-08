"use client";

import { useEffect, useState } from "react";
import { Case, fetchCases } from "@/lib/api";
import CaseCard from "@/components/CaseCard";
import { Search, Filter, Compass, PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "All Categories",
  "Bags & Backpacks",
  "Mobile phones",
  "Wallets",
  "Keys",
  "Watches",
  "Electronics",
  "Cameras",
  "Jewelry",
  "Documents",
  "Clothing",
  "Bicycles",
  "Personal belongings",
  "Other",
];

const TERRAINS = [
  "All Terrains",
  "Trail / Route",
  "Forest / Woods",
  "Mountain / Peak",
  "Waterfall / River",
  "Beach / Coastal",
  "Campsite",
  "Park / Green Space",
  "Village / Rural",
  "Urban Outdoor",
  "Other",
];

export default function CasesExplorerPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [caseType, setCaseType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [terrain, setTerrain] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCases({
        case_type: caseType || undefined,
        category: category && category !== "All Categories" ? category : undefined,
        terrain_type: terrain && terrain !== "All Terrains" ? terrain : undefined,
        q: searchTerm || undefined,
      });
      setCases(data);
    } catch (err) {
      console.error("Failed to load cases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, caseType, category, terrain]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Case Directory & Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, filter, and review active reports across outdoor environments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/report-lost"
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </Link>
          <Link
            href="/report-found"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-emerald-950"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, title, location, brand, or case number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-300 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c === "All Categories" ? "" : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Terrain Filter */}
          <div>
            <select
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-300 outline-none"
            >
              {TERRAINS.map((t) => (
                <option key={t} value={t === "All Terrains" ? "" : t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary filters row (Type pills + reset) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Type:</span>
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
              <button
                onClick={() => setCaseType("")}
                className={`px-2.5 py-1 rounded-md transition ${
                  caseType === "" ? "bg-slate-800 text-slate-100 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCaseType("LOST")}
                className={`px-2.5 py-1 rounded-md transition ${
                  caseType === "LOST" ? "bg-rose-500/20 text-rose-300 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Lost Items
              </button>
              <button
                onClick={() => setCaseType("FOUND")}
                className={`px-2.5 py-1 rounded-md transition ${
                  caseType === "FOUND" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Found Items
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs">
              Showing <span className="font-bold text-slate-200">{cases.length}</span> cases
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setCaseType("");
                setCategory("");
                setTerrain("");
              }}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
            ></div>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <p className="text-slate-300 text-sm font-semibold">No cases match your filters.</p>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Try adjusting search terms, or check back later as new lost and found reports are recorded continuously.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <CaseCard key={c.id} item={c} />
          ))}
        </div>
      )}
    </div>
  );
}
