import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, initialIndex, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState(0);
    const imageRef = useRef<HTMLDivElement>(null);
    const touchStartDistance = useRef<number | null>(null);
    const initialScale = useRef<number>(1);

    // Reset zoom when image changes or gallery opens
    const resetZoom = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setDirection(0);
            resetZoom();
        }
    }, [isOpen, initialIndex, resetZoom]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (scale > 1) return; // Prevent paging when zoomed
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
        resetZoom();
    }, [images.length, scale, resetZoom]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (scale > 1) return; // Prevent paging when zoomed
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        resetZoom();
    }, [images.length, scale, resetZoom]);

    // Handle Wheel Zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!isOpen) return;
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        setScale(prev => Math.min(Math.max(1, prev + delta), 5));
    }, [isOpen]);

    // Handle Double Click / Tap
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (scale > 1) {
            resetZoom();
        } else {
            setScale(2.5);
        }
    }, [scale, resetZoom]);

    // Pinch-to-zoom logic for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            touchStartDistance.current = distance;
            initialScale.current = scale;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchStartDistance.current !== null) {
            const distance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const delta = distance / touchStartDistance.current;
            const newScale = Math.min(Math.max(1, initialScale.current * delta), 5);
            setScale(newScale);
        }
    };

    const handleTouchEnd = () => {
        touchStartDistance.current = null;
    };

    // Handle keyboard events
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (scale === 1) {
                if (e.key === 'ArrowRight') handleNext();
                if (e.key === 'ArrowLeft') handlePrev();
            }
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') setScale(prev => Math.min(prev + 0.5, 5));
            if (e.key === '-') setScale(prev => Math.max(1, prev - 0.5));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext, handlePrev, onClose, scale]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100vw' : direction < 0 ? '-100vw' : 0,
            opacity: 0
        }),
        center: {
            x: position.x,
            y: position.y,
            scale: scale,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? '-100vw' : direction < 0 ? '100vw' : 0,
            opacity: 0
        })
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            id="image-gallery-overlay"
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center select-none overflow-hidden touch-none"
            onWheel={handleWheel}
        >
            {/* Close Button */}
            <button
                id="gallery-close-btn"
                onClick={onClose}
                className="absolute top-6 right-6 z-[10000] text-white/50 hover:text-white transition-all p-3 hover:bg-white/10 rounded-full"
            >
                <X size={32} />
            </button>

            {/* Zoom Controls */}
            <div id="gallery-zoom-controls" className="absolute top-6 left-6 z-[10000] flex gap-2">
                <button
                    onClick={() => setScale(prev => Math.max(1, prev - 0.5))}
                    disabled={scale === 1}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all disabled:opacity-20"
                >
                    <ZoomOut size={24} />
                </button>
                <button
                    onClick={() => setScale(prev => Math.min(5, prev + 0.5))}
                    disabled={scale === 5}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all disabled:opacity-20"
                >
                    <ZoomIn size={24} />
                </button>
                <button
                    onClick={resetZoom}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all"
                >
                    <Maximize size={24} />
                </button>
            </div>

            {/* Navigation Buttons (Desktop) - Hidden when zoomed */}
            {images.length > 1 && scale === 1 && (
                <>
                    <button
                        id="gallery-prev-btn"
                        onClick={handlePrev}
                        className="absolute left-6 z-[10000] text-white/50 hover:text-white transition-all p-4 bg-white/5 hover:bg-white/10 rounded-full hidden md:flex items-center justify-center"
                    >
                        <ChevronLeft size={40} />
                    </button>
                    <button
                        id="gallery-next-btn"
                        onClick={handleNext}
                        className="absolute right-6 z-[10000] text-white/50 hover:text-white transition-all p-4 bg-white/5 hover:bg-white/10 rounded-full hidden md:flex items-center justify-center"
                    >
                        <ChevronRight size={40} />
                    </button>
                </>
            )}

            {/* Image Container with Framer Motion */}
            <div
                id="gallery-image-wrapper"
                className="relative w-full h-full flex items-center justify-center p-4 md:p-12 touch-none"
                onClick={onClose}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        ref={imageRef}
                        id={`gallery-image-motion-${currentIndex}`}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={scale > 1 ? { type: 'tween', duration: 0.1 } : { type: 'tween', ease: 'linear', duration: 0.2 }}
                        drag={scale > 1 ? true : "x"}
                        dragConstraints={scale > 1 ? false : { left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                            if (scale === 1) {
                                if (info.offset.x > 100) handlePrev();
                                else if (info.offset.x < -100) handleNext();
                            }
                        }}
                        onUpdate={(latest) => {
                            if (scale > 1) {
                                setPosition({ x: latest.x as number, y: latest.y as number });
                            }
                        }}
                        className={`max-w-full max-h-full flex items-center justify-center ${scale > 1 ? 'cursor-move' : 'cursor-zoom-in'}`}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={handleDoubleClick}
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`Gallery image ${currentIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-none"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Indicators / Index - Hidden when zoomed */}
            {images.length > 1 && scale === 1 && (
                <div id="gallery-indicators" className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setDirection(idx > currentIndex ? 1 : -1); setCurrentIndex(idx); resetZoom(); }}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                    <span className="text-white/60 text-sm font-bold tracking-widest uppercase">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>
            )}
        </div>,
        document.body
    );
};

export default ImageGallery;
