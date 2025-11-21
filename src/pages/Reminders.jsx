import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomSelect from '../components/onboarding/CustomSelect';
import '../styles/pages.css';

const STORAGE_KEY = 'baby-bloom-reminders';

const defaultForm = {
    title: '',
    dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16), // next hour
    category: 'general',
    notes: '',
    icon: '⏰'
};

export default function Reminders() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [reminders, setReminders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(defaultForm);

    // Track if initial load is complete to prevent overwriting on mount
    const [isLoaded, setIsLoaded] = useState(false);

    // Load existing reminders
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const loadedReminders = Array.isArray(saved) ? saved : [];
            // Ensure all reminders have a completed property
            const normalizedReminders = loadedReminders.map(r => ({
                ...r,
                completed: r.completed === true ? true : false
            }));
            console.log('Loaded reminders from localStorage:', normalizedReminders);
            setReminders(normalizedReminders);
            setIsLoaded(true);
        } catch (error) {
            console.error('Error loading reminders:', error);
            setReminders([]);
            setIsLoaded(true);
        }
    }, []);

    // Save changes (only after initial load is complete)
    useEffect(() => {
        if (!isLoaded) return; // Don't save until initial load is done
        
        if (reminders.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
        
        // Dispatch custom event to notify Dashboard and other components
        console.log('Reminders: Dispatching reminders-updated event');
        window.dispatchEvent(new CustomEvent('reminders-updated'));
    }, [reminders, isLoaded]);

    // Auto-open on ?add=true
    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            openModal();
            searchParams.delete('add');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const openModal = (reminder = null) => {
        if (reminder) {
            setEditingId(reminder.id);
            setForm({
                title: reminder.title || '',
                dueAt: (reminder.dueAt || new Date().toISOString()).slice(0, 16),
                category: reminder.category || 'general',
                notes: reminder.notes || '',
                icon: reminder.icon || '⏰'
            });
        } else {
            setEditingId(null);
            setForm({
                title: '',
                dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
                category: 'general',
                notes: '',
                icon: '⏰'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!form.title.trim()) {
            alert('Please enter a reminder title');
            return;
        }

        const isEditing = editingId !== null;
        const existingReminder = isEditing ? reminders.find(r => r.id === editingId) : null;
        
        const payload = {
            id: isEditing ? editingId : Date.now(),
            title: form.title.trim(),
            dueAt: new Date(form.dueAt).toISOString(),
            category: form.category || 'general',
            icon: form.icon || '⏰',
            notes: form.notes?.trim() || '',
            completed: isEditing && existingReminder ? (existingReminder.completed === true) : false,
            createdAt: isEditing && existingReminder ? existingReminder.createdAt : new Date().toISOString()
        };

        console.log('Adding reminder:', payload);

        setReminders((prev) => {
            const others = prev.filter((r) => r.id !== payload.id);
            const updated = [...others, payload];
            console.log('Updated reminders:', updated);
            return updated.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
        });
        
        // Reset form with fresh defaults
        setForm({
            title: '',
            dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
            category: 'general',
            notes: '',
            icon: '⏰'
        });
        setEditingId(null);
        closeModal();
    };

    const toggleComplete = (id) => {
        setReminders((prev) => prev.map((r) => {
            if (r.id === id) {
                const currentCompleted = r.completed === true;
                return { ...r, completed: !currentCompleted };
            }
            return r;
        }));
    };

    const removeReminder = (id) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    const now = new Date();
    const upcoming = useMemo(() => {
        const filtered = reminders.filter((r) => r.completed !== true);
        console.log('Upcoming reminders:', filtered, 'Total reminders:', reminders);
        return filtered.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
    }, [reminders]);
    const completed = useMemo(() => reminders.filter((r) => r.completed === true).sort((a, b) => new Date(b.dueAt) - new Date(a.dueAt)), [reminders]);

    const timeUntil = (dateStr) => {
        const diffMs = new Date(dateStr) - new Date();
        const mins = Math.round(diffMs / 60000);
        if (mins <= 0) return 'Due now';
        if (mins < 60) return `In ${mins} min`;
        const hrs = Math.round(mins / 60);
        if (hrs < 24) return `In ${hrs} hour${hrs !== 1 ? 's' : ''}`;
        const days = Math.round(hrs / 24);
        if (days === 1) return 'Tomorrow';
        return `In ${days} days`;
    };

    return (
        <div className="page-container">
            <div className="page-actions" style={{ justifyContent: 'space-between' }}>
                <div className="page-title">
                    <span className="page-title-icon">⏰</span>
                    <h2 style={{ margin: 0 }}>Reminders</h2>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <span>➕</span>
                    <span>Add Reminder</span>
                </button>
            </div>

            <div className="content-grid">
                <div className="feeding-log">
                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Upcoming</h3>
                    {upcoming.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📅</div>
                            <h3>No upcoming reminders</h3>
                            <p>Create one to stay on top of important baby tasks</p>
                            <div className="empty-tips">
                                <div className="empty-tip"><span>🍼</span><span>Schedule next feeding reminders</span></div>
                                <div className="empty-tip"><span>💊</span><span>Don’t forget daily vitamins</span></div>
                                <div className="empty-tip"><span>🩺</span><span>Keep track of doctor visits</span></div>
                            </div>
                            <button className="btn btn-primary btn-large" onClick={() => openModal()}>
                                <span>➕</span>
                                <span>Add Reminder</span>
                            </button>
                        </div>
                    ) : (
                        upcoming.map((r) => (
                            <div key={r.id} className="reminder-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <span className="reminder-icon">{r.icon || '⏰'}</span>
                                <div className="reminder-content" style={{ flex: 1 }}>
                                    <div className="reminder-title">{r.title}</div>
                                    <div className="reminder-time">{new Date(r.dueAt).toLocaleString()} • {timeUntil(r.dueAt)}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                    <button className="btn btn-secondary" onClick={() => toggleComplete(r.id)}>{r.completed ? 'Undo' : 'Done'}</button>
                                    <button className="btn btn-secondary" onClick={() => openModal(r)}>Edit</button>
                                    <button className="btn btn-secondary" onClick={() => removeReminder(r.id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="info-panel">
                    <div className="info-card">
                        <div className="info-card-title"><span>✅</span>Completed</div>
                        {completed.length === 0 ? (
                            <p className="tip-card-text" style={{ margin: 0, color: 'var(--text-secondary)' }}>No completed reminders yet.</p>
                        ) : (
                            completed.map((r) => (
                                <div key={r.id} className="info-item">
                                    <div className="info-item-label">{new Date(r.dueAt).toLocaleString()}</div>
                                    <div className="info-item-value" style={{ fontWeight: 600 }}>
                                        {r.icon || '⏰'} {r.title}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? 'Edit Reminder' : 'Add Reminder'}</h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label className="form-label">Title</label>
                                <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Reminder title" required />
                            </div>
                            <div>
                                <label className="form-label">Due</label>
                                <input className="form-input" type="datetime-local" name="dueAt" value={form.dueAt} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="form-label">Category</label>
                                <CustomSelect
                                  className="form-input"
                                  value={form.category}
                                  onChange={(val) => setForm((f) => ({ ...f, category: val }))}
                                  options={[
                                    { value: 'general', label: 'General' },
                                    { value: 'feeding', label: 'Feeding' },
                                    { value: 'sleep', label: 'Sleep' },
                                    { value: 'diaper', label: 'Diaper' },
                                    { value: 'health', label: 'Health' },
                                    { value: 'photos', label: 'Photos' },
                                  ]}
                                  placeholder="Select category"
                                />
                            </div>
                            <div>
                                <label className="form-label">Icon</label>
                                <input className="form-input" name="icon" value={form.icon} onChange={handleChange} placeholder="e.g., ⏰" />
                            </div>
                            <div>
                                <label className="form-label">Notes</label>
                                <textarea className="form-input" name="notes" value={form.notes} onChange={handleChange} placeholder="Optional"></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}