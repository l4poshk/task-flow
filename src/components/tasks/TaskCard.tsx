import { Draggable } from '@hello-pangea/dnd';
import { Pencil, Trash2, GripVertical, Flag } from 'lucide-react';
import { deleteTask } from '../../services/taskService';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Task } from '../../types';

interface TaskCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
}

const priorityConfig = {
    high: { color: 'var(--priority-high)', label: 'High' },
    medium: { color: 'var(--priority-medium)', label: 'Medium' },
    low: { color: 'var(--priority-low)', label: 'Low' },
};

export default function TaskCard({ task, index, onEdit }: TaskCardProps) {
    const addToast = useNotificationStore((s) => s.addToast);

    const handleDelete = async () => {
        if (!confirm('Delete this task?')) return;
        try {
            await deleteTask(task.projectId, task.id);
            addToast('Task deleted', 'info');
        } catch {
            addToast('Failed to delete task', 'error');
        }
    };

    const prio = priorityConfig[task.priority];

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <div className="task-card-header">
                        <div className="drag-handle" {...provided.dragHandleProps}>
                            <GripVertical size={14} />
                        </div>
                        <span className="priority-badge" style={{ background: prio.color }}>
                            <Flag size={10} />
                            {prio.label}
                        </span>
                    </div>

                    <h4 className="task-card-title">{task.title}</h4>

                    {task.description && (
                        <p className="task-card-desc">{task.description}</p>
                    )}

                    <div className="task-card-footer">
                        <button className="icon-btn icon-btn-sm" onClick={() => onEdit(task)} title="Edit">
                            <Pencil size={14} />
                        </button>
                        <button className="icon-btn icon-btn-sm icon-btn-danger" onClick={handleDelete} title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
