const {
  COOKIE_NAME,
  createVisitorId,
  getRedisConfig,
  json,
  readCookie,
  readJsonBody,
  redis,
  todayKey,
  visitorCookie,
} = require("./_counter");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  if (!getRedisConfig()) {
    return json(res, 503, {
      ok: false,
      error: "Visitor counter is not configured yet.",
    });
  }

  const body = await readJsonBody(req);
  const day = todayKey();
  const path = typeof body.path === "string" && body.path ? body.path.slice(0, 160) : "/";
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 260) : "";

  let visitorId = readCookie(req, COOKIE_NAME);
  const isNewVisitor = !visitorId;
  if (!visitorId) {
    visitorId = createVisitorId();
  }

  try {
    await redis("INCR", "bds:views:total");
    await redis("INCR", `bds:views:day:${day}`);
    await redis("HINCRBY", "bds:views:paths", path, 1);

    if (referrer && !referrer.includes(req.headers.host || "")) {
      await redis("HINCRBY", "bds:views:referrers", referrer, 1);
    }

    if (isNewVisitor) {
      await redis("INCR", "bds:visitors:total");
      await redis("INCR", `bds:visitors:day:${day}`);
    }

    return json(
      res,
      200,
      { ok: true },
      isNewVisitor ? { "Set-Cookie": visitorCookie(visitorId) } : {},
    );
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: "Could not record visit.",
    });
  }
};
