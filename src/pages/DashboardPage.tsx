import { Link } from 'react-router-dom';
import { FolderKanban, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useState, useEffect } from 'react';
import { subscribeToProjectTasks } from '../services/taskService';
import ExternalDataWidget from '../components/dashboard/ExternalDataWidget';
import type { Task } from '../types';

export default function DashboardPage() {
    const { projects, loading: projectsLoading } = useProjects();
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);

    // Subscribe to tasks from all projects to get recent ones
    useEffect(() => {
        if (projects.length === 0) {
            setRecentTasks([]);
            setTasksLoading(false);
            return;
        }

        const unsubscribes: (() => void)[] = [];
        const allTasks: Record<string, Task[]> = {};

        projects.forEach((project) => {
            const unsub = subscribeToProjectTasks(project.id, (tasks) => {
                allTasks[project.id] = tasks;
                const merged = Object.values(allTasks).flat();
                merged.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
                setRecentTasks(merged.slice(0, 8));
                setTasksLoading(false);
            });
            unsubscribes.push(unsub);
        });

        return () => unsubscribes.forEach((u) => u());
    }, [projects]);

    const statusIcon = (status: string) => {
        switch (status) {
            case 'done': return <CheckCircle2 size={14} className="status-icon done" />;
            case 'in-progress': return <Clock size={14} className="status-icon progress" />;
            default: return <AlertCircle size={14} className="status-icon todo" />;
        }
    };

    const stats = {
        total: recentTasks.length,
        todo: recentTasks.filter((t) => t.status === 'todo').length,
        inProgress: recentTasks.filter((t) => t.status === 'in-progress').length,
        done: recentTasks.filter((t) => t.status === 'done').length,
    };

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of your projects and tasks</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <FolderKanban size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{projects.length}</span>
                        <span className="stat-label">Projects</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon todo">
                        <AlertCircle size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.todo}</span>
                        <span className="stat-label">To Do</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon progress">
                        <Clock size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.inProgress}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon done">
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.done}</span>
                        <span className="stat-label">Done</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Recent Tasks */}
                <div className="widget recent-tasks-widget">
                    <div className="widget-header">
                        <h3>Recent Tasks</h3>
                    </div>
                    <div className="widget-body">
                        {projectsLoading || tasksLoading ? (
                            <div className="widget-loading">
                                <div className="spinner" />
                            </div>
                        ) : recentTasks.length === 0 ? (
                            <div className="widget-empty">
                                <p>No tasks yet. Create a project to get started!</p>
                            </div>
                        ) : (
                            <div className="task-list">
                                {recentTasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        to={`/project/${task.projectId}`}
                                        className="task-list-item"
                                    >
                                        {statusIcon(task.status)}
                                        <span className="task-list-title">{task.title}</span>
                                        <span className={`priority-dot priority-${task.priority}`} />
                                        <ArrowRight size={14} className="task-list-arrow" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* External Data Widget */}
                <ExternalDataWidget />
            </div>
        </div>
    );
}
