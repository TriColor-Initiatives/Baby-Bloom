import { useState, useRef, useEffect, useMemo } from 'react';
import { useBaby } from '../contexts/BabyContext';
import '../styles/pages.css';

const STORAGE_KEY = 'baby-bloom-photos';
const MONTHLY_IDEAS = [
  { title: 'Sleepy snuggle', emoji: '🧸', color: 'linear-gradient(135deg, #f3e9ff, #e0d7ff)', prompt: 'Upload a peaceful sleeping photo.', minMonths: 0, maxMonths: 2 },
  { title: 'Bedtime stretch', emoji: '🌙', color: 'linear-gradient(135deg, #e0f4ff, #d7e9ff)', prompt: 'Upload a sleepy stretch with tiny toes in the air.', minMonths: 0, maxMonths: 3 },
  { title: 'Tiny hands & feet', emoji: '👐', color: 'linear-gradient(135deg, #fff0f3, #ffd6e0)', prompt: 'Upload a close-up of tiny hands and feet.', minMonths: 0, maxMonths: 4 },
  { title: 'Rolling practice', emoji: '🤸', color: 'linear-gradient(135deg, #f0f5ff, #dbe7ff)', prompt: 'Upload a mid-roll capture on a cozy mat.', minMonths: 4, maxMonths: 7 },
  { title: 'Playtime on the bed', emoji: '🎈', color: 'linear-gradient(135deg, #fff3e6, #ffe0c2)', prompt: 'Upload a playful kick-and-wiggle moment on the bed.', minMonths: 3, maxMonths: 6 },
  { title: 'Mirror giggles', emoji: '🔍', color: 'linear-gradient(135deg, #fff0f3, #ffd6e0)', prompt: 'Upload a mirror giggle with tiny hands reaching.', minMonths: 6, maxMonths: 9 },
  { title: 'Book nook', emoji: '📚', color: 'linear-gradient(135deg, #e8f7ff, #d5ecff)', prompt: 'Upload a board-book cuddle with curious eyes.', minMonths: 8, maxMonths: 12 },
  { title: 'Standing hero', emoji: '🧷', color: 'linear-gradient(135deg, #f2f7ff, #dfe7ff)', prompt: 'Upload a first stand-and-reach moment.', minMonths: 9, maxMonths: 13 },
  { title: 'Family meal buddy', emoji: '🍽️', color: 'linear-gradient(135deg, #fff8e1, #ffe9a8)', prompt: 'Upload a highchair snack or family meal smile.', minMonths: 10, maxMonths: 14 },
];

