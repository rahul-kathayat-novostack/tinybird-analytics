import {
  defineDatasource,
  defineEndpoint,
  defineProject,
  node,
  t,
  engine,
} from "@tinybirdco/sdk";

// ============================================================================
// Datasources
// ============================================================================

/**
 * Page views datasource - tracks all analytics events
 */
export const pageViews = defineDatasource("analytics", {
  description: "Comprehensive analytics tracking data",
  schema: {
    timestamp: t.dateTime(),
    session_id: t.string(),
    action: t.string(),
    version: t.string(),
    pathname: t.string(),
    domains: t.string(),
    referrer: t.string().nullable(),
    user_agent: t.string(),
    locale: t.string(),
    device: t.string(),
    country: t.string(),
  },
  engine: engine.mergeTree({
    sortingKey: ["pathname", "timestamp"],
  }),
});

// ============================================================================
// Endpoints (Pipes)
// ============================================================================

/**
 * Top level metrics for the dashboard
 */
export const mainKpis = defineEndpoint("main_kpis", {
  params: {},
  nodes: [
    node({
      name: "sessions",
      sql: `
        SELECT
          session_id,
          countIf(action = 'page_hit') AS page_hits,
          min(timestamp) AS start_time,
          max(timestamp) AS end_time
        FROM analytics
        GROUP BY session_id
      `,
    }),
    node({
      name: "metrics",
      sql: `
        SELECT
          uniq(session_id) AS unique_visitors,
          sum(page_hits) AS total_page_views,
          round(total_page_views / unique_visitors, 2) AS views_per_visit,
          avg(dateDiff('second', start_time, end_time)) AS avg_visit_duration,
          round(countIf(page_hits = 1) / unique_visitors * 100, 2) AS bounce_rate
        FROM sessions
      `,
    }),
  ],
  output: {
    unique_visitors: t.uint64(),
    total_page_views: t.uint64(),
    views_per_visit: t.float64(),
    avg_visit_duration: t.float64(),
    bounce_rate: t.float64(),
  }
});

/**
 * Pages breakdown
 */
export const topPages = defineEndpoint("top_pages", {
  params: {},
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          pathname,
          count() AS views
        FROM analytics
        WHERE action = 'page_hit' AND pathname != ''
        GROUP BY pathname
        ORDER BY views DESC
        LIMIT 10
      `,
    }),
  ],
  output: {
    pathname: t.string(),
    views: t.uint64(),
  }
});

/**
 * Geo breakdown
 */
export const topCountries = defineEndpoint("top_countries", {
  params: {},
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          country,
          uniq(session_id) AS visitors
        FROM analytics
        WHERE country != ''
        GROUP BY country
        ORDER BY visitors DESC
        LIMIT 10
      `,
    }),
  ],
  output: {
    country: t.string(),
    visitors: t.uint64(),
  }
});

/**
 * Device breakdown
 */
export const topDevices = defineEndpoint("top_devices", {
  params: {},
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          device,
          uniq(session_id) AS visitors
        FROM analytics
        WHERE device != ''
        GROUP BY device
        ORDER BY visitors DESC
      `,
    }),
  ],
  output: {
    device: t.string(),
    visitors: t.uint64(),
  }
});

/**
 * Visitors over time
 */
export const visitorsOverTime = defineEndpoint("visitors_over_time", {
  params: {},
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          toDate(timestamp) AS date,
          uniq(session_id) AS visitors
        FROM analytics
        GROUP BY date
        ORDER BY date ASC
      `,
    }),
  ],
  output: {
    date: t.date(),
    visitors: t.uint64(),
  }
});

// ============================================================================
// Client
// ============================================================================

const project = defineProject({
  datasources: { pageViews },
  pipes: {
    mainKpis,
    topPages,
    topCountries,
    topDevices,
    visitorsOverTime
  },
});

// Export the tinybird client
export const tinybird = project.tinybird as any;
