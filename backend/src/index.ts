import "./config/env"; // validate env vars at startup
import app from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

async function main() {
  // Verify database connection
  await prisma.$connect();
  logger.info("Database connected");

  app.listen(env.PORT, () => {
    logger.info(`HRMS API running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      url: `http://localhost:${env.PORT}`,
    });
  });
}

main().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
