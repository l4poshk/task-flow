import { useExternalPosts, useExternalUsers } from '../../hooks/useExternalData';
import { Globe, RefreshCw, User, ExternalLink } from 'lucide-react';

export default function ExternalDataWidget() {
    const { data: posts, isLoading: postsLoading, error: postsError, refetch, dataUpdatedAt } = useExternalPosts();
    const { data: users, isLoading: usersLoading } = useExternalUsers();

    const isLoading = postsLoading || usersLoading;

    const getUserName = (post: any) => {
        if (post.authorName) return post.authorName;
        return users?.find((u) => u.id === post.userId)?.name || 'Unknown Author';
    };

    const lastUpdated = dataUpdatedAt
        ? new Date(dataUpdatedAt).toLocaleTimeString()
        : null;

    return (
        <div className="widget external-widget">
            <div className="widget-header">
                <div className="widget-title">
                    <Globe size={18} />
                    <h3>Live Feed</h3>
                </div>
                <div className="widget-actions">
                    {lastUpdated && (
                        <span className="widget-timestamp">Updated {lastUpdated}</span>
                    )}
                    <button
                        className="icon-btn icon-btn-sm"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        title="Refresh"
                    >
                        <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="widget-body">
                {isLoading ? (
                    <div className="widget-loading">
                        <div className="spinner" />
                        <p>Loading live data...</p>
                    </div>
                ) : postsError ? (
                    <div className="widget-error">
                        <p>Failed to load data</p>
                        <button className="btn btn-sm btn-primary" onClick={() => refetch()}>
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="external-posts">
                        {posts?.map((post) => (
                            <div key={post.id} className="external-post-card">
                                <h4>{post.title}</h4>
                                <p>{post.body.substring(0, 100)}...</p>
                                <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="post-author">
                                        <User size={12} />
                                        {getUserName(post)}
                                    </span>
                                    {post.url && (
                                        <a
                                            href={post.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="external-post-link"
                                            title="Read full article"
                                            style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', opacity: 0.8, transition: 'opacity 0.2s' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
