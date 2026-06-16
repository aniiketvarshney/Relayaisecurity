import type { Connect, Plugin } from "vite";
import { handleExecute } from "./execute.ts";

function readJsonBody(
  req: Connect.IncomingMessage,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function extractBearerToken(
  authHeader: string | string[] | undefined,
): string | null {
  if (!authHeader || Array.isArray(authHeader)) {
    return null;
  }

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return authHeader.trim();
}

export function relayApiPlugin(): Plugin {
  return {
    name: "relay-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/api/execute" || req.method !== "POST") {
          next();
          return;
        }

        const bearerToken = extractBearerToken(req.headers.authorization);
        const cookieHeader = req.headers.cookie;

        try {
          const body = await readJsonBody(req);
          const result = await handleExecute(
            bearerToken,
            body,
            cookieHeader,
          );

          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        } catch (error) {
          console.error("[execute] Unhandled error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      });
    },
  };
}