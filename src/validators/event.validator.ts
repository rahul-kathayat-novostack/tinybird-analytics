import { AnalyticsEvent } from "../types/analytics.types.js";

const REQUIRED_FIELDS: (keyof AnalyticsEvent)[] = [
  "timestamp",
  "action",
  "version",
  "workspace_id",
  "collection_id",
  "session_id",
  "payload",
];

export const validateEvent = (body: Record<string, unknown> | undefined): { isValid: boolean; error?: string } => {
  if (!body || Object.keys(body).length === 0) {
    return { isValid: false, error: "Missing request body. Ensure you are sending JSON and passing the 'Content-Type: application/json' header." };
  }

  for (const field of REQUIRED_FIELDS) {
    if (field === "workspace_id") {
      if (!body.workspace_id) {
        return { isValid: false, error: "Missing required field: workspace_id" };
      }
      continue;
    }
    
    if (field === "collection_id") {
      if (!body.collection_id) {
        return { isValid: false, error: "Missing required field: collection_id" };
      }
      continue;
    }

    if (!body[field] || typeof body[field] !== "string") {
      return { isValid: false, error: `Missing or invalid field: ${field}` };
    }
  }

  return { isValid: true };
};
