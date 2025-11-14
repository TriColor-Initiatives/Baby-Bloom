import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GrowthCharts from '../components/health/GrowthCharts';
import '../styles/pages.css';

const Growth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    weight: '',
    height: '',
    headCircumference: '',
    notes: ''
  });

  // Load health records from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('baby-bloom-health') || '[]');
      setRecords(Array.isArray(saved) ? saved : []);
    } catch {
      setRecords([]);
    }
  }, []);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsMeasurementModalOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openMeasurementModal = () => {
    setFormData({
      date: new Date().toISOString().slice(0, 16),
      weight: '',
      height: '',
      headCircumference: '',
      notes: ''
    });
    setIsMeasurementModalOpen(true);
  };

  const closeMeasurementModal = () => {
    setIsMeasurementModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recordData = {
      id: Date.now(),
      type: 'checkup',
      title: 'Growth Measurement',
      date: new Date(formData.date).toISOString(),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : null,
      notes: formData.notes || ''
    };

    const updatedRecords = [recordData, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('baby-bloom-health', JSON.stringify(updatedRecords));
    
    closeMeasurementModal();
  };

  // Get growth records (only those with measurements) and sort by date (newest first)
  const growthRecords = records
    .filter(r => r.weight || r.height || r.headCircumference)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get latest measurements
  const latestRecord = growthRecords.length > 0 ? growthRecords[0] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📏 Growth Tracking</h1>
        <p className="page-subtitle">Monitor your baby's physical development</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={openMeasurementModal}>
          <span>➕</span>
          <span>Add Measurement</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsChartsOpen(true)}>
          <span>📊</span>
          <span>View Charts</span>
        </button>
      </div>

      <div className="section-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Latest Measurements</h3>
        {latestRecord ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
            {latestRecord.weight && (
              <div className="info-item">
                <div className="info-item-label">Weight</div>
                <div className="info-item-value">{latestRecord.weight} kg</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                  {new Date(latestRecord.date).toLocaleDateString()}
                </div>
              </div>
            )}
            {latestRecord.height && (
              <div className="info-item">
                <div className="info-item-label">Height</div>
                <div className="info-item-value">{latestRecord.height} cm</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                  {new Date(latestRecord.date).toLocaleDateString()}
                </div>
              </div>
            )}
            {latestRecord.headCircumference && (
              <div className="info-item">
                <div className="info-item-label">Head Circumference</div>
                <div className="info-item-value">{latestRecord.headCircumference} cm</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                  {new Date(latestRecord.date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📏</div>
            <h3>No measurements yet</h3>
            <p>Add your first growth measurement to start tracking</p>
            <button className="btn btn-primary btn-large" onClick={openMeasurementModal}>
              <span>➕</span>
              <span>Add Measurement</span>
            </button>
          </div>
        )}
      </div>

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Growth Chart</h3>
        <div style={{ 
          padding: 'var(--spacing-2xl)', 
          background: 'var(--surface-variant)', 
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>📈</div>
          <p style={{ color: 'var(--text-secondary)' }}>Growth chart visualization will appear here</p>
          {growthRecords.length > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsChartsOpen(true)}
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              <span>📊</span>
              <span>View Detailed Charts</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Measurement Modal */}
      {isMeasurementModalOpen && (
        <div className="modal-overlay" onClick={closeMeasurementModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Growth Measurement</h3>
              <button className="modal-close" onClick={closeMeasurementModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="form-label">Date & Time</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Weight (kg)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Height (cm)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 71"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Head Circumference (cm)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 45"
                  value={formData.headCircumference}
                  onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeMeasurementModal}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!formData.weight && !formData.height && !formData.headCircumference}
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Charts Modal */}
      {isChartsOpen && (
        <GrowthCharts records={records} onClose={() => setIsChartsOpen(false)} />
      )}
    </div>
  );
};

export default Growth;
