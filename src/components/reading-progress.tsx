'use client';

import { useEffect, useRef, useCallback } from 'react';

export function ReadingProgress() {
    const progressRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const lastProgressRef = useRef(0);

    const updateProgress = useCallback(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        const newProgress = Math.min(100, Math.max(0, scrollPercent));

        // Only update if changed significantly (reduces repaints)
        if (Math.abs(newProgress - lastProgressRef.current) > 0.1) {
            lastProgressRef.current = newProgress;
            if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${newProgress / 100})`;
            }
        }
    }, []);

    const handleScroll = useCallback(() => {
        // Cancel any pending animation frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        // Schedule update on next frame for smooth 60fps animation
        rafRef.current = requestAnimationFrame(updateProgress);
    }, [updateProgress]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        updateProgress(); // Initial update

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [handleScroll, updateProgress]);

    return (
        <div
            ref={progressRef}
            className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-primary"
            style={{
                transform: 'scaleX(0)',
                transition: 'transform 0.1s ease-out',
                willChange: 'transform'
            }}
            role="progressbar"
            aria-valuenow={Math.round(lastProgressRef.current)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
        />
    );
}
