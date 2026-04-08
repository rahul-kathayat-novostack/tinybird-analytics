export interface AnalyticsEvent {
  timestamp: string;
  action: string;
  version: string;
  session_id: string;
  payload: string;
}

export interface ParsedPayload {
  "user-agent"?: string;
  locale?: string;
  referrer?: string;
  pathname?: string;
  domains?: string;
  href?: string;
  location?: string;
}

export interface PageVisit {
  pathname: string;
  views: number;
}

export interface CountryVisitor {
  country: string;
  visitors: number;
}

export interface DeviceVisitor {
  device: string;
  visitors: number;
}

export interface TimeVisitor {
  date: string;
  visitors: number;
}

export interface AnalyticsResponse {
  unique_visitors: number;
  total_page_views: number;
  views_per_visit: number;
  avg_visit_duration_seconds: number;
  bounce_rate: number;
  visits_per_page: PageVisit[];
  visitors_per_country: CountryVisitor[];
  visitors_per_device: DeviceVisitor[];
  visitors_over_time: TimeVisitor[];
}

export interface StoredEvent {
  id: number;
  timestamp: string;
  action: string;
  version: string;
  session_id: string;
  pathname: string;
  domains: string;
  referrer: string;
  user_agent: string;
  locale: string;
  device: string;
  country: string;
  created_at: string;
}
