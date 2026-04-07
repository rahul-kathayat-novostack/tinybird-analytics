import { ParsedPayload } from "../types/analytics.types.js";

export const parsePayload = (payload: string): ParsedPayload => {
  try {
    return JSON.parse(payload) as ParsedPayload;
  } catch {
    return {};
  }
};
