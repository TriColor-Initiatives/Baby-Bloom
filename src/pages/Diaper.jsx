import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/pages.css';

const Diaper = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [diapers, setDiapers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'wet',
    timestamp: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('babyDiapers');
    if (saved) {
      setDiapers(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (diapers.length > 0) {
      localStorage.setItem('babyDiapers', JSON.stringify(diapers));
    }
  }, [diapers]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const diaperData = {
      id: Date.now(),
      type: formData.type,
      timestamp: new Date(formData.timestamp).toISOString(),
      date: new Date(formData.timestamp).toISOString(),
      notes: formData.notes
    };
    setDiapers([diaperData, ...diapers]);
    setIsModalOpen(false);
    setFormData({ type: 'wet', timestamp: new Date().toISOString().slice(0, 16), notes: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this diaper change?')) {
      setDiapers(diapers.filter(d => d.id !== id));
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

  const getTodayDiapers = () => {
    const today = new Date().toDateString();
    return diapers.filter(d => new Date(d.timestamp || d.date).toDateString() === today);
  };

  const todayDiapers = getTodayDiapers();
  const wetCount = todayDiapers.filter(d => d.type === 'wet').length;
  const dirtyCount = todayDiapers.filter(d => d.type === 'dirty' || d.type === 'both').length;

  const diaperLogs = [
    { id: 1, icon: '🧷', time: '1 hour ago', type: 'Wet', notes: 'Normal' },
    { id: 2, icon: '🧷', time: '4 hours ago', type: 'Both', notes: 'Changed before nap' },
    { id: 3, icon: '🧷', time: '7 hours ago', type: 'Dirty', notes: 'Normal consistency' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🧷 Diaper Tracker</h1>
        <p className="page-subtitle">Track diaper changes and monitor patterns</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <span>➕</span>
          <span>Log Change</span>
        </button>
        <button className="btn btn-secondary">
          <span>📊</span>
          <span>Weekly Report</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="feeding-log">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Diaper Changes ({diapers.length})</h3>
          {diapers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👶</div>
              <h3>No Diaper Changes Yet</h3>
              <p>Start tracking your baby's diaper changes</p>

              <div className="empty-tips">
                <div className="empty-tip">
                  <span>💧</span>
                  <span>Track wet, dirty, or combined changes</span>
                </div>
                <div className="empty-tip">
                  <span>📈</span>
                  <span>Monitor hydration and digestion</span>
                </div>
                <div className="empty-tip">
                  <span>⏱️</span>
                  <span>Keep track of diaper patterns throughout the day</span>
                </div>
              </div>

              <button className="btn btn-primary btn-large" onClick={() => setShowModal(true)}>
                <span>➕</span>
                <span>Log Your First Diaper Change</span>
              </button>
            </div>
          ) : (
            diapers.map((diaper) => (
              <div key={diaper.id} className="log-entry" style={{ borderLeftColor: 'var(--accent)' }}>
                <div className="log-entry-header">
                  <div className="log-entry-type">
                    <span className="log-entry-icon">🧷</span>
                    <span>Diaper Change - {diaper.type === 'both' ? 'Wet & Dirty' : diaper.type === 'wet' ? 'Wet' : 'Dirty'}</span>
                  </div>
                  <div className="log-entry-time">{getTimeAgo(diaper.timestamp || diaper.date)}</div>
                </div>
                {diaper.notes && (
                  <div className="log-entry-details">
                    <div className="log-entry-detail">
                      <span>📝</span>
                      <span>{diaper.notes}</span>
                    </div>
                  </div>
                )}
                <div className="log-entry-actions">
                  <button onClick={() => handleDelete(diaper.id)} className="btn-icon">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="info-panel">
          <div className="info-card">
            <div className="info-card-title">
              <span>📊</span>
              <span>Today's Summary</span>
            </div>
            <div className="info-item">
              <div className="info-item-label">Total Changes</div>
              <div className="info-item-value">{todayDiapers.length}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Wet Diapers</div>
              <div className="info-item-value">{wetCount}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Dirty Diapers</div>
              <div className="info-item-value">{dirtyCount}</div>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-card-title">
              <span>💡</span>
              <span>Diaper Tip</span>
            </div>
            <p className="tip-card-text">
              Babies 6-12 months typically need 5-7 diaper changes per day. Watch for signs of diaper rash and change promptly after bowel movements.
            </p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Diaper Change</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-lg)' }}>
              <div className="form-group">
                <label>Change Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="wet">💧 Wet Only</option>
                  <option value="dirty">💩 Dirty Only</option>
                  <option value="both">💧💩 Wet & Dirty</option>
                </select>
              </div>

              <div className="form-group">
                <label>Time *</label>
                <input
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  required
                />
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diaper;
