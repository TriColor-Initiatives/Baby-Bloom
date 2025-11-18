import { useState, useEffect, useMemo } from 'react';
import './AppointmentManager.css';

const createDefaultForm = () => {
  const now = new Date();
  return {
    id: null,
    type: 'checkup',
    doctor: '',
    location: '',
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    reason: '',
    notes: '',
    reminder: true,
  };
};

const AppointmentManager = ({ onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState(createDefaultForm());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('babyAppointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
      return;
    }

    const sample = [{
      id: Date.now(),
      type: 'checkup',
      doctor: 'Dr. Sarah Johnson',
      location: 'City Pediatric Clinic',
      date: new Date().toISOString().slice(0, 10),
      time: '10:00',
      reason: '6-month well-baby checkup',
      notes: 'Bring vaccination card',
      reminder: true,
    }];
    setAppointments(sample);
    localStorage.setItem('babyAppointments', JSON.stringify(sample));
  }, []);

  const saveAppointments = (next) => {
    setAppointments(next);
    localStorage.setItem('babyAppointments', JSON.stringify(next));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isEditing) {
      saveAppointments(appointments.map((apt) => (apt.id === formData.id ? formData : apt)));
    } else {
      saveAppointments([{ ...formData, id: Date.now() }, ...appointments]);
    }
    setFormData(createDefaultForm());
    setIsEditing(false);
  };

  const handleEdit = (appointment) => {
    setFormData(appointment);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this appointment?')) {
      saveAppointments(appointments.filter((apt) => apt.id !== id));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vaccination':
        return '💉';
      case 'specialist':
        return '🧑‍⚕️';
      case 'emergency':
        return '🚨';
      case 'followup':
        return '🔁';
      default:
        return '🩺';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'vaccination':
        return 'var(--primary)';
      case 'specialist':
        return 'var(--warning)';
      case 'emergency':
        return 'var(--error)';
      case 'followup':
        return 'var(--info)';
      default:
        return 'var(--success)';
    }
  };

  const formatDate = (date, time) => {
    const parsed = new Date(`${date}T${time}`);
    return parsed.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const sortedAppointments = useMemo(() => (
    [...appointments].sort(
      (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`),
    )
  ), [appointments]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const upcoming = [];
    const past = [];
    sortedAppointments.forEach((apt) => {
      const aptDate = new Date(`${apt.date}T00:00`);
      if (aptDate >= today) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    });
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [sortedAppointments, today]);

  const isModal = typeof onClose === 'function';
  const handleClose = () => {
    if (isModal) {
      onClose();
    }
  };

  const detailIcons = {
    date: '🗓️',
    doctor: '👩‍⚕️',
    location: '📍',
    notes: '📝',
  };

  const content = (
    <>
      {isModal && (
        <button className="close-btn appointment-close" onClick={handleClose} aria-label="Close">
          ×
        </button>
      )}

      <div className="appointment-content">
        <div className="appointment-form-section appointment-panel">
          <h3>{isEditing ? 'Edit appointment' : 'Schedule new appointment'}</h3>

          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-group">
              <label>Appointment Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="checkup">🩺 Well-baby checkup</option>
                <option value="vaccination">💉 Vaccination</option>
                <option value="specialist">🧑‍⚕️ Specialist visit</option>
                <option value="followup">🔁 Follow-up</option>
                <option value="emergency">🚨 Emergency</option>
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
              <label>Doctor / Provider *</label>
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
              <label>Reason for visit</label>
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
                placeholder="Additional notes or questions"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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

            <div className="form-actions appointment-actions">
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-secondary ghost"
                  onClick={() => { setFormData(createDefaultForm()); setIsEditing(false); }}
                >
                  Cancel edit
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update appointment' : 'Schedule appointment'}
              </button>
            </div>
          </form>
        </div>

        <div className="appointment-list-section appointment-panel">
          <h3>Upcoming Appointments ({upcomingAppointments.length})</h3>
          {upcomingAppointments.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming appointments scheduled</p>
            </div>
          ) : (
            <div className="appointment-list">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card" style={{ borderLeftColor: getTypeColor(apt.type) }}>
                  <div className="appointment-card-header">
                    <div className="appointment-type">
                      <span className="appointment-icon">{getTypeIcon(apt.type)}</span>
                      <span>{apt.reason || 'Appointment'}</span>
                    </div>
                    {apt.reminder && <span className="reminder-badge">Reminder</span>}
                  </div>

                  <div className="appointment-card-body">
                    <div className="appointment-detail">
                      <span className="detail-icon">{detailIcons.date}</span>
                      <div>
                        <p className="detail-label">Date & time</p>
                        <p>{formatDate(apt.date, apt.time)}</p>
                      </div>
                    </div>
                    <div className="appointment-detail">
                      <span className="detail-icon">{detailIcons.doctor}</span>
                      <div>
                        <p className="detail-label">Provider</p>
                        <p>{apt.doctor}</p>
                      </div>
                    </div>
                    <div className="appointment-detail">
                      <span className="detail-icon">{detailIcons.location}</span>
                      <div>
                        <p className="detail-label">Location</p>
                        <p>{apt.location}</p>
                      </div>
                    </div>
                    {apt.notes && (
                      <div className="appointment-detail">
                        <span className="detail-icon">{detailIcons.notes}</span>
                        <div>
                          <p className="detail-label">Notes</p>
                          <p>{apt.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="appointment-card-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(apt)}
                      className="btn-icon"
                      title="Edit appointment"
                      aria-label="Edit appointment"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(apt.id)}
                      className="btn-icon"
                      title="Delete appointment"
                      aria-label="Delete appointment"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pastAppointments.length > 0 && (
            <>
              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Past appointments ({pastAppointments.length})</h3>
              <div className="appointment-list">
                {pastAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="appointment-card past" style={{ borderLeftColor: getTypeColor(apt.type) }}>
                    <div className="appointment-card-header">
                      <div className="appointment-type">
                        <span className="appointment-icon">{getTypeIcon(apt.type)}</span>
                        <span>{apt.reason || 'Appointment'}</span>
                      </div>
                    </div>
                    <div className="appointment-card-body">
                      <div className="appointment-detail">
                        <span className="detail-icon">{detailIcons.date}</span>
                        <div>
                          <p className="detail-label">Date & time</p>
                          <p>{formatDate(apt.date, apt.time)}</p>
                        </div>
                      </div>
                      <div className="appointment-detail">
                        <span className="detail-icon">{detailIcons.doctor}</span>
                        <div>
                          <p className="detail-label">Provider</p>
                          <p>{apt.doctor}</p>
                        </div>
                      </div>
                    </div>
                    <div className="appointment-card-actions">
                      <button
                        type="button"
                        onClick={() => handleDelete(apt.id)}
                        className="btn-icon"
                        title="Delete appointment"
                        aria-label="Delete appointment"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  if (isModal) {
    return (
      <div className="modal-backdrop" onClick={handleClose}>
        <div className="appointment-modal" onClick={(event) => event.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-page">
      {content}
    </div>
  );
};

export default AppointmentManager;
