import { useEffect, useCallback } from "react";

export type FileKind = "csv" | "xlsx" | "xls" | "unknown";

export interface FileHandlerResult {
  file: File;
  kind: FileKind;
}

function getKind(filename: string): FileKind {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "xlsx") return "xlsx";
  if (ext === "xls") return "xls";
  return "unknown";
}

export function useFileHandler(onFile: (result: FileHandlerResult) => void) {
  const handleFiles = useCallback(
    (files: File[]) => {
      for (const file of files) onFile({ file, kind: getKind(file.name) });
    },
    [onFile]
  );

  useEffect(() => {
    // File Handling API — receives files when app is opened via file association
    if ("launchQueue" in window) {
      (window as any).launchQueue.setConsumer(async (params: any) => {
        if (!params.files?.length) return;
        const files: File[] = await Promise.all(
          params.files.map((fh: any) => fh.getFile())
        );
        handleFiles(files);
      });
    }
  }, [handleFiles]);
}

export const isFileHandlingSupported = typeof window !== "undefined" && "launchQueue" in window;
