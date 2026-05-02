import { useCallback, useRef, useState } from "react";
import { formatNumber } from "./utils/formatters";

const BATCH_SIZE = 500;
const CACHE_NAME = "bench-v1";
const DB_NAME = "web-storage-bench";
const STORE_NAME = "records";

const opLabels = {
  write: "Write",
  read: "Read",
  update: "Update",
  delete: "Delete",
  iterate: "Iterate",
};

const targetLabels = {
  localStorage: "LocalStorage",
  indexedDB: "IndexedDB",
  cacheAPI: "Cache API",
};

const parseDataSize = (sizeLabel) => {
  const normalized = sizeLabel.toUpperCase().replace(/\s+/g, "");
  const match = normalized.match(/(\d+)(KB|MB)/);
  if (!match) {
    return 1024;
  }
  const value = Number(match[1]);
  const unit = match[2];
  return unit === "MB" ? value * 1024 * 1024 : value * 1024;
};

const parseKeyCount = (countLabel) => Number(String(countLabel).replace(/\s+/g, ""));

const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const base64FromBytes = (bytes) => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
};

const bytesFromBase64 = (base64) => {
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const fillRandomBytes = (bytes) => {
  const chunkSize = 65536;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    crypto.getRandomValues(slice);
  }
};

const buildJsonPayload = (templateText, targetBytes, keyCount) => {
  const bytesPerKey = Math.max(1, Math.floor(targetBytes / keyCount));

  let baseItem = null;
  try {
    const parsed = JSON.parse(templateText);
    baseItem = Array.isArray(parsed) ? parsed[0] : parsed;
  } catch {
    baseItem = { id: 1, text: "Example", value: 0, tags: [] };
  }

  const encoder = new TextEncoder();
  const itemString = JSON.stringify(baseItem);
  const itemSize = encoder.encode(itemString).length || 1;
  const count = Math.max(1, Math.ceil((bytesPerKey - 2) / (itemSize + 1)));
  const items = [];

  for (let i = 0; i < count; i += 1) {
    let nextItem = baseItem;
    if (baseItem && typeof baseItem === "object") {
      nextItem = JSON.parse(JSON.stringify(baseItem));
      if (typeof nextItem.id === "number") {
        nextItem.id = i + 1;
      }
    }
    items.push(nextItem);
  }

  const jsonText = JSON.stringify(items);
  return jsonText;
};

const buildRawBytes = (pattern, targetBytes, keyCount) => {
  const bytesPerKey = Math.max(1, Math.floor(targetBytes / keyCount));
  const bytes = new Uint8Array(bytesPerKey);
  
  if (pattern === "zeros") {
    return bytes;
  }
  if (pattern === "repeat") {
    const patternBytes = [0xab, 0xcd];
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = patternBytes[i % patternBytes.length];
    }
    return bytes;
  }
  fillRandomBytes(bytes);
  return bytes;
};

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const canUseLocalStorage = () => {
  try {
    const key = "__bench_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const canUseIndexedDb = async () => {
  try {
    const db = await openDatabase();
    db.close();
    return true;
  } catch {
    return false;
  }
};

const canUseCacheApi = async () => {
  if (typeof caches === "undefined") {
    return false;
  }
  try {
    await caches.open(CACHE_NAME);
    return true;
  } catch {
    return false;
  }
};

const createLocalStorageAdapter = () => ({
  async write(entries) {
    const list = Array.isArray(entries) ? entries : [entries];
    list.forEach(({ key, value }) => localStorage.setItem(key, value));
  },
  async read(keys) {
    const list = Array.isArray(keys) ? keys : [keys];
    return list.map((key) => localStorage.getItem(key));
  },
  async update(entries) {
    const list = Array.isArray(entries) ? entries : [entries];
    list.forEach(({ key, value }) => localStorage.setItem(key, value));
  },
  async delete(keys) {
    const list = Array.isArray(keys) ? keys : [keys];
    list.forEach((key) => localStorage.removeItem(key));
  },
  async iterate(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  },
  async clear(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
  },
});

const createIndexedDbAdapter = () => ({
  async write(entries) {
    const db = await openDatabase();
    const list = Array.isArray(entries) ? entries : [entries];
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      list.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async read(keys) {
    const db = await openDatabase();
    const list = Array.isArray(keys) ? keys : [keys];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const requests = list.map((key) =>
        new Promise((innerResolve, innerReject) => {
          const request = store.get(key);
          request.onsuccess = () => innerResolve(request.result);
          request.onerror = () => innerReject(request.error);
        })
      );
      tx.oncomplete = () => resolve(Promise.all(requests));
      tx.onerror = () => reject(tx.error);
    });
  },
  async update(entries) {
    return this.write(entries);
  },
  async delete(keys) {
    const db = await openDatabase();
    const list = Array.isArray(keys) ? keys : [keys];
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      list.forEach((key) => store.delete(key));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async iterate(prefix) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const keys = [];
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (String(cursor.key).startsWith(prefix)) {
            keys.push(cursor.key);
          }
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(keys);
      tx.onerror = () => reject(tx.error);
    });
  },
  async clear(prefix) {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (String(cursor.key).startsWith(prefix)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
});

