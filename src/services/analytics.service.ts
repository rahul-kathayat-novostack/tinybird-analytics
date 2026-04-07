import { tinybird } from "../lib/tinybird.js";
import {
  AnalyticsResponse,
  PageVisit,
  CountryVisitor,
  DeviceVisitor,
  TimeVisitor,
} from "../types/analytics.types.js";

export const getAnalytics = async (): Promise<AnalyticsResponse> => {
  // Parallel fetch for efficiency
  const [
    kpisResult,
    pagesResult,
    countriesResult,
    devicesResult,
    trendsResult,
  ] = await Promise.all([
    tinybird.mainKpis.query(),
    tinybird.topPages.query(),
    tinybird.topCountries.query(),
    tinybird.topDevices.query(),
    tinybird.visitorsOverTime.query(),
  ]);

  const kpis = kpisResult.data[0] || {
    unique_visitors: 0,
    total_page_views: 0,
    views_per_visit: 0,
    avg_visit_duration: 0,
    bounce_rate: 0,
  };

  return {
    unique_visitors: Number(kpis.unique_visitors),
    total_page_views: Number(kpis.total_page_views),
    views_per_visit: Number(kpis.views_per_visit),
    avg_visit_duration_seconds: Number(kpis.avg_visit_duration),
    bounce_rate: Number(kpis.bounce_rate),
    visits_per_page: pagesResult.data.map((row: any) => ({
      pathname: row.pathname,
      views: Number(row.views),
    })) as PageVisit[],
    visitors_per_country: countriesResult.data.map((row: any) => ({
      country: row.country,
      visitors: Number(row.visitors),
    })) as CountryVisitor[],
    visitors_per_device: devicesResult.data.map((row: any) => ({
      device: row.device,
      visitors: Number(row.visitors),
    })) as DeviceVisitor[],
    visitors_over_time: trendsResult.data.map((row: any) => ({
      date: String(row.date),
      visitors: Number(row.visitors),
    })) as TimeVisitor[],
  };
};
