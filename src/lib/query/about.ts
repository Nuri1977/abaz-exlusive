import api from "@/lib/axios";
import type { SerializedEditorState } from "lexical";

// Type guard to ensure payload is a Lexical SerializedEditorState
function isSerializedEditorState(value: unknown): value is SerializedEditorState {
  return !!value && typeof value === "object" && "root" in (value as Record<string, unknown>);
}

// Fetch About Us (admin)
// Admin editor should read via the admin-protected endpoint.
export const fetchAboutUs = async (): Promise<SerializedEditorState | null> => {
  const response = await api.get<{ data: SerializedEditorState | null }>("/admin/about");
  // Be defensive: support either { data: X } or X directly
  const candidate = (response as any)?.data;
  const payload = (candidate && "data" in candidate
    ? (candidate as any).data
    : candidate) as SerializedEditorState | null;
  if (payload === null) return null;
  return isSerializedEditorState(payload) ? payload : null;
};

// Update About Us (admin)
export const updateAboutUs = async (
  aboutUs: SerializedEditorState | null
): Promise<SerializedEditorState | null> => {
  const response = await api.put<{ aboutUs: SerializedEditorState | null }>(
    "/admin/about",
    { aboutUs }
  );
  const payload = response?.data?.aboutUs ?? null;
  if (payload === null) return null;
  return isSerializedEditorState(payload) ? payload : null;
};

// Fetch About Us (public)
export const fetchAboutUsPublic = async (): Promise<SerializedEditorState | null> => {
  const response = await api.get<{ data: SerializedEditorState | null }>("/about");
  const candidate = (response as any)?.data;
  const payload = (candidate && "data" in candidate
    ? (candidate as any).data
    : candidate) as SerializedEditorState | null;
  if (payload === null) return null;
  return isSerializedEditorState(payload) ? payload : null;
};

