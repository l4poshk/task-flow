import { useState } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { updateTaskStatus } from '../../services/taskService';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Task, TaskStatus } from '../../types';

interface KanbanBoardProps {
    projectId: string;
    tasks: Task[];
    loading: boolean;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'var(--status-todo)' },
    { id: 'in-progress', title: 'In Progress', color: 'var(--status-progress)' },
    { id: 'done', title: 'Done', color: 'var(--status-done)' },
    { id: 'overdue', title: 'Overdue', color: '#f87171' }, // Red-400
    { id: 'cancelled', title: 'Cancelled', color: '#94a3b8' }, // Slate-400
];

export default function KanbanBoard({ projectId, tasks, loading }: KanbanBoardProps) {
    const addToast = useNotificationStore((s) => s.addToast);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [creatingInColumn, setCreatingInColumn] = useState<TaskStatus | null>(null);

    // Auto-check for overdue tasks
    useState(() => {
        const checkOverdue = async () => {
            const now = new Date();
            for (const task of tasks) {
                if (
                    task.dueDate &&
                    task.dueDate < now &&
                    task.status !== 'done' &&
                    task.status !== 'cancelled' &&
                    task.status !== 'overdue'
                ) {
                    try {
                        await updateTaskStatus(projectId, task.id, 'overdue');
                    } catch (err) {
                        console.error('Failed to auto-move to overdue:', err);
                    }
                }
            }
        };

        const interval = setInterval(checkOverdue, 60000); // Check every minute
        checkOverdue(); // Initial check
        return () => clearInterval(interval);
    });

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId as TaskStatus;
        const task = tasks.find((t) => t.id === taskId);

        if (!task || task.status === newStatus) return;

        try {
            await updateTaskStatus(projectId, taskId, newStatus);
        } catch {
            addToast('Failed to update task status', 'error');
        }
    };

    const getColumnTasks = (status: TaskStatus) =>
        tasks.filter((t) => t.status === status);

    if (loading) {
        return (
            <div className="kanban-loading">
                <div className="spinner" />
                <p>Loading tasks...</p>
            </div>
        );
    }

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="kanban-board">
                    {COLUMNS.map((column) => {
                        const columnTasks = getColumnTasks(column.id);
                        return (
                            <div key={column.id} className="kanban-column" data-status={column.id}>
                                <div className="kanban-column-header">
                                    <div className="column-title-row">
                                        <span className="column-dot" style={{ background: column.color }} />
                                        <h3>{column.title}</h3>
                                        <span className="column-count">{columnTasks.length}</span>
                                    </div>
                                    <button
                                        className="icon-btn icon-btn-sm"
                                        onClick={() => setCreatingInColumn(column.id)}
                                        title={`Add task to ${column.title}`}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            className={`kanban-column-body ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    index={index}
                                                    onEdit={setEditingTask}
                                                />
                                            ))}
                                            {provided.placeholder}

                                            {columnTasks.length === 0 && (
                                                <div className="kanban-empty">
                                                    <p>No tasks</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {editingTask && (
                <TaskModal
                    projectId={projectId}
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}

            {creatingInColumn && (
                <TaskModal
                    projectId={projectId}
                    initialStatus={creatingInColumn}
                    onClose={() => setCreatingInColumn(null)}
                />
            )}
        </>
    );
}
