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
    userId: string | number;
    id: number;
    title: string;
    body: string;
    authorName?: string;
    url?: string;
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

// Fetch recent tech articles from Dev.to API to simulate a real Live Feed
export async function fetchExternalPosts(): Promise<ExternalPost[]> {
    try {
        // We use axios directly here to bypass the JSONPlaceholder baseURL
        const response = await axios.get('https://dev.to/api/articles', {
            params: { per_page: 6, top: 1 },
        });

        // Map the Dev.to article format to match our existing ExternalPost interface
        return response.data.map((article: any) => ({
            id: article.id,
            userId: article.user?.username || 'unknown',
            title: article.title,
            body: article.description || 'Click to read more...',
            authorName: article.user?.name || 'Unknown Author',
            url: article.url
        }));
    } catch (error) {
        console.error('Failed to fetch live feed from Dev.to:', error);
        return [];
    }
}

// Fetch users from JSONPlaceholder
export async function fetchExternalUsers(): Promise<ExternalUser[]> {
    const response = await apiClient.get<ExternalUser[]>('/users');
    return response.data;
}
