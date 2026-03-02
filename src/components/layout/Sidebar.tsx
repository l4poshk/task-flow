import { NavLink } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useUIStore } from '../../stores/uiStore';
import { useState } from 'react';
import ProjectModal from '../projects/ProjectModal';

export default function Sidebar() {
    const { projects, loading } = useProjects();
    const sidebarOpen = useUIStore((s) => s.sidebarOpen);
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3>Projects</h3>
                    <button className="icon-btn" onClick={() => setShowModal(true)} title="New project">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="sidebar-content">
                    {loading ? (
                        <div className="sidebar-loading">
                            <div className="spinner spinner-sm" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="sidebar-empty">
                            <FolderKanban size={32} className="empty-icon" />
                            <p>No projects yet</p>
                            <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
                                Create First Project
                            </button>
                        </div>
                    ) : (
                        <nav className="sidebar-nav">
                            {projects.map((project) => (
                                <NavLink
                                    key={project.id}
                                    to={`/project/${project.id}`}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <FolderKanban size={16} />
                                    <span>{project.title}</span>
                                </NavLink>
                            ))}
                        </nav>
                    )}
                </div>
            </aside>

            {showModal && <ProjectModal onClose={() => setShowModal(false)} />}
        </>
    );
}
