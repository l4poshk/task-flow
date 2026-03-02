import { useEffect, useState } from 'react';

export default function WelcomeScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Display for 2 seconds, then start fading out
        const fadeTimer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);

        // Remove from DOM entirely after the fade transition finishes
        const removeTimer = setTimeout(() => {
            setShouldRender(false);
        }, 2800);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div className={`welcome-overlay ${!isVisible ? 'fade-out' : ''}`}>
            <div className="welcome-content">
                <h1 className="welcome-text">hello sweetie <span style={{ fontFamily: 'sans-serif' }}>❤️</span></h1>
            </div>
        </div>
    );
}
