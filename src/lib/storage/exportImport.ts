"use client";

import type { SkillMapData } from "@/src/types/schema";
import { parseSkillMapData } from "@/src/lib/skillMapData";

export class JsonImportError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "JsonImportError";
  }
}

export function downloadJsonBackup(
  data: SkillMapData,
  filename = "skillmap-backup.json",
): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importJsonFile(file: File): Promise<SkillMapData> {
  try {
    const text = await file.text();
    return parseSkillMapData(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new JsonImportError(
        "The selected file does not contain valid JSON.",
        error,
      );
    }

    throw new JsonImportError(
      "The selected file is not a valid SkillMap planner file.",
      error,
    );
  }
}

