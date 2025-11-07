import React, { useState, useEffect } from 'react';
import './AppointmentManager.css';

const AppointmentManager = ({ onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    type: 'checkup',
    doctor: '',
    location: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    reminder: true
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('babyAppointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    } else {
      // Sample data
      const sampleAppointments = [
        {
          id: Date.now(),
          type: 'checkup',
          doctor: 'Dr. Sarah Johnson',
          location: 'City Pediatric Clinic',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00',
          reason: '6-month well-baby checkup',
          notes: 'Bring vaccination card',
          reminder: true
        }
      ];
      setAppointments(sampleAppointments);
      localStorage.setItem('babyAppointments', JSON.stringify(sampleAppointments));
    }
  }, []);

  const saveAppointments = (updatedAppointments) => {
    setAppointments(updatedAppointments);
    localStorage.setItem('babyAppointments', JSON.stringify(updatedAppointments));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      const updated = appointments.map(apt =>
        apt.id === formData.id ? formData : apt
      );
      saveAppointments(updated);
    } else {
      const newAppointment = {
        ...formData,
        id: Date.now()
      };
      saveAppointments([newAppointment, ...appointments]);
    }
    
    resetForm();
  };

  const handleEdit = (appointment) => {
    setFormData(appointment);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this appointment?')) {
      saveAppointments(appointments.filter(apt => apt.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      type: 'checkup',
      doctor: '',
      location: '',
      date: '',
      time: '',
      reason: '',
      notes: '',
      reminder: true
    });
    setIsEditing(false);
  };

  const getTypeIcon = (type) => {
    const icons = {
      checkup: '✅',
      vaccination: '💉',
      specialist: '👨‍⚕️',
      emergency: '🚨',
      followup: '🔄'
    };
    return icons[type] || '📅';
  };

  const getTypeColor = (type) => {
    const colors = {
      checkup: 'var(--success)',
      vaccination: 'var(--primary)',
      specialist: 'var(--warning)',
      emergency: 'var(--error)',
      followup: 'var(--info)'
    };
    return colors[type] || 'var(--text-secondary)';
  };

  const formatDate = (date, time) => {
    const d = new Date(date);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return `${d.toLocaleDateString('en-US', options)} at ${time}`;
  };

  const isUpcoming = (date) => {
    return new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)
  );

  const upcomingAppointments = sortedAppointments.filter(apt => isUpcoming(apt.date));
  const pastAppointments = sortedAppointments.filter(apt => !isUpcoming(apt.date));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="appointment-header">
          <h2>📅 Appointment Manager</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="appointment-content">
          <div className="appointment-form-section">
            <h3>{isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}</h3>
            
            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-group">
                <label>Appointment Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="checkup">✅ Well-Baby Checkup</option>
                  <option value="vaccination">💉 Vaccination</option>
                  <option value="specialist">👨‍⚕️ Specialist Visit</option>
                  <option value="followup">🔄 Follow-up</option>
                  <option value="emergency">🚨 Emergency Visit</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Doctor/Healthcare Provider *</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Sarah Johnson"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  placeholder="e.g., City Pediatric Clinic"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason for Visit</label>
                <input
                  type="text"
                  placeholder="e.g., 6-month well-baby checkup"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Additional notes (e.g., bring vaccination card, questions to ask)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                  />
                  <span>Send reminder notification</span>
                </label>
              </div>

              <div className="form-actions">
                {isEditing && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update' : 'Schedule'} Appointment
                </button>
              </div>
            </form>
          </div>

          <div className="appointment-list-section">
            <h3>Upcoming Appointments ({upcomingAppointments.length})</h3>
            {upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No upcoming appointments scheduled</p>
              </div>
            ) : (
              <div className="appointment-list">
                {upcomingAppointments.map(apt => (
                  <div key={apt.id} className="appointment-card" style={{ borderLeftColor: getTypeColor(apt.type) }}>
                    <div className="appointment-card-header">
                      <div className="appointment-type">
                        <span className="appointment-icon">{getTypeIcon(apt.type)}</span>
                        <span>{apt.reason || 'Appointment'}</span>
                      </div>
                      {apt.reminder && <span className="reminder-badge">🔔</span>}
                    </div>
                    
                    <div className="appointment-card-body">
                      <div className="appointment-detail">
                        <span>📅</span>
                        <span>{formatDate(apt.date, apt.time)}</span>
                      </div>
                      <div className="appointment-detail">
                        <span>👨‍⚕️</span>
                        <span>{apt.doctor}</span>
                      </div>
                      <div className="appointment-detail">
                        <span>📍</span>
                        <span>{apt.location}</span>
                      </div>
                      {apt.notes && (
                        <div className="appointment-detail">
                          <span>📝</span>
                          <span>{apt.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="appointment-card-actions">
                      <button onClick={() => handleEdit(apt)} className="btn-icon">✏️</button>
                      <button onClick={() => handleDelete(apt.id)} className="btn-icon">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pastAppointments.length > 0 && (
              <>
                <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Past Appointments ({pastAppointments.length})</h3>
                <div className="appointment-list">
                  {pastAppointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="appointment-card past" style={{ borderLeftColor: getTypeColor(apt.type) }}>
                      <div className="appointment-card-header">
                        <div className="appointment-type">
                          <span className="appointment-icon">{getTypeIcon(apt.type)}</span>
                          <span>{apt.reason || 'Appointment'}</span>
                        </div>
                      </div>
                      
                      <div className="appointment-card-body">
                        <div className="appointment-detail">
                          <span>📅</span>
                          <span>{formatDate(apt.date, apt.time)}</span>
                        </div>
                        <div className="appointment-detail">
                          <span>👨‍⚕️</span>
                          <span>{apt.doctor}</span>
                        </div>
                      </div>

                      <div className="appointment-card-actions">
                        <button onClick={() => handleDelete(apt.id)} className="btn-icon">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManager;
