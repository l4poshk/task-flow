import axios from 'axios';

// Standardized HTTP client for external API calls
const apiClient = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add any auth tokens or custom headers here
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        console.error('[API Error]', message);
        return Promise.reject(error);
    }
);

export default apiClient;

// --- API Functions ---

export interface ExternalPost {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export interface ExternalUser {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    website: string;
    company: { name: string; catchPhrase: string; bs: string };
}

// Fetch recent posts from JSONPlaceholder
export async function fetchExternalPosts(): Promise<ExternalPost[]> {
    const response = await apiClient.get<ExternalPost[]>('/posts', {
        params: { _limit: 6 },
    });
    return response.data;
}

// Fetch users from JSONPlaceholder
export async function fetchExternalUsers(): Promise<ExternalUser[]> {
    const response = await apiClient.get<ExternalUser[]>('/users');
    return response.data;
}
