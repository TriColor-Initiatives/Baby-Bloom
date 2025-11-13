import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppointmentManager from '../components/health/AppointmentManager';
import VaccinationTracker from '../components/health/VaccinationTracker';
import GrowthTracker from '../components/health/GrowthTracker';
import MedicationManager from '../components/health/MedicationManager';
import SymptomLogger from '../components/health/SymptomLogger';
import GrowthCharts from '../components/health/GrowthCharts';
import HealthAnalytics from '../components/health/HealthAnalytics';
import HealthExport from '../components/health/HealthExport';
import EmergencyInfo from '../components/health/EmergencyInfo';
import '../styles/pages.css';
import './Health.css';

const Health = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isVaccinationsOpen, setIsVaccinationsOpen] = useState(false);
  const [isGrowthOpen, setIsGrowthOpen] = useState(false);
  const [isMedicationsOpen, setIsMedicationsOpen] = useState(false);
  const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    type: 'checkup',
    title: '',
    date: new Date().toISOString().slice(0, 16),
    weight: '',
    height: '',
    headCircumference: '',
    temperature: '',
    symptoms: '',
    medications: '',
    doctor: '',
    notes: ''
  });

  // Load records from localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('baby-bloom-health');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  // Save records
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('baby-bloom-health', JSON.stringify(records));
    }
  }, [records]);

  // Auto-open modal if 'add' parameter is present
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openModal();
      // Remove the parameter after opening
      setSearchParams({});
    }
  }, [searchParams]);

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        type: record.type,
        title: record.title,
        date: new Date(record.date).toISOString().slice(0, 16),
        weight: record.weight || '',
        height: record.height || '',
        headCircumference: record.headCircumference || '',
        temperature: record.temperature || '',
        symptoms: record.symptoms || '',
        medications: record.medications || '',
        doctor: record.doctor || '',
        notes: record.notes || ''
      });
    } else {
      setEditingRecord(null);
      setFormData({
        type: 'checkup',
        title: '',
        date: new Date().toISOString().slice(0, 16),
        weight: '',
        height: '',
        headCircumference: '',
        temperature: '',
        symptoms: '',
        medications: '',
        doctor: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const recordData = {
      id: editingRecord ? editingRecord.id : Date.now(),
      type: formData.type,
      title: formData.title,
      date: new Date(formData.date).toISOString(),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      headCircumference: formData.headCircumference ? parseFloat(formData.headCircumference) : null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      symptoms: formData.symptoms,
      medications: formData.medications,
      doctor: formData.doctor,
      notes: formData.notes
    };

    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? recordData : r));
    } else {
      setRecords([recordData, ...records]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // Show all records (no filtering)
  const filteredRecords = records;

  const getTypeIcon = (type) => {
    const icons = {
      checkup: '✅',
      illness: '🤒',
      medication: '💊',
      vaccination: '💉',
      symptom: '🩺'
    };
    return icons[type] || '📋';
  };

  const getTypeLabel = (type) => {
    const labels = {
      checkup: 'Check-up',
      illness: 'Illness',
      medication: 'Medication',
      vaccination: 'Vaccination',
      symptom: 'Symptom'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      checkup: 'var(--success)',
      illness: 'var(--error)',
      medication: 'var(--warning)',
      vaccination: 'var(--primary)',
      symptom: '#ec4899'
    };
    return colors[type] || 'var(--border)';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };


  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">💊 Health & Medical</h1>
        <p className="page-subtitle">Track health records, symptoms, and medications</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => openModal()}>
          <span>➕</span>
          <span>Add Record</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsAppointmentsOpen(true)}>
          <span>📅</span>
          <span>Appointments</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsVaccinationsOpen(true)}>
          <span>💉</span>
          <span>Vaccinations</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsGrowthOpen(true)}>
          <span>📏</span>
          <span>Growth</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsMedicationsOpen(true)}>
          <span>💊</span>
          <span>Medications</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsSymptomsOpen(true)}>
          <span>🩺</span>
          <span>Symptoms</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsChartsOpen(true)}>
          <span>📊</span>
          <span>Charts</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsAnalyticsOpen(true)}>
          <span>📈</span>
          <span>Analytics</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsExportOpen(true)}>
          <span>📥</span>
          <span>Export</span>
        </button>
        <button className="btn btn-secondary" onClick={() => setIsEmergencyOpen(true)}>
          <span>🚨</span>
          <span>Emergency</span>
        </button>
      </div>

      <div className="content-grid">
        <div className="feeding-log">
          <h3 style={{ marginBottom: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
            Health Records ({filteredRecords.length})
          </h3>

          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏥</div>
              <h3>No Health Records Yet</h3>
              <p>Start tracking your baby's health and medical information</p>

              <div className="empty-tips">
                <div className="empty-tip">
                  <span>📅</span>
                  <span>Log check-ups, vaccinations, and doctor visits</span>
                </div>
                <div className="empty-tip">
                  <span>💊</span>
                  <span>Track medications and monitor symptoms</span>
                </div>
                <div className="empty-tip">
                  <span>📈</span>
                  <span>Record growth measurements and development milestones</span>
                </div>
              </div>

              <button className="btn btn-primary btn-large" onClick={() => openModal()}>
                <span>➕</span>
                <span>Add Your First Health Record</span>
              </button>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div
                key={record.id}
                className="log-entry"
                style={{ borderLeftColor: getTypeColor(record.type) }}
              >
                <div className="log-entry-header">
                  <div className="log-entry-type">
                    <span className="log-entry-icon">{getTypeIcon(record.type)}</span>
                    <span>{record.title}</span>
                  </div>
                  <div className="log-entry-time">{formatDate(record.date)}</div>
                </div>

                <div className="log-entry-details">
                  {record.weight && (
                    <div className="log-entry-detail">
                      <span>⚖️</span>
                      <span>Weight: {record.weight} kg</span>
                    </div>
                  )}
                  {record.height && (
                    <div className="log-entry-detail">
                      <span>📏</span>
                      <span>Height: {record.height} cm</span>
                    </div>
                  )}
                  {record.headCircumference && (
                    <div className="log-entry-detail">
                      <span>⭕</span>
                      <span>Head: {record.headCircumference} cm</span>
                    </div>
                  )}
                  {record.temperature && (
                    <div className="log-entry-detail">
                      <span>🌡️</span>
                      <span>Temp: {record.temperature}°C</span>
                    </div>
                  )}
                  {record.symptoms && (
                    <div className="log-entry-detail">
                      <span>🩺</span>
                      <span>{record.symptoms}</span>
                    </div>
                  )}
                  {record.medications && (
                    <div className="log-entry-detail">
                      <span>�</span>
                      <span>{record.medications}</span>
                    </div>
                  )}
                  {record.doctor && (
                    <div className="log-entry-detail">
                      <span>👨‍⚕️</span>
                      <span>{record.doctor}</span>
                    </div>
                  )}
                  {record.notes && (
                    <div className="log-entry-detail">
                      <span>�</span>
                      <span>{record.notes}</span>
                    </div>
                  )}
                </div>

                <div className="log-entry-actions">
                  <button onClick={() => openModal(record)} className="btn-icon">✏️</button>
                  <button onClick={() => handleDelete(record.id)} className="btn-icon">�️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="info-panel">
          <div className="info-card">
            <div className="info-card-title">
              <span>📊</span>
              <span>Health Status</span>
            </div>
            <div className="info-item">
              <div className="info-item-label">Current Status</div>
              <div className="info-item-value" style={{ color: 'var(--success)' }}>Healthy</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Total Records</div>
              <div className="info-item-value">{records.length}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Last Record</div>
              <div className="info-item-value">
                {records.length > 0 ? formatDate(records[0].date) : 'N/A'}
              </div>
            </div>
          </div>

          <div className="tip-card" style={{ background: 'linear-gradient(135deg, var(--success) 30%, #6BC598 100%)' }}>
            <div className="tip-card-title">
              <span>💡</span>
              <span>Health Tip</span>
            </div>
            <p className="tip-card-text">
              Keep track of your baby's growth percentiles and discuss any concerns with your pediatrician. Regular checkups are important for early detection.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Record Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecord ? 'Edit Record' : 'Add Health Record'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="health-form">
              <div className="form-group">
                <label>Record Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="checkup">✅ Check-up</option>
                  <option value="illness">🤒 Illness</option>
                  <option value="medication">💊 Medication</option>
                  <option value="vaccination">💉 Vaccination</option>
                  <option value="symptom">🩺 Symptom</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g., 6-month checkup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              {(formData.type === 'checkup' || formData.type === 'illness') && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="8.5"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="71"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Head Circumference (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="45"
                        value={formData.headCircumference}
                        onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="36.5"
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {(formData.type === 'illness' || formData.type === 'symptom') && (
                <div className="form-group">
                  <label>Symptoms</label>
                  <input
                    type="text"
                    placeholder="e.g., Fever, cough, runny nose"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  />
                </div>
              )}

              {(formData.type === 'medication' || formData.type === 'illness') && (
                <div className="form-group">
                  <label>Medications</label>
                  <input
                    type="text"
                    placeholder="e.g., Paracetamol 5ml every 6 hours"
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Doctor/Healthcare Provider</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Smith"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Additional notes..."
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
                  {editingRecord ? 'Update' : 'Save'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Component Modals */}
      {isAppointmentsOpen && (
        <AppointmentManager onClose={() => setIsAppointmentsOpen(false)} />
      )}

      {isVaccinationsOpen && (
        <VaccinationTracker onClose={() => setIsVaccinationsOpen(false)} />
      )}

      {isGrowthOpen && (
        <GrowthTracker records={records} onClose={() => setIsGrowthOpen(false)} />
      )}

      {isMedicationsOpen && (
        <MedicationManager onClose={() => setIsMedicationsOpen(false)} />
      )}

      {isSymptomsOpen && (
        <SymptomLogger onClose={() => setIsSymptomsOpen(false)} />
      )}

      {isChartsOpen && (
        <GrowthCharts records={records} onClose={() => setIsChartsOpen(false)} />
      )}

      {isAnalyticsOpen && (
        <HealthAnalytics records={records} onClose={() => setIsAnalyticsOpen(false)} />
      )}

      {isExportOpen && (
        <HealthExport records={records} onClose={() => setIsExportOpen(false)} />
      )}

      {isEmergencyOpen && (
        <EmergencyInfo onClose={() => setIsEmergencyOpen(false)} />
      )}
    </div>
  );
};

export default Health;
