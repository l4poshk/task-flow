import { Link } from 'react-router-dom';
import { FolderKanban, Clock, CheckCircle2, AlertCircle, ArrowRight, PieChart as PieChartIcon } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useState, useEffect } from 'react';
import { subscribeToProjectTasks } from '../services/taskService';
import ExternalDataWidget from '../components/dashboard/ExternalDataWidget';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
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
                setRecentTasks(merged);
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
            case 'overdue': return <AlertCircle size={14} className="status-icon danger" />;
            case 'cancelled': return <AlertCircle size={14} className="status-icon todo" />;
            default: return <AlertCircle size={14} className="status-icon todo" />;
        }
    };

    const stats = {
        total: recentTasks.length,
        todo: recentTasks.filter((t) => t.status === 'todo').length,
        inProgress: recentTasks.filter((t) => t.status === 'in-progress').length,
        done: recentTasks.filter((t) => t.status === 'done').length,
        overdue: recentTasks.filter((t) => t.status === 'overdue').length,
        cancelled: recentTasks.filter((t) => t.status === 'cancelled').length,
    };

    const chartData = [
        { name: 'To Do', value: stats.todo, color: '#94a3b8' },
        { name: 'In Progress', value: stats.inProgress, color: '#818cf8' },
        { name: 'Done', value: stats.done, color: '#34d399' },
        { name: 'Overdue', value: stats.overdue, color: '#f87171' },
        { name: 'Cancelled', value: stats.cancelled, color: '#475569' },
    ].filter(d => d.value > 0);

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
                {/* Charts Widget */}
                <div className="widget charts-widget">
                    <div className="widget-header">
                        <div className="header-with-icon">
                            <PieChartIcon size={18} />
                            <h3>Task Distribution</h3>
                        </div>
                    </div>
                    <div className="widget-body">
                        {tasksLoading ? (
                            <div className="widget-loading">
                                <div className="spinner" />
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="widget-empty">
                                <p>Add tasks to see your progress chart!</p>
                            </div>
                        ) : (
                            <div className="chart-container" style={{ height: '250px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                color: '#fff'
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

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
                                {recentTasks.slice(0, 5).map((task) => (
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
            </div>

            {/* External Data Widget at the bottom */}
            <div style={{ marginTop: '2rem' }}>
                <ExternalDataWidget />
            </div>
        </div>
    );
}
