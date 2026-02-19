import React from 'react';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

interface ImageGalleryProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, initialIndex, isOpen, onClose }) => {
    // Képek átalakítása a Lightbox számára szükséges formátumra
    const slides = images.map((src) => ({ src }));

    return (
        <Lightbox
            open={isOpen}
            close={onClose}
            index={initialIndex}
            slides={slides}
            plugins={[Zoom, Counter]}
            // Zoom beállítások
            zoom={{
                maxZoomPixelRatio: 5,
                scrollToZoom: true,
                doubleTapDelay: 300,
                doubleClickDelay: 300,
                doubleClickMaxStops: 2,
                keyboardMoveDistance: 50,
                wheelZoomDistanceFactor: 100,
                pinchZoomDistanceFactor: 100,
            }}
            // Számláló beállítások
            counter={{
                container: {
                    style: {
                        top: "unset",
                        bottom: "35px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "14px",
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                        color: "rgba(255, 255, 255, 0.6)"
                    }
                }
            }}
            // Egyedi renderelés és stílusok
            render={{
                buttonPrev: images.length <= 1 ? () => null : undefined,
                buttonNext: images.length <= 1 ? () => null : undefined,
            }}
            styles={{
                container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
            }}
            // Animációk
            animation={{ fade: 250, swipe: 300 }}
        />
    );
};

export default ImageGallery;
