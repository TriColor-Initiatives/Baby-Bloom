import React from 'react';
import './HealthExport.css';

const HealthExport = ({ records, onClose }) => {
    const exportToPDF = () => {
        alert('Export to PDF feature - coming soon!');
    };

    const exportToCSV = () => {
        alert('Export to CSV feature - coming soon!');
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📤 Export Health Records</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="export-content">
                    <div className="export-options">
                        <div className="export-option" onClick={exportToPDF}>
                            <span className="export-icon">📄</span>
                            <div>
                                <h3>Export to PDF</h3>
                                <p>Generate a formatted PDF report for medical visits</p>
                            </div>
                        </div>

                        <div className="export-option" onClick={exportToCSV}>
                            <span className="export-icon">📊</span>
                            <div>
                                <h3>Export to CSV</h3>
                                <p>Download data in spreadsheet format</p>
                            </div>
                        </div>
                    </div>

                    <div className="export-info">
                        <p><strong>Total Records:</strong> {records.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthExport;
