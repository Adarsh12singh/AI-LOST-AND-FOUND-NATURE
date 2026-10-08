"use client";

import { useState } from "react";
import { submitClaimApi } from "@/lib/api";
import { ShieldCheck, X, AlertCircle, Lock, CheckCircle2 } from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  foundCaseId: number;
  lostCaseId?: number;
  onClaimSubmitted?: () => void;
}

export default function VerificationModal({
  isOpen,
  onClose,
  foundCaseId,
  lostCaseId,
  onClaimSubmitted,
}: VerificationModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [evidence, setEvidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitClaimApi({
        found_case_id: foundCaseId,
        lost_case_id: lostCaseId,
        claimant_name: name,
        claimant_contact: contact,
        claimant_evidence: evidence,
      });
      setSuccess(true);
      if (onClaimSubmitted) onClaimSubmitted();
    } catch (err: any) {
      setError(err.message || "Failed to submit ownership claim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Ownership Verification Claim</h3>
            <p className="text-xs text-slate-400">
              Provide private identifying details not publicly disclosed.
            </p>
          </div>
        </div>

        {/* Warning info box */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-300">Privacy & Security Guarantee:</span> Your answers are stored securely and only accessible by authorized park/station officials who verify physical property before safe handover.
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-lg text-emerald-300">Claim Submitted for Verification!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              The station authority has been notified. Your submitted proof will be verified against the physical item's hidden characteristics.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Turner"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Contact (Email or Phone)</label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="alex.turner@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Private Ownership Proof & Secret Identifying Marks
              </label>
              <textarea
                required
                rows={4}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Describe hidden scratches, internal contents, serial number / IMEI, wallpaper details, engraved initials, or distinctive wear that would not be known by an unauthorized claimant..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950"
              >
                {loading ? "Submitting Claim..." : "Submit Claim for Authority Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
