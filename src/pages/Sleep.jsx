import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/pages.css';
import './sleep.css';

const Sleep = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sleeps, setSleeps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSleep, setEditingSleep] = useState(null);
  const [formData, setFormData] = useState({
    type: 'nap',
    startTime: new Date().toISOString().slice(0, 16),
    duration: '',
    quality: 'good',
    notes: ''
  });

  // Load sleep data
  useEffect(() => {
    const saved = localStorage.getItem('baby-bloom-sleep');
    if (saved) {
      setSleeps(JSON.parse(saved));
    }
  }, []);

  // Save sleep data
  useEffect(() => {
    if (sleeps.length > 0) {
      localStorage.setItem('baby-bloom-sleep', JSON.stringify(sleeps));
    } else {
      localStorage.removeItem('baby-bloom-sleep');
    }
  }, [sleeps]);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openModal();
      setSearchParams({});
    }
  }, [searchParams]);

  const openModal = (sleep = null) => {
    if (sleep) {
      setEditingSleep(sleep);
      setFormData({
        type: sleep.type,
        startTime: new Date(sleep.timestamp || sleep.date).toISOString().slice(0, 16),
        duration: sleep.duration,
        quality: sleep.quality,
        notes: sleep.notes || ''
      });
    } else {
      setEditingSleep(null);
      setFormData({
        type: 'nap',
        startTime: new Date().toISOString().slice(0, 16),
        duration: '',
        quality: 'good',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSleep(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const sleepData = {
      id: editingSleep ? editingSleep.id : Date.now(),
      type: formData.type,
      timestamp: new Date(formData.startTime).toISOString(),
      date: new Date(formData.startTime).toISOString(),
      duration: formData.duration,
      quality: formData.quality,
      notes: formData.notes
    };

    if (editingSleep) {
      setSleeps(sleeps.map(s => s.id === editingSleep.id ? sleepData : s));
    } else {
      setSleeps([sleepData, ...sleeps]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this sleep record?')) {
      setSleeps(sleeps.filter(s => s.id !== id));
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getTodaySleep = () => {
    const today = new Date().toDateString();
    return sleeps.filter(s => new Date(s.timestamp || s.date).toDateString() === today);
  };

  const calculateTotalSleep = () => {
    return getTodaySleep().reduce((total, sleep) => {
      if (sleep.duration) {
        const [hours, minutes] = sleep.duration.split(':').map(Number);
        return total + (hours || 0) + ((minutes || 0) / 60);
      }
      return total;
    }, 0).toFixed(1);
  };

  const todaySleep = getTodaySleep();

  const sleepLogs = [
    { id: 1, type: 'nap', icon: '💤', time: '3 hours ago', duration: '1h 30m', quality: 'Good' },
    { id: 2, type: 'night', icon: '🌙', time: 'Last night', duration: '9h 15m', quality: 'Excellent' },
    { id: 3, type: 'nap', icon: '💤', time: 'Yesterday 2PM', duration: '45m', quality: 'Fair' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">😴 Sleep Tracker</h1>
        <p className="page-subtitle">Monitor your baby's sleep patterns and quality</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => openModal()}>
          <span>➕</span>
          <span>Log Sleep</span>
        </button>
        <button className="btn btn-secondary">
          <span>📊</span>
          <span>Sleep Report</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="feeding-log">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Sleep Log ({sleeps.length})</h3>
          {sleeps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">😴</div>
              <h3>No Sleep Records Yet</h3>
              <p>Start tracking your baby's sleep patterns</p>

              <div className="empty-tips">
                <div className="empty-tip">
                  <span>🌙</span>
                  <span>Track naps and nighttime sleep</span>
                </div>
                <div className="empty-tip">
                  <span>⏰</span>
                  <span>Monitor sleep duration and quality</span>
                </div>
                <div className="empty-tip">
                  <span>📊</span>
                  <span>Identify patterns to improve sleep routines</span>
                </div>
              </div>

              <button className="btn btn-primary btn-large" onClick={() => setIsModalOpen(true)}>
                <span>➕</span>
                <span>Log Your First Sleep</span>
              </button>
            </div>
          ) : (
            sleeps.map((sleep) => (
              <div key={sleep.id} className="log-entry" style={{ borderLeftColor: 'var(--secondary)' }}>
                <div className="log-entry-header">
                  <div className="log-entry-type">
                    <span className="log-entry-icon">{sleep.type === 'nap' ? '💤' : '🌙'}</span>
                    <span>{sleep.type === 'nap' ? 'Nap' : 'Night Sleep'}</span>
                  </div>
                  <div className="log-entry-time">{getTimeAgo(sleep.timestamp || sleep.date)}</div>
                </div>
                <div className="log-entry-details">
                  <div className="log-entry-detail">
                    <span>⏱️</span>
                    <span>{sleep.duration}</span>
                  </div>
                  <div className="log-entry-detail">
                    <span>⭐</span>
                    <span style={{ textTransform: 'capitalize' }}>{sleep.quality}</span>
                  </div>
                  {sleep.notes && (
                    <div className="log-entry-detail">
                      <span>📝</span>
                      <span>{sleep.notes}</span>
                    </div>
                  )}
                </div>
                <div className="log-entry-actions">
                  <button onClick={() => openModal(sleep)} className="btn-icon">✏️</button>
                  <button onClick={() => handleDelete(sleep.id)} className="btn-icon">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="info-panel">
          <div className="info-card">
            <div className="info-card-title">
              <span>📊</span>
              <span>Today's Sleep</span>
            </div>
            <div className="info-item">
              <div className="info-item-label">Total Sleep</div>
              <div className="info-item-value">{calculateTotalSleep()}h</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Sleep Sessions</div>
              <div className="info-item-value">{todaySleep.length}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Last Sleep</div>
              <div className="info-item-value">
                {todaySleep.length > 0 ? getTimeAgo(todaySleep[0].timestamp || todaySleep[0].date) : 'No data'}
              </div>
            </div>
          </div>

          <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--secondary-light) 0%, var(--secondary) 100%)' }}>
            <div className="tip-card-title">
              <span>💡</span>
              <span>Sleep Tip</span>
            </div>
            <p className="tip-card-text">
              At 6-12 months, babies need 12-16 hours of sleep per day, including naps. Maintain a consistent bedtime routine to promote better sleep.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSleep ? 'Edit Sleep' : 'Log Sleep'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="sleep-form">
              <div className="form-group">
                <label>Sleep Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="nap">💤 Nap</option>
                  <option value="night">🌙 Night Sleep</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (HH:MM) *</label>
                <input
                  type="time"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sleep Quality</label>
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                >
                  <option value="excellent">⭐⭐⭐ Excellent</option>
                  <option value="good">⭐⭐ Good</option>
                  <option value="fair">⭐ Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Any observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSleep ? 'Update' : 'Save'} Sleep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sleep;
