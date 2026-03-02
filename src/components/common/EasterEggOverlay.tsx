import { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function EasterEggOverlay() {
    const easterEggStage = useUIStore(s => s.easterEggStage);
    const setEasterEggStage = useUIStore(s => s.setEasterEggStage);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (easterEggStage === 1) {
            setVisible(true);
            const timer1 = setTimeout(() => {
                setVisible(false);
            }, 3000); // Overlay visible for 3 seconds

            const timer2 = setTimeout(() => {
                setEasterEggStage(2);
            }, 3500); // Stage 2 starts after overlay fades out

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [easterEggStage, setEasterEggStage]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="easter-egg-overlay-screen"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <h1 className="easter-egg-text">Find them all.</h1>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
