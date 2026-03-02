import { Link } from 'react-router-dom';
import { FolderKanban, Clock, CheckCircle2, AlertCircle, ArrowRight, PieChart as PieChartIcon, XCircle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useState, useEffect } from 'react';
import { subscribeToProjectTasks } from '../services/taskService';
import ExternalDataWidget from '../components/dashboard/ExternalDataWidget';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import type { Task } from '../types';
import Skeleton from '../components/common/Skeleton';

export default function DashboardPage() {
    const { projects, loading: projectsLoading } = useProjects();
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(true);

    // Subscribe to tasks from all projects to get recent ones
    useEffect(() => {
        if (projects.length === 0) {
            if (!projectsLoading) {
                setRecentTasks([]);
                setTasksLoading(false);
            }
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
    }, [projects, projectsLoading]);

    const statusIcon = (status: string) => {
        switch (status) {
            case 'done': return <CheckCircle2 size={14} className="status-icon done" />;
            case 'in-progress': return <Clock size={14} className="status-icon progress" />;
            case 'overdue': return <AlertCircle size={14} className="status-icon danger" />;
            case 'cancelled': return <XCircle size={14} className="status-icon todo" />; // Using XCircle for Cancelled
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
        { name: 'To Do', value: stats.todo, color: '#f59e0b' },
        { name: 'In Progress', value: stats.inProgress, color: '#818cf8' },
        { name: 'Done', value: stats.done, color: '#34d399' },
        { name: 'Overdue', value: stats.overdue, color: '#f87171' },
        { name: 'Cancelled', value: stats.cancelled, color: '#94a3b8' },
    ].filter(d => d.value > 0);

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Dashboard</motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>Overview of your projects and tasks</motion.p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {[
                    { label: 'Projects', value: projects.length, icon: <FolderKanban size={24} />, color: 'projects', loading: projectsLoading },
                    { label: 'To Do', value: stats.todo, icon: <AlertCircle size={24} />, color: 'todo', loading: tasksLoading },
                    { label: 'In Progress', value: stats.inProgress, icon: <Clock size={24} />, color: 'progress', loading: tasksLoading },
                    { label: 'Done', value: stats.done, icon: <CheckCircle2 size={24} />, color: 'done', loading: tasksLoading },
                    { label: 'Overdue', value: stats.overdue, icon: <AlertCircle size={24} />, color: 'danger', loading: tasksLoading },
                    { label: 'Cancelled', value: stats.cancelled, icon: <XCircle size={24} />, color: 'cancelled', loading: tasksLoading },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <div className={`stat-icon ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            {stat.loading ? (
                                <Skeleton width={40} height={28} />
                            ) : (
                                <motion.span
                                    className="stat-value"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                >
                                    {stat.value}
                                </motion.span>
                            )}
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Charts Widget */}
                <motion.div
                    className="widget charts-widget"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="widget-header">
                        <div className="header-with-icon">
                            <PieChartIcon size={18} />
                            <h3>Task Distribution</h3>
                        </div>
                    </div>
                    <div className="widget-body">
                        {tasksLoading ? (
                            <div className="widget-loading-skeleton" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Skeleton height={200} borderRadius="50%" width={200} />
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <Skeleton width={60} height={16} />
                                    <Skeleton width={60} height={16} />
                                    <Skeleton width={60} height={16} />
                                </div>
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
                                            animationBegin={0}
                                            animationDuration={1000}
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
                </motion.div>

                {/* Recent Tasks */}
                <motion.div
                    className="widget recent-tasks-widget"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="widget-header">
                        <h3>Recent Tasks</h3>
                    </div>
                    <div className="widget-body">
                        {projectsLoading || tasksLoading ? (
                            <div className="task-list">
                                <Skeleton height={48} borderRadius={10} count={5} className="mb-2" />
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
                </motion.div>
            </div>

            {/* External Data Widget at the bottom */}
            <div style={{ marginTop: '2rem' }}>
                <ExternalDataWidget />
            </div>
        </div>
    );
}
