import React from 'react';
import './SymptomLogger.css';

const SymptomLogger = ({ onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="symptom-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🩺 Symptom Logger</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="symptom-content">
                    <div className="empty-state">
                        <p>🩺 Log symptoms quickly here</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Add symptom records in Health Records with type "Symptom"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SymptomLogger;
