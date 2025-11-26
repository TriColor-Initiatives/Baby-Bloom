import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/pages.css';
import { useBaby } from '../contexts/BabyContext';

const STORAGE_KEY = 'baby-bloom-activities';

const activityIdeas = [
  { icon: '👶', title: 'Tummy Time', description: 'Help strengthen neck and back muscles', duration: '5-15 min', minMonths: 0, maxMonths: 8 },
  { icon: '📚', title: 'Story Time', description: 'Read board books to encourage language development', duration: '10-20 min', minMonths: 0, maxMonths: 24 },
  { icon: '🎵', title: 'Music and Dance', description: 'Play music and move together to develop rhythm', duration: '10-15 min', minMonths: 6, maxMonths: 24 },
  { icon: '🧩', title: 'Stacking Blocks', description: 'Build fine motor skills with soft blocks', duration: '10-20 min', minMonths: 7, maxMonths: 24 },
  { icon: '🪞', title: 'Mirror Play', description: 'Explore self-awareness with safe mirrors', duration: '5-10 min', minMonths: 3, maxMonths: 12 },
  { icon: '🎨', title: 'Sensory Bins', description: 'Explore textures with safe materials', duration: '15-30 min', minMonths: 6, maxMonths: 24 },
  { icon: '🔔', title: 'Rattle Play', description: 'Shake and explore cause and effect', duration: '5-10 min', minMonths: 0, maxMonths: 9 },
  { icon: '🎈', title: 'Ball Rolling', description: 'Track moving objects and develop hand-eye coordination', duration: '10-15 min', minMonths: 5, maxMonths: 18 },
];

const Activities = () => {
  const { activeBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: '🎨',
    duration: '',
    timestamp: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  // Load activities
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setActivities(Array.isArray(saved) ? saved : []);
    } catch {
      setActivities([]);
    }
  }, []);

  // Save activities
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openModal();
      searchParams.delete('add');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        title: activity.title || '',
        icon: activity.icon || '🎨',
        duration: activity.duration || '',
        timestamp: activity.timestamp ? new Date(activity.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        notes: activity.notes || ''
      });
    } else {
      setEditingActivity(null);
      setFormData({
        title: '',
        icon: '🎨',
        duration: '',
        timestamp: new Date().toISOString().slice(0, 16),
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter an activity title');
      return;
    }

    const activityData = {
      id: editingActivity ? editingActivity.id : Date.now(),
      title: formData.title.trim(),
      icon: formData.icon || '🎨',
      duration: formData.duration,
      timestamp: new Date(formData.timestamp).toISOString(),
      notes: formData.notes.trim()
    };

    if (editingActivity) {
      setActivities(activities.map(a => a.id === editingActivity.id ? activityData : a));
    } else {
      setActivities([activityData, ...activities]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this activity?')) {
      setActivities(activities.filter(a => a.id !== id));
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

  const selectIdea = (idea) => {
    setFormData({
      ...formData,
      title: idea.title,
      icon: idea.icon,
      duration: idea.duration
    });
    setIsIdeasOpen(false);
    setIsModalOpen(true);
  };

  const babyAgeInMonths = useMemo(() => {
    if (activeBaby?.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(activeBaby.dateOfBirth);
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
        (today.getMonth() - birthDate.getMonth());
      const days = today.getDate() - birthDate.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return months + Math.max(0, days) / daysInMonth;
    }

    if (typeof window !== 'undefined') {
      const stored = Number(localStorage.getItem('babyAgeMonths'));
      if (Number.isFinite(stored) && stored >= 0) {
        return stored;
      }
    }

    return null;
  }, [activeBaby]);

  const filteredIdeas = useMemo(() => {
    if (babyAgeInMonths === null) return activityIdeas;
    return activityIdeas.filter(({ minMonths = 0, maxMonths = Infinity }) => {
      return babyAgeInMonths >= minMonths && babyAgeInMonths <= maxMonths;
    });
  }, [babyAgeInMonths]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎨 Activities</h1>
        <p className="page-subtitle">Track playtime and learning activities</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => openModal()}>
          <span>➕</span>
          <span>Log Activity</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsIdeasOpen(true)}>
          <span>💡</span>
          <span>Activity Ideas</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="feeding-log">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Recent Activities</h3>
          {activities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3>No activities logged yet</h3>
              <p>Start tracking your baby's playtime and learning activities</p>
              <div className="empty-tips">
                <div className="empty-tip"><span>🎯</span><span>Track tummy time, reading, and play sessions</span></div>
                <div className="empty-tip"><span>⏱️</span><span>Monitor activity duration and engagement</span></div>
                <div className="empty-tip"><span>💡</span><span>Get activity ideas based on your baby's age</span></div>
              </div>
              <button className="btn btn-primary btn-large" onClick={() => openModal()}>
                <span>➕</span>
                <span>Log Your First Activity</span>
              </button>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="log-entry" style={{ borderLeftColor: 'var(--warning)' }}>
                <div className="log-entry-header">
                  <div className="log-entry-type">
                    <span className="log-entry-icon">{activity.icon || '🎨'}</span>
                    <span>{activity.title}</span>
                  </div>
                  <div className="log-entry-time">{getTimeAgo(activity.timestamp)}</div>
                </div>
                <div className="log-entry-details">
                  {activity.duration && (
                    <div className="log-entry-detail">
                      <span>⏱️</span>
                      <span>{activity.duration}</span>
                    </div>
                  )}
                  {activity.notes && (
                    <div className="log-entry-detail">
                      <span>📝</span>
                      <span>{activity.notes}</span>
                    </div>
                  )}
                </div>
                <div className="log-entry-actions">
                  <button onClick={() => openModal(activity)} className="btn-icon">✏️</button>
                  <button onClick={() => handleDelete(activity.id)} className="btn-icon">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="info-panel">
          <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--warning) 0%, var(--accent) 100%)' }}>
            <div className="tip-card-title">
              <span>💡</span>
              <span>Activity Suggestions</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Peek-a-boo games</div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Stacking blocks</div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Mirror play</div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>• Sensory bins</div>
              <div>• Reading board books</div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingActivity ? 'Edit Activity' : 'Log Activity'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="form-label">Activity Title *</label>
                <input
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Tummy Time"
                  required
                />
              </div>
              <div>
                <label className="form-label">Icon</label>
                <input
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="??"
                  maxLength="2"
                />
              </div>
              <div>
                <label className="form-label">Duration</label>
                <input
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 15 min"
                />
              </div>
              <div>
                <label className="form-label">Date & Time</label>
                <input
                  className="form-input"
                  style={{ fontSize: "0.95rem" }}
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  style={{ fontSize: "1rem" }}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about the activity"
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingActivity ? 'Save' : 'Log Activity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Ideas Modal */}
      {isIdeasOpen && (
        <div className="modal-overlay" onClick={() => setIsIdeasOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">💡 Activity Ideas</h3>
              <button className="modal-close" onClick={() => setIsIdeasOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                Tap on any activity idea to add it to your log
              </p>
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {filteredIdeas.length === 0 && (
                  <div
                    className="card"
                    style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    No age-appropriate ideas right now. Update your baby profile to see tailored suggestions.
                  </div>
                )}
                {filteredIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="card"
                    style={{
                      padding: 'var(--spacing-md)',
                      cursor: 'pointer',
                      border: '2px solid var(--border)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => selectIdea(idea)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <span style={{ fontSize: '2rem' }}>{idea.icon}</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>{idea.title}</h4>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          {idea.description}
                        </p>
                        <div style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                          ⏱️ {idea.duration}
                        </div>
                      </div>
                      <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
