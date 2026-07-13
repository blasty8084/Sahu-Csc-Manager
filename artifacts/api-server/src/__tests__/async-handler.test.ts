import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../lib/async-handler";
import type { Request, Response, NextFunction } from "express";

const mockReq = () => ({} as Request);
const mockRes = () => ({} as Response);
const mockNext = () => vi.fn() as unknown as NextFunction;

/** Flush all pending microtasks (Promise resolutions). */
const flush = () => new Promise<void>((r) => setImmediate(r));

describe("asyncHandler", () => {
  it("calls the wrapped async function with req, res, next", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(fn);
    const [req, res, next] = [mockReq(), mockRes(), mockNext()];

    handler(req, res, next);
    await flush();

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it("does NOT call next() when the handler resolves normally", async () => {
    const next = mockNext();
    const handler = asyncHandler(async (_req, res: any) => {
      res.json = vi.fn();
    });

    handler(mockReq(), mockRes(), next);
    await flush();

    expect(next).not.toHaveBeenCalled();
  });

  it("forwards a rejected promise to next(err)", async () => {
    const error = new Error("Database connection lost");
    const next = mockNext();
    const handler = asyncHandler(vi.fn().mockRejectedValue(error));

    handler(mockReq(), mockRes(), next);
    await flush();

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(error);
  });

  it("forwards a thrown error inside an async handler to next(err)", async () => {
    const error = new Error("Validation failed");
    const next = mockNext();
    const handler = asyncHandler(async () => {
      throw error;
    });

    handler(mockReq(), mockRes(), next);
    await flush();

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(error);
  });

  it("preserves error type — forwards the original Error instance, not a wrapper", async () => {
    class DatabaseError extends Error {
      code = "ECONNREFUSED";
    }
    const original = new DatabaseError("pg pool exhausted");
    const next = mockNext();

    asyncHandler(async () => { throw original; })(mockReq(), mockRes(), next);
    await flush();

    expect(next).toHaveBeenCalledWith(original);
    expect((next as any).mock.calls[0][0]).toBeInstanceOf(DatabaseError);
  });

  it("handles a handler that calls next(err) directly — does not double-call next", async () => {
    const error = new Error("Auth failed");
    const next = mockNext();
    const handler = asyncHandler(async (_req, _res, n) => {
      n(error);
    });

    handler(mockReq(), mockRes(), next);
    await flush();

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(error);
  });
});
