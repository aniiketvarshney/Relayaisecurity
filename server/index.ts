import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handleExecute } from "./execute.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT ?? 3002);
const distPath = path.resolve(__dirname, "../dist");

app.use(cors());
app.use(express.json());

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return authHeader.trim();
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "relay-api",
    port,
  });
});

app.post("/api/execute", async (req, res) => {
  const bearerToken = extractBearerToken(req.headers.authorization);

  try {
    const result = await handleExecute(
      bearerToken,
      req.body,
      req.headers.cookie,
    );
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("[execute] Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use(express.static(distPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Relay running at http://localhost:${port}`);
});
