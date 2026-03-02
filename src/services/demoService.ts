import type { Project, ProjectFormData, Task, TaskFormData, TaskStatus } from '../types';

const PROJECTS_KEY = 'taskflow_demo_projects';
const TASKS_KEY = 'taskflow_demo_tasks';

// --- LocalStorage Helpers ---

function getLocalProjects(): Project[] {
    const saved = localStorage.getItem(PROJECTS_KEY);
    if (!saved) return [];
    const projects = JSON.parse(saved) as any[];
    return projects.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
    }));
}

function saveLocalProjects(projects: Project[]) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function getLocalTasks(): Task[] {
    const saved = localStorage.getItem(TASKS_KEY);
    if (!saved) return [];
    const tasks = JSON.parse(saved) as any[];
    return tasks.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
    }));
}

function saveLocalTasks(tasks: Task[]) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// --- Project Service Demo Mode ---

export async function demoCreateProject(data: ProjectFormData, ownerId: string): Promise<string> {
    const projects = getLocalProjects();
    const newProject: Project = {
        id: 'proj-' + Math.random().toString(36).substr(2, 9),
        title: data.title,
        description: data.description,
        ownerId,
        memberIds: [ownerId],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    projects.push(newProject);
    saveLocalProjects(projects);
    window.dispatchEvent(new Event('storage'));
    return newProject.id;
}

export async function demoUpdateProject(projectId: string, data: Partial<ProjectFormData>): Promise<void> {
    const projects = getLocalProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
        projects[index] = { ...projects[index], ...data, updatedAt: new Date() };
        saveLocalProjects(projects);
        window.dispatchEvent(new Event('storage'));
    }
}

export async function demoDeleteProject(projectId: string): Promise<void> {
    const projects = getLocalProjects().filter(p => p.id !== projectId);
    saveLocalProjects(projects);
    const tasks = getLocalTasks().filter(t => t.projectId !== projectId);
    saveLocalTasks(tasks);
    window.dispatchEvent(new Event('storage'));
}

// --- Task Service Demo Mode ---

export async function demoCreateTask(projectId: string, data: TaskFormData): Promise<string> {
    const tasks = getLocalTasks();
    const newTask: Task = {
        id: 'task-' + Math.random().toString(36).substr(2, 9),
        projectId,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId,
        assigneeName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    tasks.push(newTask);
    saveLocalTasks(tasks);
    window.dispatchEvent(new Event('storage'));
    return newTask.id;
}

export async function demoUpdateTask(_projectId: string, taskId: string, data: Partial<TaskFormData>): Promise<void> {
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...data, updatedAt: new Date() };
        saveLocalTasks(tasks);
        window.dispatchEvent(new Event('storage'));
    }
}

export async function demoUpdateTaskStatus(_projectId: string, taskId: string, status: TaskStatus): Promise<void> {
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], status, updatedAt: new Date() };
        saveLocalTasks(tasks);
        window.dispatchEvent(new Event('storage'));
    }
}

export async function demoDeleteTask(_projectId: string, taskId: string): Promise<void> {
    const tasks = getLocalTasks().filter(t => t.id !== taskId);
    saveLocalTasks(tasks);
    window.dispatchEvent(new Event('storage'));
}

export async function demoAddMemberToProject(projectId: string, userId: string): Promise<void> {
    const projects = getLocalProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1 && !projects[index].memberIds.includes(userId)) {
        projects[index].memberIds.push(userId);
        saveLocalProjects(projects);
        window.dispatchEvent(new Event('storage'));
    }
}

export async function demoRemoveMemberFromProject(projectId: string, userId: string): Promise<void> {
    const projects = getLocalProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
        projects[index].memberIds = projects[index].memberIds.filter(id => id !== userId);
        saveLocalProjects(projects);
        window.dispatchEvent(new Event('storage'));
    }
}

export function demoSubscribeToProjects(userId: string, callback: (projects: Project[]) => void): () => void {
    const handler = () => {
        const all = getLocalProjects();
        const filtered = all.filter(p => p.memberIds.includes(userId));
        callback(filtered);
    };
    window.addEventListener('storage', handler);
    handler(); // Initial call
    return () => window.removeEventListener('storage', handler);
}

export function demoSubscribeToTasks(projectId: string, callback: (tasks: Task[]) => void): () => void {
    const handler = () => {
        const all = getLocalTasks();
        const filtered = all.filter(t => t.projectId === projectId);
        callback(filtered);
    };
    window.addEventListener('storage', handler);
    handler(); // Initial call
    return () => window.removeEventListener('storage', handler);
}
