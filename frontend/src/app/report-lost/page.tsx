"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCaseApi, requestSmartQuestions, uploadImageApi } from "@/lib/api";
import {
  Sparkles,
  TreePine,
  MapPin,
  Lock,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Compass,
  Upload,
  ImageIcon,
} from "lucide-react";

const CATEGORIES = [
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

export default function ReportLostPage() {
  const router = useRouter();

  // Smart question assistant state
  const [rawText, setRawText] = useState("");
  const [smartQuestions, setSmartQuestions] = useState<string[]>([]);
  const [analyzingSmart, setAnalyzingSmart] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Bags & Backpacks");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");

  // Physical Attributes
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [material, setMaterial] = useState("");
  const [permanentFeatures, setPermanentFeatures] = useState("");
  const [changeableFeatures, setChangeableFeatures] = useState("");

  // Nature Location
  const [locationName, setLocationName] = useState("");
  const [terrainType, setTerrainType] = useState("Trail / Route");
  const [radiusMeters, setRadiusMeters] = useState(250);
  const [routeNotes, setRouteNotes] = useState("");
  const [movementNotes, setMovementNotes] = useState("");

  // Time
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventTime, setEventTime] = useState("");

  // Private Vault
  const [serialImei, setSerialImei] = useState("");
  const [secretMarks, setSecretMarks] = useState("");
  const [knownContents, setKnownContents] = useState("");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadImageApi(file);
      setImages((prev) => [...prev, res.url]);
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAskSmartAssistant = async () => {
    if (!rawText.trim()) return;
    setAnalyzingSmart(true);
    try {
      const res = await requestSmartQuestions({
        raw_description: rawText,
        category: category,
        case_type: "LOST",
      });
      if (res.detected_category && res.detected_category !== "Other") {
        setCategory(res.detected_category);
      }
      setSmartQuestions(res.suggested_questions);
      if (!description) {
        setDescription(rawText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingSmart(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await createCaseApi({
        case_type: "LOST",
        title,
        category,
        description: description || rawText,
        urgency,
        brand: brand || undefined,
        model_name: modelName || undefined,
        primary_color: primaryColor || undefined,
        secondary_color: secondaryColor || undefined,
        material: material || undefined,
        permanent_features: permanentFeatures || undefined,
        changeable_features: changeableFeatures || undefined,
        images,
        location_name: locationName,
        terrain_type: terrainType,
        radius_meters: Number(radiusMeters),
        route_path_notes: routeNotes || undefined,
        movement_notes: movementNotes || undefined,
        event_date: eventDate,
        event_time_approx: eventTime || undefined,
        handover_preference: "AUTHORIZED_STATION",
        contact_preference: "PLATFORM_MEDIATED",
        contact_name: contactName || undefined,
        contact_email: contactEmail || undefined,
        private_serial_or_imei: serialImei || undefined,
        private_secret_marks: secretMarks || undefined,
        private_known_contents: knownContents || undefined,
      });

      router.push(`/cases/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create lost case.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Report a Lost Item</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          Create an Active Lost Case
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Our intelligent recovery engine continuously compares this profile against new and existing found reports.
        </p>
      </div>

      {/* Smart Questioning Interactive Assistant (Section 6 Feature 4 & Section 28) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              AI Smart Questioning Assistant
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Optional Assist</span>
        </div>

        <p className="text-xs text-slate-300">
          Not sure what details matter? Simply describe what happened in your own words, and the assistant will suggest high-value follow-up questions.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. Lost my navy blue backpack near the waterfall overlook on Saturday afternoon..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-purple-400 text-xs text-slate-200 outline-none"
          />
          <button
            type="button"
            onClick={handleAskSmartAssistant}
            disabled={analyzingSmart || !rawText.trim()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{analyzingSmart ? "Analyzing..." : "Ask Assistant"}</span>
          </button>
        </div>

        {smartQuestions.length > 0 && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-purple-800/40 space-y-2">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wide block">
              Helpful Details to Include Below:
            </span>
            <ul className="space-y-1.5">
              {smartQuestions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Basic Item Description */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Item Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Item Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Navy Blue Osprey Talon 22 Hiking Backpack"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-medium mb-1">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where and how the item was lost, overall visual appearance, and anything notable..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none leading-relaxed"
            ></textarea>
          </div>

          {/* Photo Upload (Optional) */}
          <div className="text-xs pt-2">
            <label className="block text-slate-300 font-medium mb-1">
              Photographs of Item (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                />
              </label>
              <span className="text-[11px] text-slate-500">
                Photo is optional. The engine adapts whether photo is present or text-only.
              </span>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40 bg-slate-950">
                    <img src={`http://127.0.0.1:8000${img}`} alt="Uploaded" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Physical Attributes (Permanent vs Changeable) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              2. Physical Characteristics
            </h2>
            <span className="text-[11px] text-slate-500">Separates permanent markers from changeable accessories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Osprey, Apple, Patagonia"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Model Name / Number</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. Talon 22, iPhone 15"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Primary Color</label>
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="e.g. Navy Blue, Black, Red"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-amber-300 font-medium mb-1">
                Permanent Features & Wear (Scratches, tears, structural marks)
              </label>
              <textarea
                rows={2}
                value={permanentFeatures}
                onChange={(e) => setPermanentFeatures(e.target.value)}
                placeholder="e.g. 2-inch tape repair patch near bottom seam; scratch on top right bezel..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-cyan-300 font-medium mb-1">
                Changeable Features (Cases, stickers, attached keychains)
              </label>
              <textarea
                rows={2}
                value={changeableFeatures}
                onChange={(e) => setChangeableFeatures(e.target.value)}
                placeholder="e.g. Green climbing carabiner on top haul loop; matte black protective case..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 3: Nature Location Context & Item Drift (Section 13 & 14) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              3. Nature & Environmental Location
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Location Landmark / Sector <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Cascade Falls Scenic Overlook, Blue Mountain Trail"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Terrain Type</label>
              <select
                value={terrainType}
                onChange={(e) => setTerrainType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              >
                {TERRAINS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Route / Path Specifics</label>
              <input
                type="text"
                value={routeNotes}
                onChange={(e) => setRouteNotes(e.target.value)}
                placeholder="e.g. Between 2nd scenic viewpoint and wooden river footbridge"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Plausible Environmental Movement Notes</label>
              <input
                type="text"
                value={movementNotes}
                onChange={(e) => setMovementNotes(e.target.value)}
                placeholder="e.g. Downhill slope towards creek, river flow down stream, or carried by hiker"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div>
              <label className="block text-slate-400 mb-1">Date Lost</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Approximate Time</label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. Around 14:30"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Private Ownership Verification Vault (Section 16 & 19) */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              4. Private Ownership Verification Vault
            </h2>
          </div>

          <p className="text-xs text-slate-400">
            These fields are kept confidential and are <span className="text-emerald-300 font-semibold">NEVER</span> exposed in the public listing. When a match is found, authorized station personnel use these secret facts to verify ownership before physical handover.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Serial Number or IMEI (Optional)
              </label>
              <input
                type="text"
                value={serialImei}
                onChange={(e) => setSerialImei(e.target.value)}
                placeholder="e.g. 354892019382109"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Hidden Secret Mark or Engraving
              </label>
              <input
                type="text"
                value={secretMarks}
                onChange={(e) => setSecretMarks(e.target.value)}
                placeholder="e.g. Initial 'AT' written in black marker inside hydration sleeve"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-medium mb-1">
              Known Secret Internal Contents
            </label>
            <input
              type="text"
              value={knownContents}
              onChange={(e) => setKnownContents(e.target.value)}
              placeholder="e.g. Field notebook with green cover and small brass compass inside front pocket"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Section 5: Reporter Contact */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            5. Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Alex Turner"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Email for Notifications</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="alex.turner@example.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 transition shadow-xl shadow-emerald-950 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? "Creating Case & Indexing..." : "Submit Lost Case & Activate Search"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
