import React from 'react';
import './GrowthTracker.css';

const GrowthTracker = ({ records, onClose }) => {
    const growthRecords = records
        .filter(r => r.weight || r.height || r.headCircumference)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="growth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📏 Growth Tracker</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="growth-content">
                    {growthRecords.length === 0 ? (
                        <div className="empty-state">
                            <p>No growth measurements yet. Add measurements in your health records!</p>
                        </div>
                    ) : (
                        <div className="growth-list">
                            {growthRecords.map(record => (
                                <div key={record.id} className="growth-card">
                                    <div className="growth-date">
                                        {new Date(record.date).toLocaleDateString()}
                                    </div>
                                    <div className="growth-measurements">
                                        {record.weight && (
                                            <div className="growth-measurement">
                                                <span className="measurement-icon">⚖️</span>
                                                <span className="measurement-label">Weight:</span>
                                                <span className="measurement-value">{record.weight} kg</span>
                                            </div>
                                        )}
                                        {record.height && (
                                            <div className="growth-measurement">
                                                <span className="measurement-icon">📏</span>
                                                <span className="measurement-label">Height:</span>
                                                <span className="measurement-value">{record.height} cm</span>
                                            </div>
                                        )}
                                        {record.headCircumference && (
                                            <div className="growth-measurement">
                                                <span className="measurement-icon">⭕</span>
                                                <span className="measurement-label">Head:</span>
                                                <span className="measurement-value">{record.headCircumference} cm</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrowthTracker;
