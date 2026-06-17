"use client";

import type { SkillMapData } from "@/src/types/schema";

export type FileSystemPermissionMode = "read" | "readwrite";

interface FilePickerAcceptType {
  description: string;
  accept: Record<string, string[]>;
}

interface PlannerSaveFilePickerOptions {
  suggestedName: string;
  types: FilePickerAcceptType[];
}

interface PlannerOpenFilePickerOptions {
  multiple?: false;
  types: FilePickerAcceptType[];
}

interface PlannerFileSystemHandlePermissionDescriptor {
  mode: FileSystemPermissionMode;
}

interface FileSystemAccessWindow extends Window {
  showSaveFilePicker: (
    options?: PlannerSaveFilePickerOptions,
  ) => Promise<FileSystemFileHandle>;
  showOpenFilePicker: (
    options?: PlannerOpenFilePickerOptions,
  ) => Promise<FileSystemFileHandle[]>;
}

interface PermissionedFileSystemFileHandle extends FileSystemFileHandle {
  queryPermission: (
    descriptor?: PlannerFileSystemHandlePermissionDescriptor,
  ) => Promise<PermissionState>;
  requestPermission: (
    descriptor?: PlannerFileSystemHandlePermissionDescriptor,
  ) => Promise<PermissionState>;
}

export class FileSystemAccessError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "unsupported"
      | "permission-denied"
      | "picker-cancelled"
      | "invalid-json"
      | "read-failed"
      | "write-failed",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "FileSystemAccessError";
  }
}

function createDefaultSkillMapData(): SkillMapData {
  const now = new Date().toISOString();

  return {
    version: "1",
    app: {
      name: "SkillMap",
      version: "0.1.0",
    },
    sync: {
      last_saved_at: now,
      last_opened_at: now,
      last_device_id: "",
      last_device_name: "",
      devices: [],
    },
    courses: [],
    modules: [],
    milestones: [],
    topics: [],
    notes: [],
    bookmarks: [],
    goals: [],
    practice_sessions: [],
    progress_notes: [],
    plans: [],
  };
}

function ensureSaveFilePickerSupport(): void {
  if (!("showSaveFilePicker" in window)) {
    throw new FileSystemAccessError(
      "This browser does not support creating local planner files.",
      "unsupported",
    );
  }
}

function ensureOpenFilePickerSupport(): void {
  if (!("showOpenFilePicker" in window)) {
    throw new FileSystemAccessError(
      "This browser does not support opening local planner files.",
      "unsupported",
    );
  }
}

function getFileSystemAccessWindow(): FileSystemAccessWindow {
  return window as unknown as FileSystemAccessWindow;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function getPickerTypes(): FilePickerAcceptType[] {
  return [
    {
      description: "SkillMap JSON file",
      accept: {
        "application/json": [".json"],
      },
    },
  ];
}

function getSavePickerOptions(): PlannerSaveFilePickerOptions {
  return {
    suggestedName: "skillmap.json",
    types: getPickerTypes(),
  };
}

function getOpenPickerOptions(): PlannerOpenFilePickerOptions {
  return {
    multiple: false,
    types: getPickerTypes(),
  };
}

export async function createPlannerFile(): Promise<FileSystemFileHandle> {
  ensureSaveFilePickerSupport();

  try {
    const fileHandle = await getFileSystemAccessWindow().showSaveFilePicker(
      getSavePickerOptions(),
    );
    await writePlannerFile(fileHandle, createDefaultSkillMapData());

    return fileHandle;
  } catch (error) {
    if (error instanceof FileSystemAccessError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new FileSystemAccessError(
        "Planner file creation was cancelled.",
        "picker-cancelled",
        error,
      );
    }

    throw new FileSystemAccessError(
      "Unable to create the planner file.",
      "write-failed",
      error,
    );
  }
}

export async function openPlannerFile(): Promise<FileSystemFileHandle> {
  ensureOpenFilePickerSupport();

  try {
    const [fileHandle] = await getFileSystemAccessWindow().showOpenFilePicker(
      getOpenPickerOptions(),
    );

    if (!fileHandle) {
      throw new FileSystemAccessError(
        "No planner file was selected.",
        "picker-cancelled",
      );
    }

    return fileHandle;
  } catch (error) {
    if (error instanceof FileSystemAccessError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new FileSystemAccessError(
        "Planner file selection was cancelled.",
        "picker-cancelled",
        error,
      );
    }

    throw new FileSystemAccessError(
      "Unable to open the planner file.",
      "read-failed",
      error,
    );
  }
}

export async function readPlannerFile(
  fileHandle: FileSystemFileHandle,
): Promise<SkillMapData> {
  try {
    const file = await fileHandle.getFile();
    const text = await file.text();

    return JSON.parse(text) as SkillMapData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new FileSystemAccessError(
        "The selected planner file does not contain valid JSON.",
        "invalid-json",
        error,
      );
    }

    throw new FileSystemAccessError(
      "Unable to read the planner file.",
      "read-failed",
      error,
    );
  }
}

export async function writePlannerFile(
  fileHandle: FileSystemFileHandle,
  data: SkillMapData,
): Promise<void> {
  let writable: FileSystemWritableFileStream | null = null;

  try {
    writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  } catch (error) {
    if (writable) {
      await writable.abort().catch(() => undefined);
    }

    throw new FileSystemAccessError(
      "Unable to write the planner file.",
      "write-failed",
      error,
    );
  }
}

export async function verifyPermission(
  fileHandle: FileSystemFileHandle,
  mode: FileSystemPermissionMode,
  options: { requestPermission?: boolean } = { requestPermission: true },
): Promise<boolean> {
  const permissionOptions: PlannerFileSystemHandlePermissionDescriptor = { mode };
  const permissionedFileHandle =
    fileHandle as unknown as PermissionedFileSystemFileHandle;

  try {
    if ((await permissionedFileHandle.queryPermission(permissionOptions)) === "granted") {
      return true;
    }

    if (options.requestPermission === false) {
      return false;
    }

    return (
      (await permissionedFileHandle.requestPermission(permissionOptions)) === "granted"
    );
  } catch (error) {
    throw new FileSystemAccessError(
      "Unable to verify planner file permissions.",
      "permission-denied",
      error,
    );
  }
}
