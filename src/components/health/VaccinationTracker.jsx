import { useMemo } from 'react';
import { useBaby } from '../../contexts/BabyContext';
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
  if (status === 'upcoming') return '⏰';
  return '🕒';
};

const VaccinationTracker = ({ onClose }) => {
  const { activeBaby } = useBaby();

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

  const vaccines = vaccinesSchedule.map((vaccine) => {
    const status =
      babyAgeInMonths >= vaccine.months
        ? 'completed'
        : babyAgeInMonths >= vaccine.months - 0.5
        ? 'upcoming'
        : 'pending';
    return { ...vaccine, status };
  });

  const isModal = typeof onClose === 'function';
  const handleClose = () => {
    if (isModal) {
      onClose();
    }
  };

  const content = (
    <>
      <div className="modal-header">
        <h2>💉 Vaccination Tracker</h2>
        {isModal && (
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ×
          </button>
        )}
      </div>

      <div className="vaccination-content">
        <div className="vaccination-info">
          <p>
            Keep track of recommended vaccines for your baby. Status updates automatically based on
            your little one&apos;s age.
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
              <div className={`vaccination-status ${vaccine.status}`}>
                {getStatusIcon(vaccine.status)}
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

