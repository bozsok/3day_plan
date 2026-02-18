import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, initialIndex, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Sync currentIndex with initialIndex when gallery opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Handle keyboard events
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext, handlePrev, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div id="image-gallery-overlay" className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg flex items-center justify-center select-none overflow-hidden">
            {/* Close Button */}
            <button
                id="gallery-close-btn"
                onClick={onClose}
                className="absolute top-6 right-6 z-[10000] text-white/50 hover:text-white transition-all p-3 hover:bg-white/10 rounded-full"
            >
                <X size={32} />
            </button>

            {/* Navigation Buttons (Desktop) */}
            {images.length > 1 && (
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
            <div id="gallery-image-wrapper" className="relative w-full h-full flex items-center justify-center p-4 md:p-12" onClick={onClose}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        id={`gallery-image-motion-${currentIndex}`}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.x > 100) handlePrev();
                            else if (info.offset.x < -100) handleNext();
                        }}
                        className="max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`Gallery image ${currentIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-none"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Indicators / Index */}
            {images.length > 1 && (
                <div id="gallery-indicators" className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
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
