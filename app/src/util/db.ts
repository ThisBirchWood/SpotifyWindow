import { openDB } from 'idb';

export const dbPromise = openDB('spotifyDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('streams')) {
      db.createObjectStore('streams', { keyPath: 'id', autoIncrement: true });
    }
  },
});

export async function addStreams(streamArray: any[]) {
  const db = await dbPromise;
  const tx = db.transaction('streams', 'readwrite');
  const store = tx.objectStore('streams');

  // Clear previous data if you want a fresh upload each time
  await store.clear();

  for (const stream of streamArray) {
    await store.add(stream);
  }

  await tx.done;
}

export async function getAllStreams() {
  const db = await dbPromise;
  const tx = db.transaction('streams', 'readonly');
  const store = tx.objectStore('streams');
  return await store.getAll();
}
