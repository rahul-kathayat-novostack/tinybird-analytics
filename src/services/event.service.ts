import { tinybird } from "../lib/tinybird.js";
import { AnalyticsEvent } from "../types/analytics.types.js";
import { parsePayload } from "../utils/payload-parser.js";
import { parseDevice } from "../utils/device-parser.js";
import { getCountryName } from "../utils/geo-lookup.js";

const INGESTION_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const ingestionCache = new Map<string, number>();

export const insertEvent = async (event: AnalyticsEvent): Promise<void> => {
  const parsed = parsePayload(event.payload);
  const pathname = parsed.pathname || "";
  
  // Create a unique key to identify repeated events for the same session and path
  const cacheKey = `${event.session_id}:${pathname}:${event.action}`;
  const now = Date.now();

  // Check TTL: Skip if same event was ingested less than 5 minutes ago
  const lastIngestion = ingestionCache.get(cacheKey);
  if (lastIngestion && (now - lastIngestion) < INGESTION_TTL) {
    return;
  }

  const device = parseDevice(parsed["user-agent"] || "");
  
  // Normalize country: Priority to location code, then fallback to locale
  const rawCountry = parsed.location || parsed.locale || "";
  const country = getCountryName(rawCountry);

  await tinybird.pageViews.ingest({
    timestamp: event.timestamp || new Date().toISOString(),
    workspace_id: event.workspace_id || (event as any).workspaceId || "",
    collection_id: event.collection_id || (event as any).collectionId || "",
    session_id: event.session_id,
    action: event.action,
    version: event.version,
    pathname,
    domains: parsed.href || parsed.domains || "",
    referrer: parsed.referrer || null,
    user_agent: parsed["user-agent"] || "",
    locale: parsed.locale || "",
    device,
    country,
  });

  // Update cache with current timestamp after successful ingestion
  ingestionCache.set(cacheKey, now);

  // Optional: Simple cleanup if cache grows too large
  if (ingestionCache.size > 10000) {
    const threshold = now - INGESTION_TTL;
    for (const [key, timestamp] of ingestionCache.entries()) {
      if (timestamp < threshold) ingestionCache.delete(key);
    }
  }
};
