import React from 'react';
import './VaccinationTracker.css';

const VaccinationTracker = ({ onClose }) => {
    const vaccines = [
        { age: 'Birth', name: 'Hepatitis B', dose: '1st dose', status: 'completed' },
        { age: '2 months', name: 'DTaP, IPV, Hib, PCV, RV', dose: '1st dose', status: 'completed' },
        { age: '4 months', name: 'DTaP, IPV, Hib, PCV, RV', dose: '2nd dose', status: 'completed' },
        { age: '6 months', name: 'DTaP, Hib, PCV, RV', dose: '3rd dose', status: 'upcoming' },
        { age: '12 months', name: 'MMR, Varicella, Hep A', dose: '1st dose', status: 'pending' },
    ];

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
