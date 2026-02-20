import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getMyTasks, getAllTasks, createTask, updateTask, deleteTask,
} from '../api/task.api';
import Loader from '../components/Loader';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUS_LABELS = {
    'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done',
};

const EMPTY_FORM = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: '', assignedTo: '' };

const TaskModal = ({ task, onClose, onSave }) => {
    const isEdit = !!task?._id;
    const [form, setForm] = useState(
        task?._id
            ? { ...task, tags: (task.tags || []).join(', '), dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' }
            : EMPTY_FORM
    );
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const title = form.title?.trim();
        if (!title || title.length < 3) {
            setError('Title must be at least 3 characters.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title,
                description: form.description?.trim() || '',
                status: form.status,
                priority: form.priority,
                tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                dueDate: form.dueDate || undefined,
            };
            await onSave(payload);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save task.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-content__header">
                    <h2>{isEdit ? 'Update Task' : 'New Task'}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </header>
                {error && <div className="alert alert--error">{error}</div>}
                <form id="task-form" onSubmit={handleSubmit} className="task-form-minimal">
                    <div className="form-group">
                        <label className="form-label">Task Title</label>
                        <input name="title" value={form.title} onChange={handleChange} className="form-input" placeholder="Title of the task" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Detailed Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} className="form-input" placeholder="What exactly needs to be done?" rows={3} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Progress Status</label>
                            <select name="status" value={form.status} onChange={handleChange} className="form-input">
                                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Urgency Level</label>
                            <select name="priority" value={form.priority} onChange={handleChange} className="form-input">
                                {PRIORITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn--primary" disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
                .modal-content { background: var(--clr-surface); width: 100%; max-width: 500px; border-radius: var(--r-lg); box-shadow: var(--shadow-lg); overflow: hidden; border: 1px solid var(--clr-border); }
                .modal-content__header { padding: 1.5rem; border-bottom: 1px solid var(--clr-border); display: flex; justify-content: space-between; align-items: center; }
                .modal-content__header h2 { font-size: 1.25rem; font-weight: 800; color: var(--clr-text); margin: 0; }
                .close-btn { font-size: 1.25rem; color: var(--clr-text-dim); }
                .task-form-minimal { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
                .form-input { width: 100%; padding: 0.75rem 1rem; background: var(--clr-surface-alt); border: 1px solid var(--clr-border); border-radius: var(--r-md); color: var(--clr-text); outline: none; transition: border-color 0.2s; }
                .form-input:focus { border-color: var(--clr-primary); }
            `}} />
        </div>
    );
};

const Tasks = ({ adminView = false }) => {
    const { isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tasks, setTasks] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        priority: searchParams.get('priority') || '',
        search: searchParams.get('search') || '',
        page: 1,
    });
    const [modal, setModal] = useState({ open: false, task: null });
    const [deleteId, setDeleteId] = useState(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: filters.page, limit: 12 };
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;
            const fn = (adminView && isAdmin) ? getAllTasks : getMyTasks;
            const { data } = await fn(params);
            setTasks(data.data);
            setPagination(data.pagination);
        } catch (err) {
            setError('Failed to sync tasks.');
        } finally { setLoading(false); }
    }, [filters, adminView, isAdmin]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    useEffect(() => {
        const p = {};
        if (filters.status) p.status = filters.status;
        if (filters.priority) p.priority = filters.priority;
        if (filters.search) p.search = filters.search;
        setSearchParams(p, { replace: true });
    }, [filters.status, filters.priority, filters.search, setSearchParams]);

    const setFilter = (key, val) => setFilters((p) => ({ ...p, [key]: val, page: 1 }));

    const handleSave = async (payload) => {
        if (modal.task?._id) await updateTask(modal.task._id, payload);
        else await createTask(payload);
        fetchTasks();
    };

    const handleDelete = async () => {
        try { await deleteTask(deleteId); setDeleteId(null); fetchTasks(); }
        catch { setError('Unable to delete task.'); }
    };

    return (
        <div className="page tasks-page">
            <header className="page__header tasks-header">
                <div className="tasks-header__text">
                    <h1 className="page__title">{adminView ? 'Master Inventory' : 'My Work Area'}</h1>
                    <p className="page__subtitle">Displaying {tasks.length} tasks of {pagination.total} total</p>
                </div>
                {!adminView && (
                    <button className="btn btn--primary" onClick={() => setModal({ open: true, task: null })}>+ Add Entry</button>
                )}
            </header>

            <section className="tasks-filters">
                <div className="search-wrap">
                    <input type="text" className="form-input" placeholder="Sift through tasks..." value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
                </div>
                <div className="filter-wrap">
                    <select className="form-input" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                        <option value="">Status: All</option>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <select className="form-input" value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
                        <option value="">Priority: All</option>
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                </div>
            </section>

            {loading ? <Loader /> : (
                <div className="tasks-grid">
                    {tasks.map((task) => (
                        <div key={task._id} className="task-card">
                            <div className="task-card__top">
                                <span className={`p-badge p--${task.priority}`}>{task.priority}</span>
                                <span className="task-card__date">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                            </div>
                            <h3 className="task-card__title">{task.title}</h3>
                            <p className="task-card__desc">{task.description}</p>
                            <div className="task-card__bottom">
                                <span className="s-badge">{STATUS_LABELS[task.status]}</span>
                                {!adminView && (
                                    <div className="task-card__ops">
                                        <button onClick={() => setModal({ open: true, task })}>Edit</button>
                                        <button onClick={() => setDeleteId(task._id)} className="op--danger">Trash</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="pagi-wrap">
                    <button disabled={!pagination.hasPrevPage} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>Previous</button>
                    <span>{pagination.page} / {pagination.totalPages}</span>
                    <button disabled={!pagination.hasNextPage} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>Next</button>
                </div>
            )}

            {modal.open && <TaskModal task={modal.task} onClose={() => setModal({ open: false, task: null })} onSave={handleSave} />}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-content__header"><h2>Confirm</h2></header>
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--clr-text-muted)', marginBottom: '1.5rem' }}>This action cannot be undone. Remove this task permanently?</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button className="btn btn--ghost" onClick={() => setDeleteId(null)}>Cancel</button>
                                <button className="btn btn--danger" onClick={handleDelete}>Delete Anyway</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .tasks-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--clr-border); padding-bottom: 2rem; margin-bottom: 2.5rem; }
                .tasks-filters { display: grid; grid-template-columns: 1fr auto; gap: 1rem; margin-bottom: 2rem; }
                .filter-wrap { display: flex; gap: 0.75rem; }
                
                .tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .task-card { background: var(--clr-surface); border: 1px solid var(--clr-border); border-radius: var(--r-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; transition: transform 0.2s; box-shadow: var(--shadow); }
                .task-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
                
                .task-card__top { display: flex; justify-content: space-between; align-items: center; }
                .p-badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid transparent; }
                .p--critical { background: rgba(239, 68, 68, 0.1); color: var(--clr-danger); border-color: var(--clr-danger); }
                .p--low { background: rgba(16, 185, 129, 0.1); color: var(--clr-success); border-color: var(--clr-success); }
                .task-card__date { font-size: 0.75rem; color: var(--clr-text-dim); }
                
                .task-card__title { font-size: 1.1rem; font-weight: 800; color: var(--clr-text); }
                .task-card__desc { font-size: 0.875rem; color: var(--clr-text-muted); line-height: 1.5; height: 3em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
                
                .task-card__bottom { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--clr-border); }
                .s-badge { font-size: 0.7rem; font-weight: 700; color: var(--clr-text-dim); }
                .task-card__ops { display: flex; gap: 1rem; }
                .task-card__ops button { font-size: 0.75rem; font-weight: 800; color: var(--clr-primary); }
                .task-card__ops button.op--danger { color: var(--clr-danger); }
                
                .pagi-wrap { display: flex; align-items: center; justify-content: center; gap: 2rem; margin-top: 3rem; font-size: 0.875rem; color: var(--clr-text-muted); }
                @media (max-width: 768px) { .tasks-filters { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
};

export default Tasks;