const createCacheAdapter = () => ({
  async write(entries) {
    const cache = await caches.open(CACHE_NAME);
    const list = Array.isArray(entries) ? entries : [entries];
    await Promise.all(
      list.map(({ key, value }) =>
        cache.put(new Request(key), new Response(value))
      )
    );
  },
  async read(keys) {
    const cache = await caches.open(CACHE_NAME);
    const list = Array.isArray(keys) ? keys : [keys];
    return Promise.all(list.map((key) => cache.match(key)));
  },
  async update(entries) {
    return this.write(entries);
  },
  async delete(keys) {
    const cache = await caches.open(CACHE_NAME);
    const list = Array.isArray(keys) ? keys : [keys];
    await Promise.all(list.map((key) => cache.delete(key)));
  },
  async iterate(prefix) {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.filter((request) => request.url.startsWith(prefix));
  },
  async clear(prefix) {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    await Promise.all(
      keys
        .filter((request) => request.url.startsWith(prefix))
        .map((request) => cache.delete(request))
    );
  },
});

const buildKeys = (count, prefix) =>
  Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);

const toCacheKeys = (keys) => keys.map((key) => `https://bench/${key}`);

const clearAllStorage = async () => {
  const prefix = "bench-key-";
  const adapters = {
    localStorage: createLocalStorageAdapter(),
    indexedDB: createIndexedDbAdapter(),
    cacheAPI: createCacheAdapter(),
  };

  for (const [target, adapter] of Object.entries(adapters)) {
    try {
      const clearPrefix = target === "cacheAPI" ? "https://bench/" : prefix;
      await adapter.clear(clearPrefix);
      console.log(`[Benchmark] Cleared ${target}`);
    } catch (error) {
      console.warn(`[Benchmark] Failed to clear ${target}:`, error);
    }
  }
};

