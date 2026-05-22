// Offline store using Native IndexedDB for AuraQuest

const DB_NAME = 'AuraQuestOfflineDB';
const DB_VERSION = 2; // Incremented to support caching synced entries
const STORE_NAME = 'offline_entries';
const CACHE_STORE_NAME = 'synced_entries';

// Initialize IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Save an entry to IndexedDB
export async function saveOfflineEntry(content) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const entry = {
        content,
        created_at: new Date().toISOString(),
        isOffline: true
      };

      const request = store.add(entry);

      request.onsuccess = (event) => {
        console.log('Saved entry offline successfully:', event.target.result);
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error('Error saving entry offline:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to save offline entry:', error);
    throw error;
  }
}

// Fetch all pending offline entries
export async function getOfflineEntries() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to get offline entries:', error);
    return [];
  }
}

// Delete an offline entry
export async function deleteOfflineEntry(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Deleted offline entry ID ${id} from IndexedDB`);
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to delete offline entry:', error);
  }
}

// Cache successfully fetched entries
export async function cacheSyncedEntries(entries) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE_NAME);

      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        if (!entries || entries.length === 0) {
          resolve();
          return;
        }

        let completed = 0;
        let hasError = false;

        entries.forEach((entry) => {
          const entryToCache = {
            ...entry,
            isOffline: false
          };
          const addRequest = store.add(entryToCache);

          addRequest.onsuccess = () => {
            completed++;
            if (completed === entries.length && !hasError) {
              console.log(`Cached ${entries.length} synced entries`);
              resolve();
            }
          };

          addRequest.onerror = (e) => {
            hasError = true;
            console.error('Error caching entry:', e.target.error);
            reject(e.target.error);
          };
        });
      };

      clearRequest.onerror = (e) => {
        console.error('Error clearing synced cache store:', e.target.error);
        reject(e.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to cache synced entries:', error);
  }
}

// Fetch all cached synced entries from IndexedDB
export async function getCachedSyncedEntries() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE_NAME], 'readonly');
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Failed to get cached synced entries:', error);
    return [];
  }
}

// Sync all offline entries to the backend API
export async function syncOfflineEntries(token, onSyncProgress) {
  if (typeof window === 'undefined') return;
  const offlineEntries = await getOfflineEntries();
  if (offlineEntries.length === 0) return;

  console.log(`Attempting to sync ${offlineEntries.length} offline entries...`);

  for (const entry of offlineEntries) {
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: entry.content })
      });

      if (response.ok) {
        const data = await response.json();
        await deleteOfflineEntry(entry.id);
        if (onSyncProgress) {
          onSyncProgress(data);
        }
      } else {
        console.error(`Failed to sync entry ${entry.id}. Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Network error syncing offline entry ${entry.id}:`, error);
      break; // Stop syncing other entries if there is a connection/server failure
    }
  }
}

// Listen to browser network changes to trigger auto-sync
export function registerAutoSync(token, onSyncProgress) {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', async () => {
    console.log('Browser is back online! Flushing offline journal buffer...');
    if (token) {
      await syncOfflineEntries(token, onSyncProgress);
    }
  });
}
