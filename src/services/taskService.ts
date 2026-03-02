import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db, firebaseInitialized, isDemoMode } from './firebase';
import type { Task, TaskFormData, TaskStatus } from '../types';
import {
    demoCreateTask,
    demoUpdateTask,
    demoUpdateTaskStatus,
    demoDeleteTask,
    demoSubscribeToTasks
} from './demoService';

function docToTask(id: string, projectId: string, data: Record<string, unknown>): Task {
    return {
        id,
        title: data.title as string,
        description: (data.description as string) || '',
        status: data.status as TaskStatus,
        priority: data.priority as Task['priority'],
        dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : null,
        assigneeId: (data.assigneeId as string) || null,
        assigneeName: (data.assigneeName as string) || null,
        projectId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
}

// Create a new task in a project
export async function createTask(projectId: string, data: TaskFormData): Promise<string> {
    if (isDemoMode) return demoCreateTask(projectId, data);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const ref = await addDoc(collection(db, 'projects', projectId, 'tasks'), {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
        assigneeId: data.assigneeId,
        assigneeName: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

// Update an existing task
export async function updateTask(
    projectId: string,
    taskId: string,
    data: Partial<TaskFormData>
): Promise<void> {
    if (isDemoMode) return demoUpdateTask(projectId, taskId, data);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const ref = doc(db, 'projects', projectId, 'tasks', taskId);

    const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(data.dueDate);
    } else if (data.dueDate === null) {
        updateData.dueDate = null;
    }

    await updateDoc(ref, updateData);
}

// Update just the status (for drag and drop)
export async function updateTaskStatus(
    projectId: string,
    taskId: string,
    status: TaskStatus
): Promise<void> {
    if (isDemoMode) return demoUpdateTaskStatus(projectId, taskId, status);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const ref = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp(),
    });
}

// Delete a task
export async function deleteTask(projectId: string, taskId: string): Promise<void> {
    if (isDemoMode) return demoDeleteTask(projectId, taskId);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
}

// Subscribe to all tasks in a project (real-time)
export function subscribeToProjectTasks(
    projectId: string,
    callback: (tasks: Task[]) => void
): () => void {
    if (isDemoMode) return demoSubscribeToTasks(projectId, callback);
    if (!firebaseInitialized) {
        setTimeout(() => callback([]), 0);
        return () => { };
    }
    const q = query(
        collection(db, 'projects', projectId, 'tasks'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((d) =>
            docToTask(d.id, projectId, d.data() as Record<string, unknown>)
        );
        callback(tasks);
    });
}
