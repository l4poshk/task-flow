import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    getDocs,
    Timestamp,
} from 'firebase/firestore';
import { db, firebaseInitialized, isDemoMode } from './firebase';
import type { Project, ProjectFormData } from '../types';
import {
    demoCreateProject,
    demoUpdateProject,
    demoDeleteProject,
    demoAddMemberToProject,
    demoRemoveMemberFromProject,
    demoSubscribeToProjects
} from './demoService';

const COLLECTION = 'projects';

function docToProject(id: string, data: Record<string, unknown>): Project {
    return {
        id,
        title: data.title as string,
        description: data.description as string,
        ownerId: data.ownerId as string,
        memberIds: data.memberIds as string[],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
}

// Create a new project
export async function createProject(data: ProjectFormData, ownerId: string): Promise<string> {
    if (isDemoMode) return demoCreateProject(data, ownerId);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const ref = await addDoc(collection(db, COLLECTION), {
        title: data.title,
        description: data.description,
        ownerId,
        memberIds: [ownerId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

// Update an existing project
export async function updateProject(projectId: string, data: Partial<ProjectFormData>): Promise<void> {
    if (isDemoMode) return demoUpdateProject(projectId, data);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const ref = doc(db, COLLECTION, projectId);
    await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// Delete a project and all its tasks
export async function deleteProject(projectId: string): Promise<void> {
    if (isDemoMode) return demoDeleteProject(projectId);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    // Delete all tasks in the project
    const tasksRef = collection(db, COLLECTION, projectId, 'tasks');
    const tasksSnap = await getDocs(tasksRef);
    const deletePromises = tasksSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    // Delete the project
    await deleteDoc(doc(db, COLLECTION, projectId));
}

// Add a member to a project by userId
export async function addMemberToProject(projectId: string, userId: string): Promise<void> {
    if (isDemoMode) return demoAddMemberToProject(projectId, userId);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const ref = doc(db, COLLECTION, projectId);
    await updateDoc(ref, {
        memberIds: arrayUnion(userId),
        updatedAt: serverTimestamp(),
    });
}

// Remove a member from a project
export async function removeMemberFromProject(projectId: string, userId: string): Promise<void> {
    if (isDemoMode) return demoRemoveMemberFromProject(projectId, userId);
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const ref = doc(db, COLLECTION, projectId);
    await updateDoc(ref, {
        memberIds: arrayRemove(userId),
        updatedAt: serverTimestamp(),
    });
}

// Subscribe to user's projects (real-time)
export function subscribeToUserProjects(
    userId: string,
    callback: (projects: Project[]) => void
): () => void {
    if (isDemoMode) return demoSubscribeToProjects(userId, callback);
    if (!firebaseInitialized) {
        setTimeout(() => callback([]), 0);
        return () => { };
    }
    const q = query(
        collection(db, COLLECTION),
        where('memberIds', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map((d) =>
            docToProject(d.id, d.data() as Record<string, unknown>)
        );
        projects.sort((a, b) => {
            const timeA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime();
            const timeB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime();
            return timeB - timeA;
        });
        callback(projects);
    });
}
