import { AnalyticsEvent } from "../types/analytics.types.js";

const REQUIRED_FIELDS: (keyof AnalyticsEvent)[] = [
  "timestamp",
  "action",
  "version",
  "session_id",
  "payload",
];

export const validateEvent = (body: Record<string, unknown> | undefined): { isValid: boolean; error?: string } => {
  if (!body || Object.keys(body).length === 0) {
    return { isValid: false, error: "Missing request body. Ensure you are sending JSON and passing the 'Content-Type: application/json' header." };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || typeof body[field] !== "string") {
      return { isValid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  return { isValid: true };
};
