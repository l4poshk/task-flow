import { NavLink } from 'react-router-dom';
import { FolderKanban, Plus, GripVertical } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useUIStore } from '../../stores/uiStore';
import { useState, useCallback, useEffect, useRef } from 'react';
import ProjectModal from '../projects/ProjectModal';

export default function Sidebar() {
    const { projects, loading } = useProjects();
    const { sidebarOpen, sidebarWidth, setSidebarWidth } = useUIStore();
    const [showModal, setShowModal] = useState(false);
    const isResizing = useRef(false);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.classList.add('is-resizing');
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.body.classList.remove('is-resizing');
    }, []);

    const resize = useCallback(
        (e: MouseEvent) => {
            if (isResizing.current) {
                const newWidth = e.clientX;
                if (newWidth >= 160 && newWidth <= 500) {
                    setSidebarWidth(newWidth);
                }
            }
        },
        [setSidebarWidth]
    );

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <>
            <aside
                className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
                style={{ '--sidebar-width': `${sidebarWidth}px` } as any}
            >
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
                                    onClick={() => {
                                        // Auto-close on mobile when clicking a project
                                        if (window.innerWidth <= 768) {
                                            useUIStore.getState().setSidebarOpen(false);
                                        }
                                    }}
                                >
                                    <FolderKanban size={16} />
                                    <span>{project.title}</span>
                                </NavLink>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Resize Handle */}
                <div className="sidebar-resizer" onMouseDown={startResizing}>
                    <GripVertical size={14} className="resizer-icon" />
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay-mobile"
                    onClick={() => useUIStore.getState().setSidebarOpen(false)}
                />
            )}

            {showModal && <ProjectModal onClose={() => setShowModal(false)} />}
        </>
    );
}
