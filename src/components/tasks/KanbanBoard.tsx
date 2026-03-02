import { useState, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import Skeleton from '../common/Skeleton';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

    // Auto-check for overdue tasks
    useEffect(() => {
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
    }, [tasks, projectId]);

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

    const filteredTasks = useMemo(() => {
        let result = tasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });

        // Apply sorting
        result.sort((a, b) => {
            if (sortBy === 'newest') return b.updatedAt.getTime() - a.updatedAt.getTime();
            if (sortBy === 'oldest') return a.updatedAt.getTime() - b.updatedAt.getTime();
            if (sortBy === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                return priorityWeight[b.priority] - priorityWeight[a.priority];
            }
            return 0;
        });

        return result;
    }, [tasks, searchQuery, priorityFilter, sortBy]);

    const getColumnTasks = (status: TaskStatus) =>
        filteredTasks.filter((t) => t.status === status);

    if (loading) {
        return (
            <div className="kanban-skeleton">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="column-skeleton">
                        <Skeleton height={24} width="60%" borderRadius={4} />
                        <Skeleton height={100} borderRadius={12} count={3} className="skeleton-card" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="kanban-container">

            <div className="kanban-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <Filter size={18} className="filter-icon" />
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                </div>
                <div className="filter-box sort-box">
                    <ArrowUpDown size={18} className="filter-icon" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">High Priority First</option>
                    </select>
                </div>
            </div>

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
                                            <AnimatePresence>
                                                {columnTasks.map((task, index) => (
                                                    <motion.div
                                                        key={task.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <TaskCard
                                                            task={task}
                                                            index={index}
                                                            onEdit={setEditingTask}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {provided.placeholder}

                                            {columnTasks.length === 0 && (
                                                <div className="kanban-empty">
                                                    <p>{searchQuery || priorityFilter !== 'all' ? 'No matches' : 'No tasks'}</p>
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
        </div>
    );
}
