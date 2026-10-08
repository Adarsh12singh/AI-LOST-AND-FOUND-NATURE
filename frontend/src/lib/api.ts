export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface TimelineEvent {
  id: number;
  case_id: number;
  actor: "SYSTEM" | "OWNER" | "FINDER" | "AUTHORITY";
  action: string;
  headline: string;
  details?: string;
  timestamp: string;
}

export interface Case {
  id: number;
  case_number: string;
  case_type: "LOST" | "FOUND";
  title: string;
  category: string;
  description: string;
  status: string;
  urgency: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  brand?: string;
  model_name?: string;
  primary_color?: string;
  secondary_color?: string;
  material?: string;
  permanent_features?: string;
  changeable_features?: string;
  dynamic_attributes?: Record<string, any>;
  images?: string[];
  location_name: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
  terrain_type: string;
  route_path_notes?: string;
  movement_notes?: string;
  event_date: string;
  event_time_approx?: string;
  current_storage_place?: string;
  handover_preference: string;
  contact_preference: string;
  is_suspicious_or_theft: boolean;
  theft_authority_notes?: string;
  created_at: string;
  updated_at: string;
  timeline_events: TimelineEvent[];
  has_serial_number?: boolean;
  has_secret_marks?: boolean;
  has_known_contents?: boolean;
  claims_count?: number;
}

export interface PotentialMatch {
  match_id: number;
  overall_score: number;
  confidence: "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  status: "SUGGESTED" | "REVIEWING" | "VERIFIED" | "DISMISSED";
  score_breakdown: Record<string, number>;
  evidence_explanation: string[];
  created_at: string;
  counterpart: {
    id: number;
    case_number: string;
    case_type: "LOST" | "FOUND";
    title: string;
    category: string;
    location_name: string;
    event_date: string;
    images: string[];
    current_storage_place?: string;
  };
}

export interface OwnershipClaim {
  id: number;
  found_case_id: number;
  lost_case_id?: number;
  claimant_name: string;
  claimant_contact: string;
  claimant_evidence: string;
  claimant_attachments: string[];
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ADDITIONAL_INFO_NEEDED";
  authority_notes?: string;
  created_at: string;
}

export interface HotspotAnalytics {
  summary: {
    total_lost: number;
    total_found: number;
    total_recovered: number;
    active_potential_matches: number;
  };
  top_locations: { location: string; cases: number }[];
  terrain_breakdown: { terrain: string; cases: number }[];
}

export async function fetchCases(params: {
  case_type?: string;
  category?: string;
  status?: string;
  terrain_type?: string;
  q?: string;
} = {}): Promise<Case[]> {
  const query = new URLSearchParams();
  if (params.case_type) query.set("case_type", params.case_type);
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.terrain_type) query.set("terrain_type", params.terrain_type);
  if (params.q) query.set("q", params.q);

  const res = await fetch(`${API_BASE_URL}/cases/?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch cases");
  return res.json();
}

export async function fetchCaseById(id: string | number): Promise<Case> {
  const res = await fetch(`${API_BASE_URL}/cases/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Case not found");
  return res.json();
}

export async function createCaseApi(payload: any): Promise<Case> {
  const res = await fetch(`${API_BASE_URL}/cases/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create case" }));
    throw new Error(error.detail || "Failed to create case");
  }
  return res.json();
}

export async function updateCaseStatusApi(id: number, status: string, notes?: string, actor = "SYSTEM"): Promise<Case> {
  const query = new URLSearchParams({ status, actor });
  if (notes) query.set("notes", notes);
  const res = await fetch(`${API_BASE_URL}/cases/${id}/status?${query.toString()}`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function fetchMatchesForCase(id: string | number): Promise<PotentialMatch[]> {
  const res = await fetch(`${API_BASE_URL}/matches/case/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function triggerPersistentRematch(id: string | number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/matches/rematch/${id}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger rematch");
  return res.json();
}

export async function fetchHotspotAnalytics(): Promise<HotspotAnalytics> {
  const res = await fetch(`${API_BASE_URL}/cases/analytics/hotspots`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function submitClaimApi(payload: {
  found_case_id: number;
  lost_case_id?: number;
  claimant_name: string;
  claimant_contact: string;
  claimant_evidence: string;
  claimant_attachments?: string[];
}): Promise<OwnershipClaim> {
  const res = await fetch(`${API_BASE_URL}/verification/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to submit claim" }));
    throw new Error(err.detail || "Failed to submit claim");
  }
  return res.json();
}

export async function fetchClaimsForCase(caseId: number): Promise<OwnershipClaim[]> {
  const res = await fetch(`${API_BASE_URL}/verification/claims/case/${caseId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch claims");
  return res.json();
}

export async function reviewClaimApi(claimId: number, status: string, authorityNotes?: string): Promise<OwnershipClaim> {
  const res = await fetch(`${API_BASE_URL}/verification/claims/${claimId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, authority_notes: authorityNotes }),
  });
  if (!res.ok) throw new Error("Failed to review claim");
  return res.json();
}

export async function requestSmartQuestions(payload: {
  raw_description: string;
  category?: string;
  case_type?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/questions/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
}

export async function uploadImageApi(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image upload failed");
  return res.json();
}
