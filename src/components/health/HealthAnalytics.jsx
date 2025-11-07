import React from 'react';
import './HealthAnalytics.css';

const HealthAnalytics = ({ records, onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📈 Health Analytics</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="analytics-content">
                    <div className="empty-state">
                        <p>📈 Health trends and insights</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Analytics will show patterns as you add more health records
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthAnalytics;
