const {
  getRedisConfig,
  json,
  parseHgetall,
  redis,
  todayKey,
} = require("./_counter");

function authorized(req) {
  const secret = process.env.STATS_SECRET;
  if (!secret) {
    return false;
  }

  const host = req.headers.host || "localhost";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const url = new URL(req.url || "/api/stats", `${protocol}://${host}`);
  return url.searchParams.get("key") === secret;
}

function topEntries(record, limit = 8) {
  return Object.entries(record)
    .map(([name, count]) => ({ name, count: Number(count || 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  if (!process.env.STATS_SECRET) {
    return json(res, 503, {
      ok: false,
      error: "Stats page is not configured yet. Add STATS_SECRET in Vercel.",
    });
  }

  if (!authorized(req)) {
    return json(res, 401, { ok: false, error: "Unauthorized" });
  }

  if (!getRedisConfig()) {
    return json(res, 503, {
      ok: false,
      error: "Redis is not configured yet. Add the Upstash Redis env vars in Vercel.",
    });
  }

  const day = todayKey();

  try {
    const [
      totalViews,
      todayViews,
      totalVisitors,
      todayVisitors,
      pathResult,
      referrerResult,
    ] = await Promise.all([
      redis("GET", "bds:views:total"),
      redis("GET", `bds:views:day:${day}`),
      redis("GET", "bds:visitors:total"),
      redis("GET", `bds:visitors:day:${day}`),
      redis("HGETALL", "bds:views:paths"),
      redis("HGETALL", "bds:views:referrers"),
    ]);

    return json(res, 200, {
      ok: true,
      date: day,
      totalViews: Number(totalViews || 0),
      todayViews: Number(todayViews || 0),
      totalVisitors: Number(totalVisitors || 0),
      todayVisitors: Number(todayVisitors || 0),
      topPaths: topEntries(parseHgetall(pathResult)),
      topReferrers: topEntries(parseHgetall(referrerResult)),
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: "Could not load stats.",
    });
  }
};
