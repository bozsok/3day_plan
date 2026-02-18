import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 2, // Engedünk kicsit többet a minőségért
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        fileType: 'image/webp',
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        return file;
    }
};

export const compressImages = async (files: File[]): Promise<File[]> => {
    return Promise.all(files.map(file => compressImage(file)));
};
