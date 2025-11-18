import { useState, useRef, useEffect } from 'react';
import '../styles/pages.css';

const STORAGE_KEY = 'baby-bloom-photos';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileInputRef = useRef(null);

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
            timestamp: Date.now()
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

  const triggerUpload = () => {
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
              onClick={() => setSelectedPhoto(photo)}
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

    if (months.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📷</div>
          <h3>No Photos Yet</h3>
          <p>Upload photos to see them organized by month</p>
        </div>
      );
    }

    return (
      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        {months.map(monthKey => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });
          return (
            <div key={monthKey} style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{monthName}</h3>
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
                      onClick={() => setSelectedPhoto(photo)}
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
        })}
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
              position: 'relative'
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
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name || 'Photo'}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain'
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
