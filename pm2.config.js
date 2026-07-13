/**
 * PM2 ecosystem config for SAHU CSC — multi-process production mode.
 *
 * Usage:
 *   pm2 start pm2.config.js          # start both processes
 *   pm2 start pm2.config.js --env production
 *   pm2 monit                         # live dashboard
 *   pm2 logs                          # tail all logs
 *   pm2 restart all                   # rolling restart
 *
 * Prereqs:
 *   1. pnpm install
 *   2. pnpm --filter @workspace/api-server run build
 *   3. pnpm --filter @workspace/worker-server run build
 *   4. Set env vars: DATABASE_URL, SESSION_SECRET, REDIS_URL, etc.
 */

module.exports = {
  apps: [
    {
      name: "api-server",
      script: "artifacts/api-server/dist/index.mjs",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      restart_delay: 1000,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
        PORT: 8080,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
    {
      name: "worker-server",
      script: "artifacts/worker-server/dist/index.mjs",
      instances: 1,          // single instance — BullMQ workers handle concurrency internally
      exec_mode: "fork",
      watch: false,
      restart_delay: 2000,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "development",
        PORT: 8081,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8081,
      },
    },
  ],
};
