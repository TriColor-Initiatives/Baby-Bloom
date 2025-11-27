// Local-only photo service fallback (no Firebase backend configured)
// Stores photos per user in localStorage and provides a simple subscribe/upload/delete API

const STORAGE_PREFIX = 'baby-bloom-photos';

const getKey = (userId) => `${STORAGE_PREFIX}-${userId || 'guest'}`;

const loadPhotos = (userId) => {
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Unable to load photos from storage:', err);
    return [];
  }
};

const savePhotos = (userId, photos) => {
  try {
    localStorage.setItem(getKey(userId), JSON.stringify(photos));
  } catch (err) {
    console.warn('Unable to save photos to storage:', err);
  }
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const subscribeToPhotos = (userId, callback) => {
  const emit = () => {
    const photos = loadPhotos(userId).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    callback(photos);
  };

  emit();

  const handler = (event) => {
    if (event.key === getKey(userId)) {
      emit();
    }
  };

  window.addEventListener('storage', handler);

  return () => window.removeEventListener('storage', handler);
};

export const uploadPhoto = async (file, userId, babyId = null, meta = {}) => {
  const base64 = await fileToBase64(file);
  const newPhoto = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    babyId,
    url: base64,
    name: file.name,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    ideaTag: meta.ideaTag || null,
    storagePath: null,
  };

  const photos = loadPhotos(userId);
  photos.unshift(newPhoto);
  savePhotos(userId, photos);
  return newPhoto;
};

export const deletePhoto = async (photoId, userId) => {
  const photos = loadPhotos(userId).filter((p) => p.id !== photoId);
  savePhotos(userId, photos);
};
