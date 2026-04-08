import { tinybird } from "../lib/tinybird.js";
import { AnalyticsEvent } from "../types/analytics.types.js";
import { parsePayload } from "../utils/payload-parser.js";
import { parseDevice } from "../utils/device-parser.js";
import { getCountryFromLocale } from "../utils/geo-lookup.js";

export const insertEvent = async (event: AnalyticsEvent): Promise<void> => {
  const parsed = parsePayload(event.payload);
  const device = parseDevice(parsed["user-agent"] || "");
  const country = getCountryFromLocale(parsed.locale || "");

  await tinybird.pageViews.ingest({
    timestamp: event.timestamp || new Date().toISOString(),
    session_id: event.session_id,
    action: event.action,
    version: event.version,
    pathname: parsed.pathname || "",
    domains: parsed.domains || "",
    referrer: parsed.referrer || null,
    user_agent: parsed["user-agent"] || "",
    locale: parsed.locale || "",
    device,
    country,
  });
};
