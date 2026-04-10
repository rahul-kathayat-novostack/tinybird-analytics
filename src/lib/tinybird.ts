import {
  defineDatasource,
  defineEndpoint,
  defineProject,
  node,
  t,
  p,
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
    workspace_id: t.string(),
    collection_id: t.string(),
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
    sortingKey: ["workspace_id", "collection_id", "timestamp"],
  }),
  forwardQuery: `
    SELECT 
      timestamp, 
      workspace_id, 
      collection_id, 
      session_id, 
      action, 
      version, 
      pathname, 
      domains, 
      referrer, 
      user_agent, 
      locale, 
      device, 
      country
  `,
});

// ============================================================================
// Endpoints (Pipes)
// ============================================================================

/**
 * Top level metrics for the dashboard
 */
export const mainKpis = defineEndpoint("main_kpis", {
  params: {
    workspace_id: p.string(),
    collection_id: p.string(),
  },
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
        WHERE ({{workspace_id}} = '' OR workspace_id = {{workspace_id}})
          AND ({{collection_id}} = '' OR collection_id = {{collection_id}})
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

export const topPages = defineEndpoint("top_pages", {
  params: {
    workspace_id: p.string(),
    collection_id: p.string(),
  },
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          pathname,
          count() AS views
        FROM analytics
        WHERE ({{workspace_id}} = '' OR workspace_id = {{workspace_id}})
          AND ({{collection_id}} = '' OR collection_id = {{collection_id}})
          AND action = 'page_hit' 
          AND pathname != ''
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
  params: {
    workspace_id: p.string(),
    collection_id: p.string(),
  },
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          country,
          uniq(session_id) AS visitors
        FROM analytics
        WHERE ({{workspace_id}} = '' OR workspace_id = {{workspace_id}})
          AND ({{collection_id}} = '' OR collection_id = {{collection_id}})
          AND country != ''
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
  params: {
    workspace_id: p.string(),
    collection_id: p.string(),
  },
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          device,
          uniq(session_id) AS visitors
        FROM analytics
        WHERE ({{workspace_id}} = '' OR workspace_id = {{workspace_id}})
          AND ({{collection_id}} = '' OR collection_id = {{collection_id}})
          AND device != ''
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
  params: {
    workspace_id: p.string(),
    collection_id: p.string(),
  },
  nodes: [
    node({
      name: "aggregated",
      sql: `
        SELECT
          toDate(timestamp) AS date,
          uniq(session_id) AS visitors
        FROM analytics
        WHERE ({{workspace_id}} = '' OR workspace_id = {{workspace_id}})
          AND ({{collection_id}} = '' OR collection_id = {{collection_id}})
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
