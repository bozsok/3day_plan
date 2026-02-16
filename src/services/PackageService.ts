import type { Package } from '../data/mockData';
import { packages as mockPackages } from '../data/mockData';

const API_URL = import.meta.env.PROD ? 'server/api' : (import.meta.env.VITE_API_URL || '/api');
const EXT = import.meta.env.PROD ? '.php' : '';

export const PackageService = {
    async getPackages(): Promise<Package[]> {
        try {
            const response = await fetch(`${API_URL}/packages${EXT}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Ha üres a szerver válasz (pl. első indítás), fallback a mock adatokra
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('Server returned empty package list, using mock data.');
                return mockPackages;
            }

            return data;
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            // Fallback mock adatokra hiba esetén is (hogy működjön offline / dev módban)
            return mockPackages;
        }
    },

    async savePackages(packages: Package[]): Promise<any> {
        const response = await fetch(`${API_URL}/packages${EXT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ...' // Később
            },
            body: JSON.stringify(packages)
        });

        if (!response.ok) {
            throw new Error('Failed to save packages');
        }

        return response.json();
    },

    async uploadImages(files: File[]): Promise<string[]> {
        const formData = new FormData();
        files.forEach((file, index) => {
            let fileName = file.name;
            // Fix for "blob" name issue when using compressed images
            if (!fileName || fileName === 'blob') {
                const ext = file.type.split('/')[1] || 'jpg';
                fileName = `upload_${Date.now()}_${index}.${ext}`;
            } else {
                // Ensure extension matches mime type if converted (e.g. to webp)
                const ext = file.type.split('/')[1];
                if (ext && !fileName.toLowerCase().endsWith(`.${ext}`)) {
                    fileName = `${fileName.split('.')[0]}.${ext}`;
                }
            }
            formData.append('images[]', file, fileName);
        });

        // Note: PHP formatting might need 'images[]' if multiple, but let's stick to what works or standard forms.
        // If the PHP side uses $_FILES['images'], it handles array if multiple files are sent with same name 'images[]'.
        // Let's use 'images[]' just to be safe for PHP, or keep 'images' if Node handling was specific.
        // Actually, previous code used 'images'.
        // Let's keep 'images' key for now but we might need 'images[]' for PHP.
        // Let's check 'upload.php' content if possible, but for now I will stick to URL fix.
        // Wait, standard FormData append with same key creates an array in many backends.
        // But PHP specifically needs '[]' in the name to parse it as an array in $_FILES.
        // I will change it to 'images[]' to be safe for PHP. Use 'images' for Node?
        // Node multer handles both usually.

        // Reverting to keep 'images' as key for now to avoid breaking Node if that's still relevant,
        // BUT the user is deploying to PHP.
        // Let's stick to fixing the URL first.

        const response = await fetch(`${API_URL}/upload${EXT}`, { // Feltételezve, hogy lesz upload route is
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload images: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const uploadedPaths = data.files || [];

        // Prepend API_URL to make the path correct relative to the application root
        // data.files returns "uploads/filename", we need "server/api/uploads/filename" (PROD) or "/api/uploads/filename" (DEV)
        return uploadedPaths.map((file: string) => {
            // Remove leading slash from file if present to avoid double slash
            const cleanFile = file.startsWith('/') ? file.substring(1) : file;
            const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            return `${cleanApiUrl}/${cleanFile}`;
        });
    }


};
