import pino from "pino";

export const logger = pino({
  name: "worker-server",
  level: process.env.LOG_LEVEL ?? "info",
});
