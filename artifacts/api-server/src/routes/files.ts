import { Router, type IRouter } from "express";
import { db, fileUploadsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { asyncHandler } from "../lib/async-handler";
import { upload } from "../middleware/upload";
import {
  uploadFile,
  deleteFromDrive,
  deleteLocalFile,
  serveLocalFile,
  driveAvailable,
} from "../services/googleDrive";

const router: IRouter = Router();

// ── Storage status ───────────────────────────────────────────────────────────

router.get(
  "/files/status",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      driveConfigured: driveAvailable,
      storage: driveAvailable ? "google_drive" : "local",
    });
  }),
);

// ── Upload endpoints ─────────────────────────────────────────────────────────

/**
 * POST /api/files/receipt
 * Upload a receipt PDF. Requires: multipart/form-data with field `file`.
 */
router.post(
  "/files/receipt",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const userId = req.session.userId!;
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "receipts",
    );
    await db.insert(fileUploadsTable).values({
      userId,
      driveFileId: result.fileId,
      url: result.url,
      destination: result.destination,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      folder: "receipts",
    });
    res.json(result);
  }),
);

/**
 * POST /api/files/profile
 * Upload a profile photo. Requires: multipart/form-data with field `file`.
 */
router.post(
  "/files/profile",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const userId = req.session.userId!;
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "profiles",
    );
    // Persist Drive URL on the user row
    await db
      .update(usersTable)
      .set({ avatarUrl: result.url, avatarFileId: result.fileId })
      .where(eq(usersTable.id, userId));
    await db.insert(fileUploadsTable).values({
      userId,
      driveFileId: result.fileId,
      url: result.url,
      destination: result.destination,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      folder: "profiles",
    });
    res.json(result);
  }),
);

/**
 * POST /api/files/export
 * Upload an exported report PDF. Requires: multipart/form-data with field `file`.
 */
router.post(
  "/files/export",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const userId = req.session.userId!;
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "exports",
    );
    await db.insert(fileUploadsTable).values({
      userId,
      driveFileId: result.fileId,
      url: result.url,
      destination: result.destination,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      folder: "exports",
    });
    res.json(result);
  }),
);

/**
 * POST /api/files/document
 * Upload a Udhari customer document. Requires: multipart/form-data with field `file`.
 */
router.post(
  "/files/document",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const userId = req.session.userId!;
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "documents",
    );
    await db.insert(fileUploadsTable).values({
      userId,
      driveFileId: result.fileId,
      url: result.url,
      destination: result.destination,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      folder: "documents",
    });
    res.json(result);
  }),
);

// ── Serve local fallback files ───────────────────────────────────────────────

/**
 * GET /api/files/local/:filename
 * Serve a file that was stored in /tmp when Drive is not configured.
 * Auth not required — the caller already has the URL from the upload response.
 */
router.get(
  "/files/local/:filename",
  asyncHandler(async (req, res) => {
    const key = String(req.params["filename"]);
    // Prevent path traversal
    if (key.includes("/") || key.includes("..")) {
      res.status(400).json({ error: "Invalid filename" });
      return;
    }
    const file = serveLocalFile(key);
    if (!file) {
      res.status(404).json({ error: "File not found or expired" });
      return;
    }
    res.setHeader("Content-Disposition", `attachment; filename="${key}"`);
    res.send(file.buffer);
  }),
);

// ── Delete ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/files/:fileId
 * Delete a file from Drive or local storage.
 */
router.delete(
  "/files/:fileId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const fileId = String(req.params["fileId"]);
    const [record] = await db
      .select()
      .from(fileUploadsTable)
      .where(eq(fileUploadsTable.driveFileId, fileId));

    if (!record) {
      res.status(404).json({ error: "File record not found" });
      return;
    }

    // Only the uploader or an admin may delete
    const isAdmin = req.session.userRole === "admin";
    if (record.userId !== req.session.userId && !isAdmin) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (record.destination === "drive") {
      await deleteFromDrive(fileId);
    } else {
      deleteLocalFile(fileId);
    }

    await db
      .delete(fileUploadsTable)
      .where(eq(fileUploadsTable.driveFileId, fileId));

    res.json({ message: "File deleted" });
  }),
);

export default router;
