import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBaby } from '../contexts/BabyContext';
import CustomSelect from '../components/onboarding/CustomSelect';
import '../styles/pages.css';

const STORAGE_KEY = 'baby-bloom-milestones';

// Predefined milestones by age
const MILESTONE_TEMPLATES = [
  { age: '6 months', title: 'Sitting without support', category: 'motor' },
  { age: '6 months', title: 'Rolling over both ways', category: 'motor' },
  { age: '6 months', title: 'Babbling consonants', category: 'language' },
  { age: '7 months', title: 'Responding to name', category: 'social' },
  { age: '7 months', title: 'Passing objects between hands', category: 'motor' },
  { age: '8 months', title: 'Crawling', category: 'motor' },
  { age: '8 months', title: 'Saying "mama" or "dada"', category: 'language' },
  { age: '9 months', title: 'Pulling to stand', category: 'motor' },
  { age: '9 months', title: 'Playing peek-a-boo', category: 'social' },
  { age: '10 months', title: 'Cruising along furniture', category: 'motor' },
  { age: '11 months', title: 'First steps', category: 'motor' },
  { age: '12 months', title: 'Walking independently', category: 'motor' },
  { age: '12 months', title: 'Saying first words', category: 'language' },
];

const Milestones = () => {
  const { activeBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [milestones, setMilestones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    age: '',
    category: 'motor',
    achieved: false,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    photo: null
  });

  // Load milestones from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMilestones(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
      setMilestones([]);
    }
  }, []);

  // Save milestones
  useEffect(() => {
    if (milestones.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [milestones]);

  // Auto-open modal
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsAddModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams]);

  const openModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        title: milestone.title,
        age: milestone.age,
        category: milestone.category || 'motor',
        achieved: milestone.achieved || false,
        date: milestone.date || new Date().toISOString().slice(0, 10),
        notes: milestone.notes || '',
        photo: milestone.photo || null
      });
    } else {
      setEditingMilestone(null);
      setFormData({
        title: '',
        age: '',
        category: 'motor',
        achieved: false,
        date: new Date().toISOString().slice(0, 10),
        notes: '',
        photo: null
      });
    }
    setIsModalOpen(true);
  };

  const openAddFromTemplate = () => {
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAddModalOpen(false);
    setEditingMilestone(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    const milestoneData = {
      id: editingMilestone ? editingMilestone.id : Date.now().toString(),
      title: formData.title.trim(),
      age: formData.age,
      category: formData.category,
      achieved: formData.achieved,
      date: formData.achieved ? formData.date : null,
      notes: formData.notes.trim(),
      photo: formData.photo
    };

    if (editingMilestone) {
      setMilestones(milestones.map(m => m.id === editingMilestone.id ? milestoneData : m));
    } else {
      setMilestones([milestoneData, ...milestones]);
    }

    closeModal();
  };

  const handleAddFromTemplate = (template) => {
    const milestoneData = {
      id: Date.now().toString(),
      ...template,
      achieved: false,
      date: null,
      notes: '',
      photo: null
    };
    setMilestones([milestoneData, ...milestones]);
    setIsAddModalOpen(false);
  };

  const handleToggleAchieved = (milestone) => {
    setMilestones(milestones.map(m =>
      m.id === milestone.id
        ? { ...m, achieved: !m.achieved, date: !m.achieved ? new Date().toISOString().slice(0, 10) : null }
        : m
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

const getTimeAgo = (date) => {
    if (!date) return 'Not achieved yet';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      motor: '🏃',
      language: '💬',
      social: '👥',
      cognitive: '🧠'
    };
    return icons[category] || '⭐';
  };

  const parseAgeMonths = (ageLabel) => {
    if (!ageLabel) return null;
    const match = ageLabel.match(/([0-9]+(?:\.[0-9]+)?)\s*month/i);
    return match ? Number(match[1]) : null;
  };

  const babyAgeMonths = useMemo(() => {
    if (!activeBaby?.dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const days = today.getDate() - birth.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return months + Math.max(0, days) / daysInMonth;
  }, [activeBaby]);

  const sortedTemplates = useMemo(() => {
    const withAge = MILESTONE_TEMPLATES.map((tpl, idx) => ({
      ...tpl,
      ageValue: parseAgeMonths(tpl.age),
      idx
    }));
    if (babyAgeMonths === null) {
      return withAge.sort((a, b) => (a.ageValue ?? Infinity) - (b.ageValue ?? Infinity));
    }
    return withAge
      .slice()
      .sort((a, b) => {
        const distA = Math.abs((a.ageValue ?? babyAgeMonths) - babyAgeMonths);
        const distB = Math.abs((b.ageValue ?? babyAgeMonths) - babyAgeMonths);
        if (distA === distB) return (a.ageValue ?? Infinity) - (b.ageValue ?? Infinity);
        return distA - distB;
      });
  }, [babyAgeMonths]);

  const displayedTemplates = useMemo(() => {
    if (babyAgeMonths === null) return sortedTemplates;
    const currentMonth = Math.max(0, Math.round(babyAgeMonths));
    const exact = sortedTemplates.filter((tpl) =>
      tpl.ageValue !== null ? Math.round(tpl.ageValue) === currentMonth : false
    );
    if (exact.length) return exact;
    // Fallback: closest three by distance
    return sortedTemplates
      .slice()
      .sort((a, b) => {
        const distA = Math.abs((a.ageValue ?? babyAgeMonths) - babyAgeMonths);
        const distB = Math.abs((b.ageValue ?? babyAgeMonths) - babyAgeMonths);
        return distA - distB;
      })
      .slice(0, 3);
  }, [babyAgeMonths, sortedTemplates]);

  const achievedCount = milestones.filter(m => m.achieved).length;
  const totalCount = milestones.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⭐ Milestones</h1>
        <p className="page-subtitle">Track your baby's developmental achievements</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={openAddFromTemplate}>
          <span>➕</span>
          <span>Add Milestone</span>
        </button>
        <button className="btn btn-secondary" onClick={() => openModal()}>
          <span>✏️</span>
          <span>Custom Milestone</span>
        </button>
      </div>

      {totalCount > 0 && (
        <div className="info-panel" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="info-card">
            <div className="info-card-title">
              <span>📊</span>
              <span>Progress</span>
            </div>
            <div className="info-item">
              <div className="info-item-label">Achieved</div>
              <div className="info-item-value">{achievedCount} / {totalCount}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Completion</div>
              <div className="info-item-value">
                {totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
          Developmental Milestones ({totalCount})
        </h3>
        {milestones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>No Milestones Yet</h3>
            <p>Start tracking your baby's developmental achievements</p>
            <button className="btn btn-primary btn-large" onClick={openAddFromTemplate}>
              <span>➕</span>
              <span>Add Your First Milestone</span>
            </button>
          </div>
        ) : (
          milestones.map((milestone) => (
            <div key={milestone.id} className="log-entry" style={{
              borderLeftColor: milestone.achieved ? 'var(--success)' : 'var(--text-tertiary)',
              opacity: milestone.achieved ? 1 : 0.8
            }}>
              <div className="log-entry-header">
                <div className="log-entry-type">
                  <span className="log-entry-icon">
                    {milestone.achieved ? '✅' : '⏳'}
                  </span>
                  <span>{milestone.title}</span>
                </div>
                <div className="log-entry-time">
                  {milestone.achieved ? getTimeAgo(milestone.date) : milestone.age}
                </div>
              </div>
              <div className="log-entry-details">
                <div className="log-entry-detail">
                  <span>{getCategoryIcon(milestone.category)}</span>
                  <span style={{ textTransform: 'capitalize' }}>{milestone.category}</span>
                </div>
                {milestone.achieved && milestone.date && (
                  <div className="log-entry-detail">
                    <span>📅</span>
                    <span>{new Date(milestone.date).toLocaleDateString()}</span>
                  </div>
                )}
                {milestone.notes && (
                  <div className="log-entry-detail">
                    <span>📝</span>
                    <span>{milestone.notes}</span>
                  </div>
                )}
              </div>
              <div className="log-entry-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleToggleAchieved(milestone)}
                  title={milestone.achieved ? 'Mark as not achieved' : 'Mark as achieved'}
                >
                  {milestone.achieved ? '↩️' : '✅'}
                </button>
                <button
                  className="action-btn edit-btn"
                  onClick={() => openModal(milestone)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(milestone.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add from Template Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Milestone from Template</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div style={{ padding: 'var(--spacing-lg)', maxHeight: '60vh', overflowY: 'auto' }}>
              {displayedTemplates.map((template, idx) => {
                const exists = milestones.some(m => m.title === template.title);
                return (
                  <div
                    key={`${template.title}-${template.age}-${idx}`}
                    className="log-entry"
                    style={{
                      marginBottom: 'var(--spacing-md)',
                      opacity: exists ? 0.5 : 1,
                      cursor: exists ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => !exists && handleAddFromTemplate(template)}
                  >
                    <div className="log-entry-header">
                      <div className="log-entry-type">
                        <span className="log-entry-icon">{getCategoryIcon(template.category)}</span>
                        <span>{template.title}</span>
                      </div>
                      <div className="log-entry-time">{template.age}</div>
                    </div>
                    {exists && (
                      <div style={{ padding: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                        Already added
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMilestone ? 'Edit Milestone' : 'Create Custom Milestone'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-lg)' }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g., First word"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="text"
                    placeholder="e.g., 8 months"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                <label>Category</label>
                <CustomSelect
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={[
                    { value: 'motor', label: '🏃 Motor' },
                    { value: 'language', label: '💬 Language' },
                    { value: 'social', label: '👥 Social' },
                    { value: 'cognitive', label: '🧠 Cognitive' },
                  ]}
                  placeholder="Select category"
                />
              </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.achieved}
                    onChange={(e) => setFormData({ ...formData, achieved: e.target.checked })}
                  />
                  {' '}Mark as achieved
                </label>
              </div>

              {formData.achieved && (
                <div className="form-group">
                  <label>Achieved Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Add any notes about this milestone..."
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
                  {editingMilestone ? 'Update' : 'Create'} Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Milestones;
