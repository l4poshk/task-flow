import { useQuery } from '@tanstack/react-query';
import { fetchExternalPosts, fetchExternalUsers } from '../services/apiClient';
import type { ExternalPost, ExternalUser } from '../services/apiClient';

export function useExternalPosts() {
    return useQuery<ExternalPost[]>({
        queryKey: ['external-posts'],
        queryFn: fetchExternalPosts,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        refetchOnWindowFocus: false,
    });
}

export function useExternalUsers() {
    return useQuery<ExternalUser[]>({
        queryKey: ['external-users'],
        queryFn: fetchExternalUsers,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}
