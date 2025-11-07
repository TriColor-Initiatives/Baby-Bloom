import { useState } from 'react';
import { useBaby } from '../contexts/BabyContext';
import './BabyProfileManager.css';

const BabyProfileManager = ({ onClose }) => {
  const { babies, activeBaby, addBaby, updateBaby, deleteBaby, switchBaby } = useBaby();
  const [showAddForm, setShowAddForm] = useState(babies.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'not-specified',
    bloodType: '',
    weight: '',
    height: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: 'not-specified',
      bloodType: '',
      weight: '',
      height: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      updateBaby(editingId, formData);
    } else {
      addBaby(formData);
    }
    
    resetForm();
  };

  const handleEdit = (baby) => {
    setFormData({
      name: baby.name,
      dateOfBirth: baby.dateOfBirth,
      gender: baby.gender,
      bloodType: baby.bloodType || '',
      weight: baby.weight || '',
      height: baby.height || ''
    });
    setEditingId(baby.id);
    setShowAddForm(true);
  };

  const handleDelete = (babyId) => {
    if (confirm('Are you sure you want to delete this baby profile? All associated data will be retained but marked as belonging to this baby.')) {
      deleteBaby(babyId);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years}y ${months}m`;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="baby-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="baby-profile-header">
          <h2>👶 Baby Profiles</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="baby-profile-content">
          {babies.length > 0 && !showAddForm && (
            <>
              <div className="babies-grid">
                {babies.map(baby => (
                  <div
                    key={baby.id}
                    className={`baby-card ${activeBaby?.id === baby.id ? 'active' : ''}`}
                  >
                    <div className="baby-card-header">
                      <div className="baby-avatar">
                        {baby.photo ? (
                          <img src={baby.photo} alt={baby.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {baby.gender === 'male' && '👦'}
                            {baby.gender === 'female' && '👧'}
                            {baby.gender === 'not-specified' && '👶'}
                          </div>
                        )}
                      </div>
                      <div className="baby-info">
                        <h3>{baby.name}</h3>
                        <p className="baby-age">{calculateAge(baby.dateOfBirth)}</p>
                      </div>
                    </div>

                    <div className="baby-details">
                      <div className="detail-row">
                        <span className="detail-label">Birthday:</span>
                        <span className="detail-value">
                          {new Date(baby.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                      {baby.bloodType && (
                        <div className="detail-row">
                          <span className="detail-label">Blood Type:</span>
                          <span className="detail-value">{baby.bloodType}</span>
                        </div>
                      )}
                    </div>

                    <div className="baby-card-actions">
                      {activeBaby?.id !== baby.id && (
                        <button
                          className="btn-switch"
                          onClick={() => switchBaby(baby.id)}
                        >
                          Switch to {baby.name}
                        </button>
                      )}
                      {activeBaby?.id === baby.id && (
                        <div className="active-badge">✓ Active</div>
                      )}
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(baby)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {babies.length > 1 && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(baby.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn-add-baby"
                onClick={() => setShowAddForm(true)}
              >
                ➕ Add Another Baby
              </button>
            </>
          )}

          {showAddForm && (
            <div className="baby-form-container">
              <h3>{editingId ? 'Edit Baby Profile' : 'Add New Baby'}</h3>
              <form onSubmit={handleSubmit} className="baby-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Baby's name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="not-specified">Prefer not to say</option>
                    <option value="male">Boy</option>
                    <option value="female">Girl</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="weight">Birth Weight (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="3.5"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="height">Birth Height (cm)</label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      step="0.1"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bloodType">Blood Type</label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                  >
                    <option value="">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-actions">
                  {babies.length > 0 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update Profile' : 'Add Baby'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BabyProfileManager;
