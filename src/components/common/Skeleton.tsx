
interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    count?: number;
    style?: React.CSSProperties;
}

const Skeleton = ({
    width = '100%',
    height = '1rem',
    borderRadius = 'var(--radius-sm)',
    className = '',
    count = 1,
    style = {},
}: SkeletonProps) => {
    const elements = Array.from({ length: count });

    return (
        <>
            {elements.map((_, i) => (
                <div
                    key={i}
                    className={`skeleton-loader ${className}`}
                    style={{
                        ...style,
                        width: typeof width === 'number' ? `${width}px` : width,
                        height: typeof height === 'number' ? `${height}px` : height,
                        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
                    }}
                />
            ))}
        </>
    );
};

export default Skeleton;
