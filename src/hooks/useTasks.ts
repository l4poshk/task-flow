import { useState, useEffect } from 'react';
import { subscribeToProjectTasks } from '../services/taskService';
import type { Task } from '../types';

export function useTasks(projectId: string | undefined) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToProjectTasks(projectId, (data) => {
            setTasks(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [projectId]);

    return { tasks, loading };
}