export default function useBenchmark() {
  const [results, setResults] = useState([]);
  const [errorLog, setErrorLog] = useState([]);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const stopRef = useRef(false);

  const stop = useCallback(() => {
    stopRef.current = true;
    setStatus("idle");
    setProgress((current) => ({ ...current, label: "Stopped" }));
  }, []);

  const run = useCallback(async (config, options = {}) => {
    if (status === "running") {
      return;
    }

    stopRef.current = false;
    setStatus("running");
    setResults([]);
    setErrorLog([]);

    setProgress({ current: 0, total: 0, label: "Cleaning storage..." });
    try {
      await clearAllStorage();
    } catch (error) {
      console.error("[Benchmark] Storage cleanup error:", error);
    }

    const onWarning = typeof options.onWarning === "function" ? options.onWarning : null;
    const onError = typeof options.onError === "function" ? options.onError : null;
    const reportError = (context, error) => {
      const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        time: new Date().toISOString(),
        message,
        ...context,
      };
      setErrorLog((prev) => [entry, ...prev].slice(0, 200));
      console.error("Benchmark error:", entry, error);
      if (onError) {
        onError(entry);
      }
    };

    const keyCount = parseKeyCount(config.keyCount);
    const dataSize = parseDataSize(config.dataSize);
    const prefix = "bench-key-";
    const keys = buildKeys(keyCount, prefix);
    const shouldBatch = keyCount >= 10000;

    const jsonPayload = buildJsonPayload(config.jsonTemplate, dataSize, keyCount);
    const rawBytes = buildRawBytes(config.rawPattern, dataSize, keyCount);

    const payloadForTarget = {
      localStorage:
        config.dataType === "raw" ? base64FromBytes(rawBytes) : jsonPayload,
      indexedDB: config.dataType === "raw" ? rawBytes : jsonPayload,
      cacheAPI: config.dataType === "raw" ? rawBytes : jsonPayload,
    };

    const adapters = {
      localStorage: createLocalStorageAdapter(),
      indexedDB: createIndexedDbAdapter(),
      cacheAPI: createCacheAdapter(),
    };

    const selectedTargets = Object.keys(config.storageTargets).filter(
      (key) => config.storageTargets[key]
    );
    const operations = Object.keys(config.operations).filter(
      (key) => config.operations[key]
    );

    const availabilityChecks = {
      localStorage: async () => canUseLocalStorage(),
      indexedDB: async () => canUseIndexedDb(),
      cacheAPI: async () => canUseCacheApi(),
    };

    const availableTargets = [];
    let hadErrors = false;
    for (const target of selectedTargets) {
      if (stopRef.current) {
        return;
      }

      setProgress({ current: 0, total: 0, label: `Checking ${targetLabels[target]}...` });
      let isAvailable = false;
      try {
        isAvailable = await availabilityChecks[target]();
      } catch (error) {
        hadErrors = true;
        reportError({ stage: "availability", target: targetLabels[target] }, error);
      }
      if (!isAvailable) {
        if (onWarning) {
          onWarning(`${targetLabels[target]} is unavailable in this environment.`);
        }
        continue;
      }

      const adapter = adapters[target];
      const payload = payloadForTarget[target];
      const keyList = target === "cacheAPI" ? toCacheKeys(keys) : keys;
      const warmKey = keyList[0];

      try {
        const clearPrefix = target === "cacheAPI" ? "https://bench/" : prefix;
        try {
          await adapter.clear(clearPrefix);
        } catch (clearError) {
          console.warn(`[Benchmark] Pre-warmup clear failed for ${target}:`, clearError);
        }

        await adapter.write([{ key: warmKey, value: payload }]);
        await adapter.read([warmKey]);
        console.log(`[Benchmark] Warmup successful for ${target}`);
      } catch (error) {
        hadErrors = true;
        const isQuotaError = error?.name === "QuotaExceededError" || error?.message?.includes("quota");
        if (isQuotaError) {
          reportError({ stage: "warm-up", target: targetLabels[target], reason: "quota" }, error);
          if (onWarning) {
            onWarning(`${targetLabels[target]}: Storage quota exceeded. Try clearing browser data or using smaller payload.`);
          }
        } else {
          reportError({ stage: "warm-up", target: targetLabels[target] }, error);
          if (onWarning) {
            onWarning(`${targetLabels[target]} warm-up failed and was skipped.`);
          }
        }
        continue;
      }

      availableTargets.push(target);
    }

    const total = availableTargets.length * operations.length;
    setProgress({ current: 0, total, label: total ? "Ready to run" : "No available targets" });

    try {
      let current = 0;
      for (const target of availableTargets) {
        const adapter = adapters[target];
        const payload = payloadForTarget[target];
        const keyList = target === "cacheAPI" ? toCacheKeys(keys) : keys;
        await adapter.clear(target === "cacheAPI" ? "https://bench/" : prefix);

        for (const operation of operations) {
          if (stopRef.current) {
            return;
          }

          let duration = 0;
          let opError = null;
          try {
            if (operation === "iterate") {
              const label = `${targetLabels[target]} -> ${opLabels[operation]} -> ${formatNumber(
                keyCount
              )} keys...`;
              setProgress({ current, total, label });

              const start = performance.now();
              await adapter.iterate(target === "cacheAPI" ? "https://bench/" : prefix);
              duration = performance.now() - start;
            } else {
              const batches = shouldBatch ? chunkArray(keyList, BATCH_SIZE) : [keyList];
              let processed = 0;
              for (const batch of batches) {
                if (stopRef.current) {
                  return;
                }

                const label = `${targetLabels[target]} -> ${opLabels[operation]} -> ${formatNumber(
                  processed
                )} / ${formatNumber(keyCount)} keys...`;
                setProgress({ current, total, label });

                let start = 0;
                if (operation === "write" || operation === "update") {
                  const entries = batch.map((key) => ({ key, value: payload }));
                  start = performance.now();
                  await adapter[operation](entries);
                  duration += performance.now() - start;
                } else if (operation === "read") {
                  start = performance.now();
                  const values = await adapter.read(batch);
                  duration += performance.now() - start;
                  if (config.dataType === "raw" && target === "localStorage") {
                    values.forEach((value) => bytesFromBase64(value));
                  }
                } else if (operation === "delete") {
                  start = performance.now();
                  await adapter.delete(batch);
                  duration += performance.now() - start;
                }

                processed += batch.length;

                if (shouldBatch && batch !== batches[batches.length - 1]) {
                  await new Promise((resolve) => setTimeout(resolve, 0));
                }
              }
            }
          } catch (error) {
            opError = error;
          }

          if (opError) {
            hadErrors = true;
            const isQuotaError = opError?.name === "QuotaExceededError" || opError?.message?.includes("quota");
            reportError({
              stage: "run",
              target: targetLabels[target],
              operation: opLabels[operation],
              keyCount,
              dataSize,
              reason: isQuotaError ? "quota" : "other",
            }, opError);
          }

          setResults((prev) => [
            ...prev,
            {
              target: targetLabels[target],
              operation: opLabels[operation],
              duration: opError ? 0 : duration,
              keyCount,
              dataSize,
              status: opError ? "error" : "ok",
            },
          ]);

          current += 1;
          setProgress((currentProgress) => ({
            ...currentProgress,
            current,
          }));
        }
      }

      if (!stopRef.current) {
        setStatus("done");
        setProgress((currentProgress) => ({
          ...currentProgress,
          label: hadErrors ? "Completed with errors" : "Complete",
        }));
      }
    } catch (error) {
      reportError({ stage: "run", target: "All" }, error);
      setStatus("error");
      setProgress((currentProgress) => ({
        ...currentProgress,
        label: "Error",
      }));
    }
  }, [status]);

  const clearResults = useCallback(() => {
    setResults([]);
    setErrorLog([]);
  }, []);

  return { run, stop, results, progress, status, clearResults, errorLog };
}
