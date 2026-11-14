import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

if (!process.env.VERCEL) {
  const { createServer } = await import("node:http");
  const server = createServer(app);
  server.listen(env.API_PORT, "0.0.0.0", () => {
    console.info(`QueueMate API listening on port ${env.API_PORT}`);
  });

  async function shutdown(signal: string) {
    console.info(`${signal} received; shutting down`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

export default app;
