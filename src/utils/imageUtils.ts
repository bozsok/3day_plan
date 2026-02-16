import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 1, // Kicsit szigorúbb, hogy biztosan gyors legyen
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        fileType: 'image/webp', // WebP preferált
    };

    try {
        const compressedFile = await imageCompression(file, options);
        // Ha a tömörített nagyobb lenne (ritka, de előfordulhat már optimalizált képeknél), akkor az eredetit adjuk vissza
        return compressedFile.size < file.size ? compressedFile : file;
    } catch (error) {
        console.error('Image compression failed:', error);
        return file; // Hiba esetén az eredetit küldjük
    }
};

export const compressImages = async (files: File[]): Promise<File[]> => {
    return Promise.all(files.map(file => compressImage(file)));
};
