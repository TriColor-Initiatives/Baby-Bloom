import { useMemo, useState, useEffect } from 'react';
import { useBaby } from '../../contexts/BabyContext';
import { scheduleReminder, cancelReminder } from '../../services/notificationService';
import { syncVaccinationReminders } from '../../services/reminderSyncService';
import './VaccinationTracker.css';

const vaccinesSchedule = [
  { ageLabel: 'Birth', months: 0, name: 'Hepatitis B', dose: '1st dose' },
  { ageLabel: '2 months', months: 2, name: 'DTaP, IPV, Hib, PCV, RV', dose: '1st dose' },
  { ageLabel: '4 months', months: 4, name: 'DTaP, IPV, Hib, PCV, RV', dose: '2nd dose' },
  { ageLabel: '6 months', months: 6, name: 'DTaP, Hib, PCV, RV', dose: '3rd dose' },
  { ageLabel: '12 months', months: 12, name: 'MMR, Varicella, Hep A', dose: '1st dose' },
];

const getStatusIcon = (status) => {
  if (status === 'completed') return '✅';
  return '⏳';
};

const STORAGE_KEY = 'baby-bloom-vaccinations';

const VaccinationTracker = ({ onClose }) => {
  const { activeBaby } = useBaby();
  const [completedVaccines, setCompletedVaccines] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (error) {
      console.error('Failed to parse stored vaccinations', error);
      return {};
    }
  });

  const babyAgeInMonths = useMemo(() => {
    if (!activeBaby?.dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(activeBaby.dateOfBirth);
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
      (today.getMonth() - birthDate.getMonth());
    const days = today.getDate() - birthDate.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return months + Math.max(0, days) / daysInMonth;
  }, [activeBaby]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedVaccines));
    scheduleVaccinationReminders();

    // Sync to reminders page
    if (activeBaby?.dateOfBirth) {
      const vaccines = vaccinesSchedule.map((vaccine) => {
        const id = `${vaccine.name}-${vaccine.dose}`;
        const isCompleted = !!completedVaccines[id];
        let status = 'pending';
        if (!isCompleted && babyAgeInMonths >= vaccine.months - 0.5) {
          status = 'upcoming';
        }
        if (isCompleted) {
          status = 'completed';
        }
        return { ...vaccine, status, id };
      });
      syncVaccinationReminders(vaccines, activeBaby.dateOfBirth);
    }
  }, [completedVaccines, activeBaby, babyAgeInMonths]);

  const scheduleVaccinationReminders = () => {
    if (!activeBaby?.dateOfBirth) return;

    // Cancel all existing vaccination reminders
    vaccinesSchedule.forEach(vaccine => {
      const id = `${vaccine.name}-${vaccine.dose}`;
      cancelReminder(`vaccination-${id}`);
    });

    const birthDate = new Date(activeBaby.dateOfBirth);
    const today = new Date();

    vaccinesSchedule.forEach(vaccine => {
      const id = `${vaccine.name}-${vaccine.dose}`;
      const isCompleted = !!completedVaccines[id];

      // Skip if already completed
      if (isCompleted) return;

      // Calculate due date (baby's birth date + vaccine months)
      const dueDate = new Date(birthDate);
      dueDate.setMonth(dueDate.getMonth() + vaccine.months);

      // Only schedule if due date is in the future
      if (dueDate <= today) return;

      // Schedule reminder 1 week before due date
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 7);

      // Only schedule if reminder date is in the future
      if (reminderDate <= today) {
        // If less than 7 days away, schedule for 1 day before
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        if (oneDayBefore > today) {
          scheduleReminder({
            id: `vaccination-${id}`,
            title: `💉 Upcoming Vaccination: ${vaccine.name}`,
            dueAt: oneDayBefore.toISOString(),
            body: `${vaccine.name} (${vaccine.dose}) is due soon. Schedule with your pediatrician.`,
            icon: '💉',
            category: 'vaccination'
          });
        }
      } else {
        scheduleReminder({
          id: `vaccination-${id}`,
          title: `💉 Upcoming Vaccination: ${vaccine.name}`,
          dueAt: reminderDate.toISOString(),
          body: `${vaccine.name} (${vaccine.dose}) is due in 1 week. Schedule with your pediatrician.`,
          icon: '💉',
          category: 'vaccination'
        });
      }
    });
  };

  const toggleVaccine = (id) => {
    setCompletedVaccines((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  };

  const handleStatusKey = (event, id) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleVaccine(id);
    }
  };

  const vaccines = vaccinesSchedule.map((vaccine) => {
    const id = `${vaccine.name}-${vaccine.dose}`;
    const isCompleted = !!completedVaccines[id];
    let status = 'pending';

    if (!isCompleted && babyAgeInMonths >= vaccine.months - 0.5) {
      status = 'upcoming';
    }
    if (isCompleted) {
      status = 'completed';
    }

    return { ...vaccine, status, id };
  });

  const isModal = typeof onClose === 'function';
  const handleClose = () => {
    if (isModal) {
      onClose();
    }
  };

  const content = (
    <>
      {isModal && (
        <div className="modal-header">
          <h2>🍼 Vaccinations</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
      )}

      <div className="vaccination-content">
        <div className="vaccination-info">
          <p>
            Keep track of recommended vaccines for your baby. Tap the icon to mark a dose as done.
          </p>
        </div>

        <div className="vaccination-list">
          {vaccines.map((vaccine) => (
            <div key={vaccine.ageLabel} className={`vaccination-card ${vaccine.status}`}>
              <div className="vaccination-age">{vaccine.ageLabel}</div>
              <div className="vaccination-details">
                <div className="vaccination-name">{vaccine.name}</div>
                <div className="vaccination-dose">{vaccine.dose}</div>
              </div>
              <div
                className={`vaccination-status ${vaccine.status}`}
                role="button"
                tabIndex={0}
                aria-pressed={vaccine.status === 'completed'}
                aria-label={vaccine.status === 'completed' ? 'Mark as not done' : 'Mark as done'}
                onClick={() => toggleVaccine(vaccine.id)}
                onKeyDown={(event) => handleStatusKey(event, vaccine.id)}
              >
                <span className="status-icon" aria-hidden="true">
                  {getStatusIcon(vaccine.status)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="vaccination-note">
          <strong>Reminder:</strong> Always review the plan with your pediatrician for
          personalized recommendations.
        </div>
      </div>
    </>
  );

  if (isModal) {
    return (
      <div className="modal-backdrop" onClick={handleClose}>
        <div className="vaccination-modal" onClick={(event) => event.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="vaccination-page">
      {content}
    </div>
  );
};

export default VaccinationTracker;
