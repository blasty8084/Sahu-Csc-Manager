import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler so that any rejected promise is
 * forwarded to Express's error handler via `next(err)` instead of becoming
 * an unhandled rejection that either hangs the client or crashes the process.
 *
 * Usage:
 *   router.get("/path", asyncHandler(async (req, res) => {
 *     const data = await someDbCall();
 *     res.json(data);
 *   }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
