import React from 'react';
import './MedicationManager.css';

const MedicationManager = ({ onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="medication-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>💊 Medication Manager</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="medication-content">
                    <div className="empty-state">
                        <p>💊 Track your baby's medications here</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Add medications in Health Records with type "Medication"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicationManager;
