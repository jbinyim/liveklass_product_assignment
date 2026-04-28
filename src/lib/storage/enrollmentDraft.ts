import type { EnrollmentDefaults } from "@/app/(enroll)/_shared/defaults";

export const DRAFT_KEY = "livclass:enrollment-draft:v1";
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

type DraftPayload = Omit<EnrollmentDefaults, "agreedToTerms">;

interface StoredDraft {
  savedAt: number;
  data: DraftPayload;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveDraft(form: EnrollmentDefaults): void {
  const storage = getStorage();
  if (!storage) return;

  const { agreedToTerms: _omit, ...data } = form;
  void _omit;

  const payload: StoredDraft = { savedAt: Date.now(), data };
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // 용량 초과 / 권한 부족 등 — silent
  }
}

export function loadDraft(): DraftPayload | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(DRAFT_KEY);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    storage.removeItem(DRAFT_KEY);
    return null;
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as StoredDraft).savedAt !== "number" ||
    typeof (parsed as StoredDraft).data !== "object"
  ) {
    storage.removeItem(DRAFT_KEY);
    return null;
  }

  const stored = parsed as StoredDraft;
  if (Date.now() - stored.savedAt > DRAFT_TTL_MS) {
    storage.removeItem(DRAFT_KEY);
    return null;
  }

  return stored.data;
}

export function clearDraft(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(DRAFT_KEY);
}
