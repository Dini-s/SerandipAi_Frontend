import { useState, useEffect } from 'react';

export const useResponsive = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        let timeoutId;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }, 150);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return {
        isMobile: windowSize.width < 640,
        isTablet: windowSize.width >= 640 && windowSize.width < 1024,
        isDesktop: windowSize.width >= 1024,
        isLandscape: windowSize.width > windowSize.height,
        isPortrait: windowSize.width < windowSize.height,
        width: windowSize.width,
        height: windowSize.height,
    };
};