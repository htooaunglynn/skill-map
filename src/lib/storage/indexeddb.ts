"use client";

import type { SkillMapData } from "@/src/types/schema";

const DATABASE_NAME = "skillmap";
const DATABASE_VERSION = 1;
const STORE_NAME = "client-storage";
const FILE_HANDLE_KEY = "file_handle";
const DRAFT_KEY = "temporary_json_draft";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function isFileSystemFileHandle(value: unknown): value is FileSystemFileHandle {
  return (
    typeof value === "object" &&
    value !== null &&
    "getFile" in value &&
    "queryPermission" in value
  );
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    transaction.oncomplete = () => {
      database.close();
    };

    transaction.onerror = () => {
      reject(transaction.error);
      database.close();
    };

    transaction.onabort = () => {
      reject(transaction.error);
      database.close();
    };
  });
}

export async function saveFileHandle(
  fileHandle: FileSystemFileHandle,
): Promise<void> {
  await withStore("readwrite", (store) => store.put(fileHandle, FILE_HANDLE_KEY));
}

export async function getSavedFileHandle(): Promise<FileSystemFileHandle | null> {
  const fileHandle = await withStore<unknown>("readonly", (store) =>
    store.get(FILE_HANDLE_KEY),
  );

  return isFileSystemFileHandle(fileHandle) ? fileHandle : null;
}

export async function clearSavedFileHandle(): Promise<void> {
  await withStore("readwrite", (store) => store.delete(FILE_HANDLE_KEY));
}

export async function saveTemporaryJsonDraft(
  draft: SkillMapData,
): Promise<void> {
  await withStore("readwrite", (store) => store.put(draft, DRAFT_KEY));
}

export async function getTemporaryJsonDraft(): Promise<SkillMapData | null> {
  const draft = await withStore<unknown>("readonly", (store) =>
    store.get(DRAFT_KEY),
  );

  return draft ? (draft as SkillMapData) : null;
}

export async function clearTemporaryJsonDraft(): Promise<void> {
  await withStore("readwrite", (store) => store.delete(DRAFT_KEY));
}
