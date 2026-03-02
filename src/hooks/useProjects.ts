import { useState, useEffect } from 'react';
import { subscribeToUserProjects } from '../services/projectService';
import { useAuthStore } from '../stores/authStore';
import type { Project } from '../types';

export function useProjects() {
    const user = useAuthStore((s) => s.user);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setProjects([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToUserProjects(user.uid, (data) => {
            setProjects(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    return { projects, loading };
}
