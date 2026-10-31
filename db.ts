import { AudioRecord, Project, VoiceCloneProfile } from '../types/tts';

const DB_NAME = 'sirtxod_ai_studio_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Audios store
      if (!db.objectStoreNames.contains('audios')) {
        const audioStore = db.createObjectStore('audios', { keyPath: 'id' });
        audioStore.createIndex('createdAt', 'createdAt', { unique: false });
        audioStore.createIndex('projectId', 'projectId', { unique: false });
      }

      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }

      // Voice Clones store
      if (!db.objectStoreNames.contains('clones')) {
        const cloneStore = db.createObjectStore('clones', { keyPath: 'id' });
        cloneStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// Audios
export async function saveAudioRecord(record: AudioRecord): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('audios', 'readwrite');
    const store = transaction.objectStore('audios');
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllAudioRecords(): Promise<AudioRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('audios', 'readonly');
    const store = transaction.objectStore('audios');
    const req = store.getAll();
    req.onsuccess = () => {
      const records = req.result as AudioRecord[];
      // Sort newest first
      records.sort((a, b) => b.createdAt - a.createdAt);
      resolve(records);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAudioRecordById(id: string): Promise<AudioRecord | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('audios', 'readonly');
    const store = transaction.objectStore('audios');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function updateAudioTitle(id: string, newTitle: string): Promise<void> {
  const record = await getAudioRecordById(id);
  if (!record) return;
  record.title = newTitle;
  await saveAudioRecord(record);
}

export async function deleteAudioRecord(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('audios', 'readwrite');
    const store = transaction.objectStore('audios');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Projects
export async function saveProject(project: Project): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readwrite');
    const store = transaction.objectStore('projects');
    const req = store.put(project);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readonly');
    const store = transaction.objectStore('projects');
    const req = store.getAll();
    req.onsuccess = () => {
      const projects = req.result as Project[];
      projects.sort((a, b) => b.lastModified - a.lastModified);
      resolve(projects);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('projects', 'readwrite');
    const store = transaction.objectStore('projects');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Voice Clones
export async function saveVoiceClone(clone: VoiceCloneProfile): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clones', 'readwrite');
    const store = transaction.objectStore('clones');
    const req = store.put(clone);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllVoiceClones(): Promise<VoiceCloneProfile[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clones', 'readonly');
    const store = transaction.objectStore('clones');
    const req = store.getAll();
    req.onsuccess = () => {
      const clones = req.result as VoiceCloneProfile[];
      clones.sort((a, b) => b.createdAt - a.createdAt);
      resolve(clones);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteVoiceClone(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clones', 'readwrite');
    const store = transaction.objectStore('clones');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Storage statistics
export async function getStorageStats(): Promise<{ audioCount: number; totalBytes: number; projectCount: number; cloneCount: number }> {
  try {
    const audios = await getAllAudioRecords();
    const projects = await getAllProjects();
    const clones = await getAllVoiceClones();

    let totalBytes = 0;
    for (const a of audios) {
      totalBytes += a.fileSizeBytes || (a.audioData ? a.audioData.byteLength : 0);
    }

    return {
      audioCount: audios.length,
      totalBytes,
      projectCount: projects.length,
      cloneCount: clones.length,
    };
  } catch {
    return { audioCount: 0, totalBytes: 0, projectCount: 0, cloneCount: 0 };
  }
}
