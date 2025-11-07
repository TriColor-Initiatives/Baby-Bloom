import React, { useState, useEffect } from 'react';
import './EmergencyInfo.css';

const EmergencyInfo = ({ onClose }) => {
    const [emergencyData, setEmergencyData] = useState({
        bloodType: '',
        allergies: [],
        conditions: [],
        medications: [],
        primaryContact: {
            name: '',
            relation: '',
            phone: '',
            email: ''
        },
        secondaryContact: {
            name: '',
            relation: '',
            phone: '',
            email: ''
        },
        pediatrician: {
            name: '',
            clinic: '',
            phone: '',
            address: ''
        },
        hospital: {
            name: '',
            address: '',
            phone: '',
            distance: ''
        },
        insurance: {
            provider: '',
            policyNumber: '',
            groupNumber: ''
        },
        notes: ''
    });

    const [newItem, setNewItem] = useState('');
    const [addingTo, setAddingTo] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('babyEmergencyInfo');
        if (saved) {
            setEmergencyData(JSON.parse(saved));
        }
    }, []);

    const saveData = (data) => {
        setEmergencyData(data);
        localStorage.setItem('babyEmergencyInfo', JSON.stringify(data));
    };

    const handleInputChange = (section, field, value) => {
        const updated = { ...emergencyData };
        if (section) {
            updated[section][field] = value;
        } else {
            updated[field] = value;
        }
        saveData(updated);
    };

    const addItem = (field) => {
        if (newItem.trim()) {
            const updated = {
                ...emergencyData,
                [field]: [...emergencyData[field], newItem.trim()]
            };
            saveData(updated);
            setNewItem('');
            setAddingTo(null);
        }
    };

    const removeItem = (field, index) => {
        const updated = {
            ...emergencyData,
            [field]: emergencyData[field].filter((_, i) => i !== index)
        };
        saveData(updated);
    };

    const exportToPDF = () => {
        window.print();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
                <div className="emergency-header">
                    <h2>🚨 Emergency Information</h2>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button className="btn btn-secondary" onClick={exportToPDF}>
                            📄 Print
                        </button>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="emergency-content">
                    <div className="emergency-alert">
                        <span>⚠️</span>
                        <div>
                            <strong>Keep this information up to date!</strong>
                            <p>In case of emergency, this information could save precious time. Review and update regularly.</p>
                        </div>
                    </div>

                    <div className="emergency-section">
                        <h3>🩸 Medical Information</h3>

                        <div className="form-group">
                            <label>Blood Type</label>
                            <select
                                value={emergencyData.bloodType}
                                onChange={(e) => handleInputChange(null, 'bloodType', e.target.value)}
                            >
                                <option value="">Select blood type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Known Allergies</label>
                            <div className="tag-list">
                                {emergencyData.allergies.map((allergy, index) => (
                                    <div key={index} className="tag">
                                        <span>{allergy}</span>
                                        <button onClick={() => removeItem('allergies', index)}>×</button>
                                    </div>
                                ))}
                            </div>
                            {addingTo === 'allergies' ? (
                                <div className="add-item-input">
                                    <input
                                        type="text"
                                        placeholder="Enter allergy..."
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addItem('allergies')}
                                        autoFocus
                                    />
                                    <button onClick={() => addItem('allergies')} className="btn btn-sm">Add</button>
                                    <button onClick={() => { setAddingTo(null); setNewItem(''); }} className="btn btn-sm">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setAddingTo('allergies')} className="btn-add">+ Add Allergy</button>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Medical Conditions</label>
                            <div className="tag-list">
                                {emergencyData.conditions.map((condition, index) => (
                                    <div key={index} className="tag">
                                        <span>{condition}</span>
                                        <button onClick={() => removeItem('conditions', index)}>×</button>
                                    </div>
                                ))}
                            </div>
                            {addingTo === 'conditions' ? (
                                <div className="add-item-input">
                                    <input
                                        type="text"
                                        placeholder="Enter condition..."
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addItem('conditions')}
                                        autoFocus
                                    />
                                    <button onClick={() => addItem('conditions')} className="btn btn-sm">Add</button>
                                    <button onClick={() => { setAddingTo(null); setNewItem(''); }} className="btn btn-sm">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setAddingTo('conditions')} className="btn-add">+ Add Condition</button>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Current Medications</label>
                            <div className="tag-list">
                                {emergencyData.medications.map((medication, index) => (
                                    <div key={index} className="tag">
                                        <span>{medication}</span>
                                        <button onClick={() => removeItem('medications', index)}>×</button>
                                    </div>
                                ))}
                            </div>
                            {addingTo === 'medications' ? (
                                <div className="add-item-input">
                                    <input
                                        type="text"
                                        placeholder="Enter medication..."
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addItem('medications')}
                                        autoFocus
                                    />
                                    <button onClick={() => addItem('medications')} className="btn btn-sm">Add</button>
                                    <button onClick={() => { setAddingTo(null); setNewItem(''); }} className="btn btn-sm">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setAddingTo('medications')} className="btn-add">+ Add Medication</button>
                            )}
                        </div>
                    </div>

                    <div className="emergency-section">
                        <h3>👨‍👩‍👧 Emergency Contacts</h3>

                        <div className="contact-card">
                            <h4>Primary Contact</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        value={emergencyData.primaryContact.name}
                                        onChange={(e) => handleInputChange('primaryContact', 'name', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Relation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Mother"
                                        value={emergencyData.primaryContact.relation}
                                        onChange={(e) => handleInputChange('primaryContact', 'relation', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={emergencyData.primaryContact.phone}
                                        onChange={(e) => handleInputChange('primaryContact', 'phone', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={emergencyData.primaryContact.email}
                                        onChange={(e) => handleInputChange('primaryContact', 'email', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="contact-card">
                            <h4>Secondary Contact</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        value={emergencyData.secondaryContact.name}
                                        onChange={(e) => handleInputChange('secondaryContact', 'name', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Relation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Father"
                                        value={emergencyData.secondaryContact.relation}
                                        onChange={(e) => handleInputChange('secondaryContact', 'relation', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={emergencyData.secondaryContact.phone}
                                        onChange={(e) => handleInputChange('secondaryContact', 'phone', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={emergencyData.secondaryContact.email}
                                        onChange={(e) => handleInputChange('secondaryContact', 'email', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="emergency-section">
                        <h3>👨‍⚕️ Healthcare Providers</h3>

                        <div className="contact-card">
                            <h4>Pediatrician</h4>
                            <div className="form-group">
                                <label>Doctor Name</label>
                                <input
                                    type="text"
                                    placeholder="Dr. Sarah Johnson"
                                    value={emergencyData.pediatrician.name}
                                    onChange={(e) => handleInputChange('pediatrician', 'name', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Clinic/Practice</label>
                                <input
                                    type="text"
                                    placeholder="City Pediatric Clinic"
                                    value={emergencyData.pediatrician.clinic}
                                    onChange={(e) => handleInputChange('pediatrician', 'clinic', e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={emergencyData.pediatrician.phone}
                                        onChange={(e) => handleInputChange('pediatrician', 'phone', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        placeholder="123 Main St"
                                        value={emergencyData.pediatrician.address}
                                        onChange={(e) => handleInputChange('pediatrician', 'address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="contact-card">
                            <h4>Nearest Hospital</h4>
                            <div className="form-group">
                                <label>Hospital Name</label>
                                <input
                                    type="text"
                                    placeholder="City General Hospital"
                                    value={emergencyData.hospital.name}
                                    onChange={(e) => handleInputChange('hospital', 'name', e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        placeholder="456 Hospital Rd"
                                        value={emergencyData.hospital.address}
                                        onChange={(e) => handleInputChange('hospital', 'address', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 911-0000"
                                        value={emergencyData.hospital.phone}
                                        onChange={(e) => handleInputChange('hospital', 'phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Distance/Travel Time</label>
                                <input
                                    type="text"
                                    placeholder="5 miles / 10 minutes"
                                    value={emergencyData.hospital.distance}
                                    onChange={(e) => handleInputChange('hospital', 'distance', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="emergency-section">
                        <h3>🏥 Insurance Information</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Insurance Provider</label>
                                <input
                                    type="text"
                                    placeholder="Blue Cross Blue Shield"
                                    value={emergencyData.insurance.provider}
                                    onChange={(e) => handleInputChange('insurance', 'provider', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Policy Number</label>
                                <input
                                    type="text"
                                    placeholder="ABC123456789"
                                    value={emergencyData.insurance.policyNumber}
                                    onChange={(e) => handleInputChange('insurance', 'policyNumber', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Group Number</label>
                            <input
                                type="text"
                                placeholder="GRP987654"
                                value={emergencyData.insurance.groupNumber}
                                onChange={(e) => handleInputChange('insurance', 'groupNumber', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="emergency-section">
                        <h3>📝 Additional Notes</h3>

                        <div className="form-group">
                            <textarea
                                placeholder="Any additional important information (special needs, preferences, etc.)"
                                value={emergencyData.notes}
                                onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
                                rows="4"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyInfo;
