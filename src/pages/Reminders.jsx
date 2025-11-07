import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

    // Load existing reminders
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            setReminders(Array.isArray(saved) ? saved : []);
        } catch {
            setReminders([]);
        }
    }, []);

    // Save changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }, [reminders]);

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
            setForm(defaultForm);
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
        const payload = {
            id: editingId || Date.now(),
            title: form.title.trim() || 'Reminder',
            dueAt: new Date(form.dueAt).toISOString(),
            category: form.category,
            icon: form.icon || '⏰',
            notes: form.notes?.trim(),
            completed: false,
            createdAt: editingId ? undefined : new Date().toISOString()
        };
        setReminders((prev) => {
            const others = prev.filter((r) => r.id !== payload.id);
            return [...others, payload].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
        });
        closeModal();
    };

    const toggleComplete = (id) => {
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
    };

    const removeReminder = (id) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    const now = new Date();
    const upcoming = useMemo(
        () => reminders.filter((r) => !r.completed && new Date(r.dueAt) >= now).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)),
        [reminders]
    );
    const completed = useMemo(() => reminders.filter((r) => r.completed).sort((a, b) => new Date(b.dueAt) - new Date(a.dueAt)), [reminders]);

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
                                <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                                    <option value="general">General</option>
                                    <option value="feeding">Feeding</option>
                                    <option value="sleep">Sleep</option>
                                    <option value="diaper">Diaper</option>
                                    <option value="health">Health</option>
                                    <option value="photos">Photos</option>
                                </select>
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
