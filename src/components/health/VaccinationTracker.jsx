import React, { useMemo } from 'react';
import { useBaby } from '../../contexts/BabyContext';
import './VaccinationTracker.css';

const VaccinationTracker = ({ onClose }) => {
    const { activeBaby } = useBaby();

    // Calculate baby's age in months (as a decimal for more accurate comparison)
    const babyAgeInMonths = useMemo(() => {
        if (!activeBaby || !activeBaby.dateOfBirth) return 0;
        const today = new Date();
        const birthDate = new Date(activeBaby.dateOfBirth);
        
        // Calculate total months
        const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());
        
        // Adjust for days - if current day is before birth day, subtract a month
        const days = today.getDate() - birthDate.getDate();
        if (days < 0) {
            // Approximate: subtract about 0.03 months per day (1/30)
            return Math.max(0, months - 0.03);
        }
        
        // Add fraction of month based on days
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return months + (days / daysInMonth);
    }, [activeBaby]);

    // Function to determine vaccine status based on baby's age
    const getVaccineStatus = (vaccineAge) => {
        let ageInMonths = 0;
        
        // Convert vaccine age to months
        if (vaccineAge === 'Birth') {
            ageInMonths = 0;
        } else if (vaccineAge.includes('months')) {
            ageInMonths = parseInt(vaccineAge);
        } else if (vaccineAge.includes('years')) {
            ageInMonths = parseInt(vaccineAge) * 12;
        }

        // If baby's age is greater than or equal to vaccine age, it should be completed
        if (babyAgeInMonths >= ageInMonths) {
            return 'completed';
        }
        // If vaccine is due within 2 weeks (approximately 0.5 months), show as upcoming
        else if (babyAgeInMonths >= ageInMonths - 0.5) {
            return 'upcoming';
        }
        // Otherwise, it's pending
        else {
            return 'pending';
        }
    };

    const vaccines = [
        { age: 'Birth', ageMonths: 0, name: 'Hepatitis B', dose: '1st dose' },
        { age: '2 months', ageMonths: 2, name: 'DTaP, IPV, Hib, PCV, RV', dose: '1st dose' },
        { age: '4 months', ageMonths: 4, name: 'DTaP, IPV, Hib, PCV, RV', dose: '2nd dose' },
        { age: '6 months', ageMonths: 6, name: 'DTaP, Hib, PCV, RV', dose: '3rd dose' },
        { age: '12 months', ageMonths: 12, name: 'MMR, Varicella, Hep A', dose: '1st dose' },
    ].map(vaccine => ({
        ...vaccine,
        status: getVaccineStatus(vaccine.age)
    }));

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="vaccination-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>💉 Vaccination Tracker</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="vaccination-content">
                    <div className="vaccination-info">
                        <p>Track your baby's vaccination schedule based on WHO and CDC guidelines.</p>
                    </div>

                    <div className="vaccination-list">
                        {vaccines.map((vaccine, index) => (
                            <div key={index} className={`vaccination-card ${vaccine.status}`}>
                                <div className="vaccination-age">{vaccine.age}</div>
                                <div className="vaccination-details">
                                    <div className="vaccination-name">{vaccine.name}</div>
                                    <div className="vaccination-dose">{vaccine.dose}</div>
                                </div>
                                <div className={`vaccination-status ${vaccine.status}`}>
                                    {vaccine.status === 'completed' ? '✅' : vaccine.status === 'upcoming' ? '📅' : '⏳'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="vaccination-note">
                        <strong>📝 Note:</strong> Always consult with your pediatrician for personalized vaccination schedule.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaccinationTracker;
