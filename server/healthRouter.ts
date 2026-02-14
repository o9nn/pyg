import { Router } from "express";
import { checkAphroditeConnection } from "./aphrodite";

/**
 * Health check router for monitoring and Docker health checks
 */
export const healthRouter = Router();

/**
 * GET /health
 * 
 * Returns the health status of the application and its dependencies.
 */
healthRouter.get("/health", async (_req, res) => {
  const startTime = Date.now();

  // Check Aphrodite connection
  let aphroditeStatus = "unknown";
  try {
    const connected = await checkAphroditeConnection();
    aphroditeStatus = connected ? "connected" : "disconnected";
  } catch {
    aphroditeStatus = "error";
  }

  const responseTime = Date.now() - startTime;

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTime}ms`,
    services: {
      aphrodite: aphroditeStatus,
    },
    version: process.env.npm_package_version || "0.1.0",
  });
});

/**
 * GET /health/ready
 * 
 * Readiness probe - returns 200 only when all dependencies are available.
 */
healthRouter.get("/health/ready", async (_req, res) => {
  try {
    const aphroditeOk = await checkAphroditeConnection();
    
    if (aphroditeOk) {
      res.json({ ready: true });
    } else {
      res.status(503).json({ 
        ready: false, 
        reason: "Aphrodite engine not available" 
      });
    }
  } catch (error) {
    res.status(503).json({ 
      ready: false, 
      reason: "Health check failed" 
    });
  }
});
