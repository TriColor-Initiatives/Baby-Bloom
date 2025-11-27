import { useState, useRef, useEffect, useMemo } from 'react';
import { useBaby } from '../contexts/BabyContext';
import { useAuth } from '../contexts/AuthContext';
import { uploadPhoto, subscribeToPhotos, deletePhoto } from '../services/photoService';

// Monthly photo ideas based on baby's age
const MONTHLY_IDEAS = [
  {
    title: 'First Smiles',
    emoji: '😊',
    prompt: 'Capture those precious early smiles',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 100%)',
    minMonths: 0,
    maxMonths: 3
  },
  {
    title: 'Tummy Time',
    emoji: '🔄',
    prompt: 'Document tummy time progress',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #E0BBE4 0%, #D291BC 100%)',
    minMonths: 1,
    maxMonths: 6
  },
  {
    title: 'Rolling Over',
    emoji: '🎯',
    prompt: 'Milestone: Rolling over!',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #B4E5FF 0%, #87CEEB 100%)',
    minMonths: 3,
    maxMonths: 6
  },
  {
    title: 'Sitting Up',
    emoji: '🧘',
    prompt: 'Baby sitting independently',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%)',
    minMonths: 4,
    maxMonths: 8
  },
  {
    title: 'Crawling',
    emoji: '🐛',
    prompt: 'On the move! Crawling adventures',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
    minMonths: 6,
    maxMonths: 10
  },
  {
    title: 'Standing',
    emoji: '🧍',
    prompt: 'Pulling up and standing',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #FFE5E5 0%, #FFB6C1 100%)',
    minMonths: 7,
    maxMonths: 12
  },
  {
    title: 'First Foods',
    emoji: '🍎',
    prompt: 'Exploring new foods',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
    minMonths: 4,
    maxMonths: 12
  },
  {
    title: 'Playtime',
    emoji: '🧸',
    prompt: 'Fun play moments',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    minMonths: 0,
    maxMonths: 12
  },
  {
    title: 'Bath Time',
    emoji: '🛁',
    prompt: 'Splish splash fun',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)',
    minMonths: 0,
    maxMonths: 12
  },
  {
    title: 'Sleeping',
    emoji: '😴',
    prompt: 'Peaceful sleep moments',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #C5CAE9 0%, #9FA8DA 100%)',
    minMonths: 0,
    maxMonths: 12
  },
  {
    title: 'Family Time',
    emoji: '👨‍👩‍👧',
    prompt: 'Precious family moments',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #FFCCBC 0%, #FFAB91 100%)',
    minMonths: 0,
    maxMonths: 24
  },
  {
    title: 'Outdoor Adventures',
    emoji: '🌳',
    prompt: 'Exploring the world outside',
    cta: 'Upload here',
    color: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
    minMonths: 3,
    maxMonths: 24
  }
];

const Photos = () => {
  const { activeBaby } = useBaby();
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const fileInputRef = useRef(null);
  const [uploadIdeaTag, setUploadIdeaTag] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    if (babyAgeMonths === null) return MONTHLY_IDEAS.slice(0, 3);

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

  // Load photos from Firebase on mount
  useEffect(() => {
    if (!user?.uid) {
      setPhotos([]);
      return;
    }

    const unsubscribe = subscribeToPhotos(user.uid, (loadedPhotos) => {
      setPhotos(loadedPhotos);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user]);

  const handleFiles = async (event) => {
    const pickedFiles = Array.from(event.target.files || []);
    if (!pickedFiles.length) return;

    if (!user?.uid) {
      alert('Please log in to upload photos.');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = pickedFiles.map(async (file) => {
        // Check file size (limit to 5MB per photo for Firebase Storage)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Please use images under 5MB.`);
          return null;
        }

        try {
          const photoData = await uploadPhoto(
            file,
            user.uid,
            activeBaby?.id || null,
            { ideaTag: uploadIdeaTag || null }
          );
          return photoData;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          alert(`Failed to upload ${file.name}. Please try again.`);
          return null;
        }
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      const validPhotos = uploadedPhotos.filter(photo => photo !== null);

      if (validPhotos.length > 0) {
        // Photos are automatically added via the Firebase subscription
        // No need to manually update state
      }
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('Error uploading photos. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
      setUploadIdeaTag(null);
      setZoomLevel(1);
    }
  };

  const handleDelete = async (photoId, storagePath) => {
    if (!user?.uid) {
      alert('Please log in to delete photos.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto(photoId, user.uid, storagePath);
        // Photo will be automatically removed via Firebase subscription
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Failed to delete photo. Please try again.');
      }
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
    if (!user?.uid) {
      alert('Please log in to upload photos.');
      return;
    }
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
          <button className="btn btn-primary btn-large" onClick={triggerUpload} disabled={uploading}>
            <span>➕</span>
            <span>{uploading ? 'Uploading...' : 'Upload Your First Photo'}</span>
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
                handleDelete(photo.id, photo.storagePath);
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
                  disabled={uploading}
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
                            handleDelete(photo.id, photo.storagePath);
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
        <button className="btn btn-primary" onClick={triggerUpload} disabled={uploading}>
          <span>➕</span>
          <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
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
