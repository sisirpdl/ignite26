const http = require("node:http");
const { DatabaseSync } = require("node:sqlite");
const { randomBytes, createHash } = require("node:crypto");
const { mkdirSync, readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const FairMath = require("../fair-math.js");
const keys = new Set(["messages", "preferences", "game", "runs", "html"]);
const hash = (token) => createHash("sha256").update(token).digest("hex");
const fault = (status, message) =>
  Object.assign(new Error(message), { status });

function createApp({
  database = path.join(__dirname, "data/clutch.sqlite"),
  root = path.join(__dirname, ".."),
  origins = [],
} = {}) {
  if (database !== ":memory:")
    mkdirSync(path.dirname(database), { recursive: true });
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS documents (session_id TEXT NOT NULL REFERENCES sessions(id), key TEXT NOT NULL, revision INTEGER NOT NULL, value TEXT NOT NULL, PRIMARY KEY(session_id,key));`);
  const limits = new Map();
  const server = http.createServer(async (req, res) => {
    const reply = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(JSON.stringify(data));
    };
    try {
      const url = new URL(req.url, "http://localhost");
      const origin = req.headers.origin;
      const ownOrigin = `http://${req.headers.host}`;
      const allowed = [
        ownOrigin,
        "http://127.0.0.1:8082",
        "http://localhost:8082",
        "http://localhost:8081",
        ...origins,
      ];
      if (origin && !allowed.includes(origin))
        throw fault(403, "Origin is not allowed");
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
      }
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        });
        return res.end();
      }
      if (!url.pathname.startsWith("/api/")) {
        if (req.method !== "GET") throw fault(405, "Method not allowed");
        const publicPaths = {
          "/legacy": "index.html",
          "/legacy/": "index.html",
          "/fair-math.js": "fair-math.js",
          "/backend-client.js": "server/backend-client.js",
        };
        const relative = publicPaths[url.pathname];
        const base = relative ? root : path.join(root, "dist");
        const file = relative
          ? path.resolve(base, relative)
          : path.resolve(
              base,
              "." +
                decodeURIComponent(
                  url.pathname === "/" ? "/index.html" : url.pathname,
                ),
            );
        if (!file.startsWith(base + path.sep) || !existsSync(file))
          throw fault(
            404,
            "File not found. Build the frontend with npm run build:preview.",
          );
        const ext = path.extname(file);
        const types = {
          ".css": "text/css",
          ".html": "text/html",
          ".js": "text/javascript",
          ".png": "image/png",
          ".ttf": "font/ttf",
          ".json": "application/json",
          ".svg": "image/svg+xml",
        };
        res.writeHead(200, {
          "Content-Type": types[ext] || "application/octet-stream",
          "X-Content-Type-Options": "nosniff",
        });
        return res.end(readFileSync(file));
      }
      const ip = req.socket.remoteAddress;
      const now = Date.now();
      let rate = limits.get(ip);
      if (!rate || now - rate.at > 60000) {
        rate = { at: now, n: 0 };
        limits.set(ip, rate);
      }
      if (++rate.n > 240)
        throw fault(429, "Too many requests; retry in a minute");
      if (limits.size > 1000)
        for (const [k, v] of limits) if (now - v.at > 60000) limits.delete(k);
      const body = async () => {
        if (!req.headers["content-type"]?.startsWith("application/json"))
          throw fault(415, "Use application/json");
        let data = "";
        for await (const chunk of req) {
          data += chunk;
          if (Buffer.byteLength(data) > 512000)
            throw fault(413, "Request exceeds 500 KB");
        }
        try {
          return JSON.parse(data);
        } catch {
          throw fault(400, "Invalid JSON");
        }
      };
      if (url.pathname === "/api/health" && req.method === "GET")
        return reply(200, { ok: true, mode: "development", storage: "sqlite" });
      if (url.pathname === "/api/session" && req.method === "POST") {
        const token = randomBytes(32).toString("hex");
        const id = randomBytes(16).toString("hex");
        db.prepare("INSERT INTO sessions VALUES (?,?,?)").run(
          id,
          hash(token),
          Date.now(),
        );
        return reply(201, { token, mode: "private-demo-workspace" });
      }
      const token = req.headers.authorization?.match(
        /^Bearer ([a-f0-9]{64})$/,
      )?.[1];
      const session =
        token &&
        db
          .prepare("SELECT id FROM sessions WHERE token_hash=?")
          .get(hash(token));
      if (!session) throw fault(401, "A valid workspace session is required");
      if (url.pathname === "/api/state" && req.method === "GET") {
        const documents = {};
        for (const row of db
          .prepare(
            "SELECT key,revision,value FROM documents WHERE session_id=?",
          )
          .all(session.id))
          documents[row.key] = {
            revision: row.revision,
            value: JSON.parse(row.value),
          };
        return reply(200, { documents });
      }
      const key = url.pathname.split("/")[3];
      if (
        url.pathname === `/api/state/${key}` &&
        keys.has(key) &&
        req.method === "PUT"
      ) {
        const data = await body();
        validate(key, data);
        const row = db
          .prepare(
            "SELECT revision FROM documents WHERE session_id=? AND key=?",
          )
          .get(session.id, key);
        const revision = row?.revision || 0;
        if (data.revision !== revision)
          throw fault(
            409,
            "This workspace changed in another tab. Reload before editing.",
          );
        db.prepare(
          "INSERT INTO documents VALUES (?,?,?,?) ON CONFLICT(session_id,key) DO UPDATE SET revision=excluded.revision,value=excluded.value",
        ).run(session.id, key, revision + 1, JSON.stringify(data.value));
        return reply(200, { revision: revision + 1 });
      }
      if (url.pathname === "/api/score" && req.method === "POST") {
        const input = await body();
        if (
          !input ||
          typeof input !== "object" ||
          Array.isArray(input) ||
          ["hrv", "rhr", "sleep", "steps"].some(
            (key) =>
              !input[key] ||
              typeof input[key] !== "object" ||
              Array.isArray(input[key]),
          )
        )
          throw fault(
            400,
            "hrv, rhr, sleep and steps observation objects are required",
          );
        return reply(200, {
          ...FairMath.calculateDailyScore(input),
          verified: false,
          note: "Calculated from submitted demo observations; not trusted wearable evidence.",
        });
      }
      throw fault(404, "Endpoint not found");
    } catch (error) {
      reply(error.status || 500, {
        error: error.status ? error.message : "Internal server error",
      });
    }
  });
  server.on("close", () => db.close());
  return server;
}
function validate(key, data) {
  if (!data || !Number.isSafeInteger(data.revision) || data.revision < 0)
    throw fault(400, "A nonnegative revision is required");
  const value = data.value;
  if (key === "messages") {
    if (!Array.isArray(value) || value.length > 500)
      throw fault(400, "Messages must be an array with at most 500 entries");
    const ids = new Set();
    for (const m of value) {
      if (
        !m ||
        typeof m.id !== "string" ||
        ids.has(m.id) ||
        !["text", "system", "activity", "poll", "snap"].includes(m.type)
      )
        throw fault(400, "Invalid message");
      ids.add(m.id);
      if (
        m.text !== undefined &&
        (typeof m.text !== "string" || m.text.length > 4000)
      )
        throw fault(400, "Message exceeds 4000 characters");
    }
  } else if (key === "runs") {
    if (
      !Array.isArray(value) ||
      value.length > 100 ||
      value.some(
        (r) =>
          !r ||
          typeof r.id !== "string" ||
          !Number.isFinite(r.seconds) ||
          r.seconds < 0 ||
          !["r1", "r2", "r3"].includes(r.routeId),
      )
    )
      throw fault(400, "Invalid run history");
  } else {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw fault(400, "State must be an object");
    if (
      key === "preferences" &&
      value.group &&
      !["g1", "g2"].includes(value.group)
    )
      throw fault(400, "Unknown group");
    if (
      key === "game" &&
      (!Number.isInteger(value.sent) || value.sent < 0 || value.sent > 3)
    )
      throw fault(400, "Invalid daily send count");
  }
}
module.exports = { createApp };
if (require.main === module) {
  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || "127.0.0.1";
  createApp({
    database: process.env.CLUTCH_DB,
    origins: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
  }).listen(port, host, () =>
    console.log(
      `Clutch API + React Native web: http://${host}:${port}\nOriginal HTML: http://${host}:${port}/legacy`,
    ),
  );
}
