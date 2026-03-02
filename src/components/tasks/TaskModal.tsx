import { useState } from 'react';
import Modal from '../common/Modal';
import { createTask, updateTask } from '../../services/taskService';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Task, TaskStatus, TaskPriority } from '../../types';

interface TaskModalProps {
    projectId: string;
    onClose: () => void;
    task?: Task;
    initialStatus?: TaskStatus;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export default function TaskModal({ projectId, onClose, task, initialStatus }: TaskModalProps) {
    const addToast = useNotificationStore((s) => s.addToast);
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [status, setStatus] = useState<TaskStatus>(task?.status || initialStatus || 'todo');
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
    const [dueDate, setDueDate] = useState<string>(
        task?.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
    );
    const [loading, setLoading] = useState(false);

    const isEditing = !!task;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            const dateObj = dueDate ? new Date(dueDate) : null;
            if (isEditing && task) {
                await updateTask(projectId, task.id, {
                    title: title.trim(),
                    description: description.trim(),
                    status,
                    priority,
                    dueDate: dateObj,
                    assigneeId: task.assigneeId,
                });
                addToast('Task updated!', 'success');
            } else {
                await createTask(projectId, {
                    title: title.trim(),
                    description: description.trim(),
                    status,
                    priority,
                    dueDate: dateObj,
                    assigneeId: null,
                });
                addToast('Task created!', 'success');
            }
            onClose();
        } catch {
            addToast(isEditing ? 'Failed to update task' : 'Failed to create task', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title={isEditing ? 'Edit Task' : 'New Task'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="task-title">Title</label>
                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title..."
                        required
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="task-description">Description</label>
                    <textarea
                        id="task-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe this task..."
                        rows={3}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="task-status">Status</label>
                        <select
                            id="task-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TaskStatus)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-priority">Priority</label>
                        <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        >
                            {PRIORITY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!['done', 'overdue', 'cancelled'].includes(status) && (
                    <div className="form-group">
                        <label htmlFor="task-duedate">Due Date</label>
                        <input
                            id="task-duedate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()}>
                        {loading ? (
                            <span className="btn-loading"><div className="spinner spinner-xs" /> Saving...</span>
                        ) : isEditing ? 'Update Task' : 'Create Task'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
