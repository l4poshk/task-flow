import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Trash2, Plus, Pencil, Users } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import ProjectModal from '../components/projects/ProjectModal';
import { deleteProject, addMemberToProject } from '../services/projectService';
import { useNotificationStore } from '../stores/notificationStore';

export default function ProjectPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const addToast = useNotificationStore((s) => s.addToast);
    const { projects } = useProjects();
    const { tasks, loading: tasksLoading } = useTasks(projectId);

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showEditProject, setShowEditProject] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');

    const project = projects.find((p) => p.id === projectId);

    const handleDeleteProject = async () => {
        if (!projectId) return;
        if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
        try {
            await deleteProject(projectId);
            addToast('Project deleted', 'info');
            navigate('/');
        } catch {
            addToast('Failed to delete project', 'error');
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !memberEmail.trim()) return;
        try {
            // In a real app, you'd look up the user by email first
            // For now, we use the email as a userId placeholder
            await addMemberToProject(projectId, memberEmail.trim());
            addToast('Member added!', 'success');
            setMemberEmail('');
        } catch {
            addToast('Failed to add member', 'error');
        }
    };

    if (!project) {
        return (
            <div className="page-loader">
                <div className="spinner" />
                <p>Loading project...</p>
            </div>
        );
    }

    return (
        <div className="project-page">
            <div className="project-header">
                <div className="project-info">
                    <h1>{project.title}</h1>
                    {project.description && <p className="project-desc">{project.description}</p>}
                </div>

                <div className="project-actions">
                    <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                        <Plus size={16} />
                        New Task
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => setShowMembers(!showMembers)}
                        title="Members"
                    >
                        <Users size={18} />
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => setShowEditProject(true)}
                        title="Edit project"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        className="icon-btn icon-btn-danger"
                        onClick={handleDeleteProject}
                        title="Delete project"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Members Panel */}
            {showMembers && (
                <div className="members-panel">
                    <div className="members-header">
                        <h3><Users size={16} /> Members ({project.memberIds.length})</h3>
                    </div>
                    <div className="members-list">
                        {project.memberIds.map((id) => (
                            <div key={id} className="member-chip">
                                <Settings size={12} />
                                <span>{id}</span>
                            </div>
                        ))}
                    </div>
                    <form className="add-member-form" onSubmit={handleAddMember}>
                        <input
                            type="text"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            placeholder="Enter user ID to invite..."
                        />
                        <button type="submit" className="btn btn-sm btn-primary" disabled={!memberEmail.trim()}>
                            Add
                        </button>
                    </form>
                </div>
            )}

            {/* Kanban Board */}
            <KanbanBoard projectId={projectId!} tasks={tasks} loading={tasksLoading} />

            {/* Modals */}
            {showTaskModal && (
                <TaskModal projectId={projectId!} onClose={() => setShowTaskModal(false)} />
            )}
            {showEditProject && (
                <ProjectModal project={project} onClose={() => setShowEditProject(false)} />
            )}
        </div>
    );
}
