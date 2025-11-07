import React from 'react';
import './GrowthCharts.css';

const GrowthCharts = ({ records, onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="charts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📊 Growth Charts</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="charts-content">
                    <div className="empty-state">
                        <p>📊 Interactive growth charts with WHO percentiles</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Charts will appear here as you add more growth measurements
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthCharts;
