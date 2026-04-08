import { tinybird } from "../lib/tinybird.js";
import {
  AnalyticsResponse,
  PageVisit,
  CountryVisitor,
  DeviceVisitor,
  TimeVisitor,
} from "../types/analytics.types.js";

export const getAnalytics = async (
  workspaceId: string = "",
  collectionId: string = ""
): Promise<AnalyticsResponse> => {
  // Parallel fetch for efficiency
  const [
    kpisResult,
    pagesResult,
    countriesResult,
    devicesResult,
    trendsResult,
  ] = await Promise.all([
    tinybird.mainKpis.query({ workspace_id: workspaceId, collection_id: collectionId }),
    tinybird.topPages.query({ workspace_id: workspaceId, collection_id: collectionId }),
    tinybird.topCountries.query({ workspace_id: workspaceId, collection_id: collectionId }),
    tinybird.topDevices.query({ workspace_id: workspaceId, collection_id: collectionId }),
    tinybird.visitorsOverTime.query({ workspace_id: workspaceId, collection_id: collectionId }),
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
    visitors_per_country: countriesResult.data.map((row: any) => {
      const code = row.country;
      let name = code;
      try {
        if (code && code.length === 2) {
          const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
          name = regionNames.of(code.toUpperCase()) || code;
        }
      } catch {
        // Fallback to code if transformation fails
      }
      return {
        country: name,
        visitors: Number(row.visitors),
      };
    }) as CountryVisitor[],
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
