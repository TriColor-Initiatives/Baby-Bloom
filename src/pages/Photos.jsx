import '../styles/pages.css';
import { useState, useRef, useEffect } from 'react';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const uploadedUrlsRef = useRef([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    return () => {
      uploadedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (event) => {
    const pickedFiles = Array.from(event.target.files || []);
    if (!pickedFiles.length) return;
    const newPhotos = pickedFiles.map((file) => {
      const url = URL.createObjectURL(file);
      uploadedUrlsRef.current.push(url);
      return { id: `${file.name}-${url}`, url };
    });
    setPhotos((prev) => [...newPhotos, ...prev]);
    event.target.value = '';
  };

  const placeholders = [1, 2, 3, 4, 5, 6];

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
          className={`btn btn-secondary ${viewMode === 'month' ? 'is-active' : ''}`}
          onClick={() => setViewMode('month')}
        >
          <span>📅</span>
          <span>By Month</span>
        </button>
        <button
          className={`btn btn-secondary ${viewMode === 'milestones' ? 'is-active' : ''}`}
          onClick={() => setViewMode('milestones')}
        >
          <span>⭐</span>
          <span>Milestones</span>
        </button>
      </div>

      <div className="page-meta">
        {viewMode === 'grid' && <p>Showing your latest uploads.</p>}
        {viewMode === 'month' && <p>Grouped by month (coming soon).</p>}
        {viewMode === 'milestones' && <p>Milestone highlights (coming soon).</p>}
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
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-lg)'
        }}>
          {photos.length > 0
            ? photos.map((photo) => (
              <div key={photo.id} style={{
                aspectRatio: '1',
                background: 'var(--surface-variant)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img src={photo.url} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))
            : placeholders.map((item) => (
              <div key={item} style={{
                aspectRatio: '1',
                background: 'var(--surface-variant)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                📷
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Photos;
