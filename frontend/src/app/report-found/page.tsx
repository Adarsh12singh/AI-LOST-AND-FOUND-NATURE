"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCaseApi, uploadImageApi } from "@/lib/api";
import {
  Compass,
  Building2,
  TreePine,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
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

export default function ReportFoundPage() {
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Bags & Backpacks");
  const [description, setDescription] = useState("");

  // Physical Attributes
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [material, setMaterial] = useState("");
  const [permanentFeatures, setPermanentFeatures] = useState("");
  const [changeableFeatures, setChangeableFeatures] = useState("");

  // Environmental Location
  const [locationName, setLocationName] = useState("");
  const [terrainType, setTerrainType] = useState("Trail / Route");
  const [radiusMeters, setRadiusMeters] = useState(150);
  const [routeNotes, setRouteNotes] = useState("");

  // Time
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventTime, setEventTime] = useState("");

  // Safe Storage & Handover
  const [currentStoragePlace, setCurrentStoragePlace] = useState("");
  const [handoverPreference, setHandoverPreference] = useState("AUTHORIZED_STATION");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await createCaseApi({
        case_type: "FOUND",
        title,
        category,
        description,
        urgency: "NORMAL",
        brand: brand || undefined,
        model_name: modelName || undefined,
        primary_color: primaryColor || undefined,
        material: material || undefined,
        permanent_features: permanentFeatures || undefined,
        changeable_features: changeableFeatures || undefined,
        images,
        location_name: locationName,
        terrain_type: terrainType,
        radius_meters: Number(radiusMeters),
        route_path_notes: routeNotes || undefined,
        event_date: eventDate,
        event_time_approx: eventTime || undefined,
        current_storage_place: currentStoragePlace || "Held safely by finder awaiting verification",
        handover_preference: handoverPreference,
        contact_preference: "PLATFORM_MEDIATED",
        contact_name: contactName || undefined,
        contact_email: contactEmail || undefined,
      });

      router.push(`/cases/${created.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create found report.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Report a Found Item</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          Register a Discovered Belonging
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Thank you for helping recover an item. Your report will be evaluated against active historical lost cases automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Overview */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. What Did You Find?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Item Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Navy Blue Hiking Pack found near river crossing"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Category <span className="text-emerald-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
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
              General Description <span className="text-emerald-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, where it was resting, visible marks without revealing secret contents..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none leading-relaxed"
            ></textarea>
          </div>

          {/* Photo Upload (Optional) */}
          <div className="text-xs pt-2">
            <label className="block text-slate-300 font-medium mb-1">
              Photograph of Discovered Item (Optional)
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
                Photo is optional. Protects privacy if item has sensitive display.
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

        {/* Section 2: Visible Attributes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            2. Visible Characteristics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Visible Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Osprey, Apple"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Model Name</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. Talon, iPhone"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Primary Color</label>
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="e.g. Navy, Black"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-300 mb-1">
                Visible Physical Damage or Permanent Wear
              </label>
              <textarea
                rows={2}
                value={permanentFeatures}
                onChange={(e) => setPermanentFeatures(e.target.value)}
                placeholder="e.g. Tape patch on bottom fabric; cracked screen corner..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Attached Accessories or Stickers
              </label>
              <textarea
                rows={2}
                value={changeableFeatures}
                onChange={(e) => setChangeableFeatures(e.target.value)}
                placeholder="e.g. Green carabiner clipped to strap; sticker on back..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 3: Environmental Location Discovered */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              3. Where Was It Discovered?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Location Landmark / Sector <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Cascade Falls Lower River Footbridge"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Date Discovered</label>
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
                placeholder="e.g. 16:15"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Safe Storage & Handover Preferences (Section 9 & 20) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              4. Safe Storage & Handover
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Where is the Item Currently Held?
              </label>
              <input
                type="text"
                value={currentStoragePlace}
                onChange={(e) => setCurrentStoragePlace(e.target.value)}
                placeholder="e.g. Blue Mountain Ranger Station Locker #10, or with finder"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Preferred Handover Method
              </label>
              <select
                value={handoverPreference}
                onChange={(e) => setHandoverPreference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none"
              >
                <option value="AUTHORIZED_STATION">Handover via Authorized Park / Ranger Station</option>
                <option value="PUBLIC_MEETING_POINT">Safe Public Meeting Point</option>
                <option value="VERIFIED_PICKUP">Verified Direct Pickup</option>
                <option value="SECURE_DELIVERY">Secure Postal Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 transition shadow-xl shadow-emerald-950 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{submitting ? "Registering & Running Re-Match..." : "Register Found Item & Check Lost Cases"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