const Photos = () => {
  const { activeBaby } = useBaby();
  const [photos, setPhotos] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const fileInputRef = useRef(null);
  const [uploadIdeaTag, setUploadIdeaTag] = useState(null);

  const babyAgeMonths = useMemo(() => {
    if (!activeBaby?.dateOfBirth) return null;
    const today = new Date();
    const dob = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    const days = today.getDate() - dob.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return months + Math.max(0, days) / daysInMonth;
  }, [activeBaby]);

  const ideasForAge = useMemo(() => {
    if (babyAgeMonths === null) return MONTHLY_IDEAS;

    const withDistance = (idea) => {
      const min = idea.minMonths ?? 0;
      const max = idea.maxMonths ?? 24;
      const rangeMid = (min + max) / 2;
      return { idea, distance: Math.abs(rangeMid - babyAgeMonths) };
    };

    const filtered = MONTHLY_IDEAS.filter((idea) => {
      const min = idea.minMonths ?? 0;
      const max = idea.maxMonths ?? 24;
      return babyAgeMonths >= min && babyAgeMonths <= max;
    });

    if (filtered.length >= 3) return filtered;

    // Always show at least three idea cards: fill with nearest other ideas by age proximity
    const remaining = MONTHLY_IDEAS.filter((idea) => !filtered.includes(idea))
      .map(withDistance)
      .sort((a, b) => a.distance - b.distance)
      .map((entry) => entry.idea);

    return [...filtered, ...remaining].slice(0, 3);
  }, [babyAgeMonths]);

  // Load photos from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPhotos(parsed);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    }
  }, []);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    if (photos.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
      } catch (error) {
        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
          alert('Storage limit reached! Please delete some photos to free up space.');
        } else {
          console.error('Error saving photos:', error);
        }
      }
    } else {
      // Clear storage if no photos
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [photos]);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFiles = async (event) => {
    const pickedFiles = Array.from(event.target.files || []);
    if (!pickedFiles.length) return;

    try {
      const newPhotos = await Promise.all(
        pickedFiles.map(async (file) => {
          // Check file size (limit to 2MB per photo to avoid localStorage quota issues)
          if (file.size > 2 * 1024 * 1024) {
            alert(`${file.name} is too large. Please use images under 2MB.`);
            return null;
          }

          // Convert to base64 for storage
          const base64 = await convertFileToBase64(file);

          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: base64, // Store as base64 data URL
            name: file.name,
            date: new Date().toISOString(),
            timestamp: Date.now(),
            ideaTag: uploadIdeaTag || null
          };
        })
      );

      // Filter out null values (failed conversions)
      const validPhotos = newPhotos.filter(photo => photo !== null);

      if (validPhotos.length > 0) {
        setPhotos((prev) => [...validPhotos, ...prev]);
      }
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('Error uploading photos. Please try again.');
    }

    event.target.value = '';
    setUploadIdeaTag(null);
    setZoomLevel(1);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setPhotos(photos.filter(p => p.id !== id));
    }
  };

  const getPhotosByMonth = () => {
    const grouped = {};
    photos.forEach(photo => {
      const date = new Date(photo.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(photo);
    });
    return grouped;
  };

  const triggerUpload = (ideaTag = null) => {
    setUploadIdeaTag(ideaTag);
    fileInputRef.current?.click();
  };

  const renderGrid = () => {
    if (photos.length === 0) {
      return (
        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
          <div className="empty-icon">📷</div>
          <h3>No Photos Yet</h3>
          <p>Start capturing your baby's precious moments</p>
          <button className="btn btn-primary btn-large" onClick={triggerUpload}>
            <span>➕</span>
            <span>Upload Your First Photo</span>
          </button>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--spacing-md)',
        marginTop: 'var(--spacing-lg)'
      }}>
        {photos.map((photo) => (
          <div key={photo.id} style={{
            position: 'relative',
            aspectRatio: '1',
            background: 'var(--surface-variant)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            cursor: 'pointer'
          }}>
            <img
              src={photo.url}
              alt={photo.name || 'Photo'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onClick={() => {
                setZoomLevel(1);
                setSelectedPhoto(photo);
              }}
            />
            <button
              className="action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(photo.id);
              }}
              style={{
                position: 'absolute',
                top: 'var(--spacing-xs)',
                right: 'var(--spacing-xs)',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderByMonth = () => {
    const grouped = getPhotosByMonth();
    const months = Object.keys(grouped).sort().reverse();

    return (
      <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        <div
          style={{
            display: 'grid',
            gap: 'var(--spacing-lg)',
            gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))'
          }}
        >
          {ideasForAge.map((idea) => {
            const ideaPhotos = photos.filter((p) => p.ideaTag === idea.title);
            return (
              <div
                key={idea.title}
                className="card"
                style={{
                  padding: 'var(--spacing-lg)',
                  textAlign: 'left',
                  background: idea.color || 'var(--surface)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-sm)',
                  height: '360px'
                }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-16px', left: '-10px', width: '60px', height: '60px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                  <span style={{ fontSize: '1.3rem' }}>{idea.emoji || '🗓️'}</span>
                  <strong style={{ fontSize: '1rem' }}>{idea.title}</strong>
                </div>
                {idea.prompt && (
                  <p style={{ margin: 0, marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                    {idea.prompt}
                  </p>
                )}
                <div
                  style={{
                    marginTop: 'var(--spacing-sm)',
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    width: '100%',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: ideaPhotos.length ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (ideaPhotos.length) {
                      setZoomLevel(1);
                      setSelectedPhoto(ideaPhotos[0]);
                    }
                  }}
                  title={ideaPhotos.length ? 'Tap to view' : undefined}
                >
                  {ideaPhotos.length ? (
                    <img
                      src={ideaPhotos[0].url}
                      alt={ideaPhotos[0].name || 'Photo'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No upload yet</span>
                  )}
                </div>
                <button
                  className="btn btn-secondary"
                  style={{
                    marginTop: 'auto',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--spacing-2xs)',
                    background: 'rgba(255,255,255,0.5)',
                    color: 'var(--text)',
                    borderColor: 'rgba(255,255,255,0.6)',
                    fontSize: '0.95rem'
                  }}
                  onClick={() => triggerUpload(idea.title)}
                >
                  <span>➕</span>
                  <span>{idea.cta || 'Upload here'}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Photos by month</h3>
          {months.length === 0 ? (
            <div className="empty-state" style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div className="empty-icon">📷</div>
              <h3>No photos yet</h3>
              <p>Upload from any idea card above to start your timeline.</p>
            </div>
          ) : (
            months.map(monthKey => {
              const [year, month] = monthKey.split('-');
              const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              });
              return (
                <div key={monthKey} style={{ marginBottom: 'var(--spacing-xl)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-md)' }}>{monthName}</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 'var(--spacing-md)'
                  }}>
                    {grouped[monthKey].map((photo) => (
                      <div key={photo.id} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        background: 'var(--surface-variant)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}>
                        <img
                          src={photo.url}
                          alt={photo.name || 'Photo'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onClick={() => {
                            setZoomLevel(1);
                            setSelectedPhoto(photo);
                          }}
                        />
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(photo.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: 'var(--spacing-xs)',
                            right: 'var(--spacing-xs)',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📸 Photo Timeline</h1>
        <p className="page-subtitle">Capture and cherish your baby's precious moments</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={triggerUpload}>
          <span>➕</span>
          <span>Upload Photo</span>
        </button>
        <button
          className={`btn btn-secondary ${viewMode === 'grid' ? 'is-active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <span>📋</span>
          <span>Grid</span>
        </button>
        <button
          className={`btn btn-secondary ${viewMode === 'month' ? 'is-active' : ''}`}
          onClick={() => setViewMode('month')}
        >
          <span>📅</span>
          <span>By Month</span>
        </button>
      </div>

      <div className="page-meta">
        {photos.length > 0 && (
          <p>You have {photos.length} photo{photos.length !== 1 ? 's' : ''} saved.</p>
        )}
      </div>

      <div className="section-card">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
        {viewMode === 'grid' ? renderGrid() : renderByMonth()}
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)'
            }}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: 'pointer',
                padding: 'var(--spacing-sm)'
              }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.max(1, z - 0.2)); }}
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                −
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.min(3, z + 0.2)); }}
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                +
              </button>
            </div>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name || 'Photo'}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.15s ease',
                transformOrigin: 'center center'
              }}
            />
            {selectedPhoto.date && (
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: 0,
                color: 'white',
                fontSize: '14px'
              }}>
                {new Date(selectedPhoto.date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
