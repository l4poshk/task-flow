import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { createProject, updateProject } from '../../services/projectService';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Project } from '../../types';

interface ProjectModalProps {
    onClose: () => void;
    project?: Project; // if provided, we're editing
}

export default function ProjectModal({ onClose, project }: ProjectModalProps) {
    const user = useAuthStore((s) => s.user);
    const addToast = useNotificationStore((s) => s.addToast);
    const setEasterEggStage = useUIStore((s) => s.setEasterEggStage);
    const [title, setTitle] = useState(project?.title || '');
    const [description, setDescription] = useState(project?.description || '');
    const [loading, setLoading] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Watch for "67" in project title to play sound
    useEffect(() => {
        if (title.trim() === '67' && audioRef.current) {
            audioRef.current.currentTime = 0;
            setEasterEggStage(1); // Show the empty bar immediately as feedback
            audioRef.current.onended = () => {
                // Keep stage at 1 during overlay, Stage 2 (filling) happens in EasterEggOverlay
            };
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    }, [title, setEasterEggStage]);

    const isEditing = !!project;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            if (isEditing && project) {
                await updateProject(project.id, { title: title.trim(), description: description.trim() });
                addToast('Project updated!', 'success');
            } else if (user) {
                await createProject(
                    { title: title.trim(), description: description.trim(), memberEmails: [] },
                    user.uid
                );
                addToast('Project created!', 'success');
            }
            onClose();
        } catch {
            addToast(isEditing ? 'Failed to update project' : 'Failed to create project', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title={isEditing ? 'Edit Project' : 'New Project'} onClose={onClose}>
            {/* Hidden audio element for the easter egg */}
            <audio ref={audioRef} src="/sound-67.mp3" preload="auto" />
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="project-title">Title</label>
                    <input
                        id="project-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter project title... only not 67"
                        required
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="project-description">Description</label>
                    <textarea
                        id="project-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe this project..."
                        rows={3}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()}>
                        {loading ? (
                            <span className="btn-loading"><div className="spinner spinner-xs" /> Saving...</span>
                        ) : isEditing ? 'Update' : 'Create Project'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
