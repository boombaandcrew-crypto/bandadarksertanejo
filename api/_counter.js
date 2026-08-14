const COOKIE_NAME = "bds_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  return { url: url.replace(/\/$/, ""), token };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function json(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const cookies = header.split(";").map((item) => item.trim());
  const found = cookies.find((item) => item.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : "";
}

function createVisitorId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function visitorCookie(id) {
  return `${COOKIE_NAME}=${encodeURIComponent(id)}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax; Secure; HttpOnly`;
}

async function redis(command, ...args) {
  const config = getRedisConfig();
  if (!config) {
    const error = new Error("Redis is not configured.");
    error.code = "REDIS_NOT_CONFIGURED";
    throw error;
  }

  const path = [command, ...args].map((part) => encodeURIComponent(String(part))).join("/");
  const response = await fetch(`${config.url}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Redis command failed: ${command}`);
    error.status = response.status;
    throw error;
  }
  return payload.result;
}

function parseHgetall(result) {
  if (!result) return {};
  if (!Array.isArray(result)) return result;

  const out = {};
  for (let i = 0; i < result.length; i += 2) {
    out[result[i]] = Number(result[i + 1] || 0);
  }
  return out;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

module.exports = {
  COOKIE_NAME,
  createVisitorId,
  getRedisConfig,
  json,
  parseHgetall,
  readCookie,
  readJsonBody,
  redis,
  todayKey,
  visitorCookie,
};
