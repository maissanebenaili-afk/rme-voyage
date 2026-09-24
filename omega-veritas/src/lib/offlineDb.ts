const DB_NAME = "rme-voyage-offline";
const DB_VERSION = 1;
const VALID_STORES = ["prayerTimes", "routeCache", "metadata"] as const;

type StoreName = (typeof VALID_STORES)[number];

function assertStore(storeName: string): asserts storeName is StoreName {
  if (!(VALID_STORES as readonly string[]).includes(storeName)) {
    throw new Error("INVALID_STORE_NAME");
  }
}

function assertKey(key: string): void {
  if (typeof key !== "string" || key.length === 0) {
    throw new Error("INVALID_CACHE_KEY");
  }
}

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("INDEXEDDB_UNAVAILABLE"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      for (const store of VALID_STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    request.onerror = () => reject(request.error ?? new Error("INDEXEDDB_OPEN_ERROR"));
    request.onblocked = () => reject(new Error("INDEXEDDB_OPEN_BLOCKED"));
  });
}

export async function setCache(
  storeName: string,
  key: string,
  data: unknown,
): Promise<void> {
  assertStore(storeName);
  assertKey(key);

  const db = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(
      { data, timestamp: Date.now() },
      key,
    );

    let settled = false;
    const fail = (error: unknown) => {
      if (!settled) {
        settled = true;
        reject(error instanceof Error ? error : new Error("INDEXEDDB_WRITE_ERROR"));
      }
    };

    request.onerror = () => fail(request.error);
    transaction.onerror = () => fail(transaction.error);
    transaction.onabort = () => fail(new Error("TRANSACTION_ABORTED"));
    transaction.oncomplete = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
  });
}

export async function getCache<T>(
  storeName: string,
  key: string,
  maxAgeMs?: number,
): Promise<T | null> {
  assertStore(storeName);
  assertKey(key);

  if (
    maxAgeMs !== undefined &&
    (!Number.isFinite(maxAgeMs) || maxAgeMs < 0)
  ) {
    throw new Error("INVALID_MAX_AGE");
  }

  const db = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(key);

    request.onsuccess = () => {
      const record = request.result;
      if (!record) {
        resolve(null);
        return;
      }

      if (
        maxAgeMs !== undefined &&
        Date.now() - record.timestamp > maxAgeMs
      ) {
        resolve(null);
        return;
      }

      resolve(record.data as T);
    };

    request.onerror = () =>
      reject(request.error ?? new Error("INDEXEDDB_READ_ERROR"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("INDEXEDDB_TRANSACTION_ERROR"));
  });
}
