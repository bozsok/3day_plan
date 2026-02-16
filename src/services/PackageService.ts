import type { Package } from '../data/mockData';
import { packages as mockPackages } from '../data/mockData';

const API_URL = import.meta.env.PROD ? 'server/api' : (import.meta.env.VITE_API_URL || '/api');
const EXT = import.meta.env.PROD ? '.php' : '';
const UPLOAD_FIELD_NAME = import.meta.env.PROD ? 'images[]' : 'images';

const LEGACY_ICON_MAP: Record<string, string> = {
    // Csomag címkék
    'flag': '🌲', // Hegyvidék
    'spa': '🧖‍♀️',
    'self_improvement': '🧘', // Relax
    'wine_bar': '🍷',
    'restaurant': '🍽️',
    'pets': '🦅', // Természet (sas/állat)
    'museum': '🏺',
    'hiking': '🥾',
    'castle': '🏰',
    'sailing': '⛵',
    'directions_bike': '🚴',
    'festival': '🎉',

    // Programpontok
    'luggage': '🧳',
    'wb_sunny': '☀️', // Napos/Reggeli
    'directions_walk': '🚶',
    'shopping_bag': '🛍️',
    'dinner_dining': '🍽️',
    'terrain': '🚙', // Dűlőtúra
    'directions_car': '🚗',
    'photo_camera': '🌉', // Kilenclyukú híd/Fotózás
    'agriculture': '🐂', // Puszta
    'potted_plant': '🦅', // Madárpark
    'menu_book': '🏛️', // Pásztormúzeum
    'directions_boat': '🚢',
    'palette': '🎨',
    'fort': '🏰',
    'kayaking': '🛶',
    'park': '🌳',
    'church': '⛪',
    'sunny': '🌅', // Naplemente
    'pool': '🏊',
    'bus': '🚌',
    'train': '🚂',
    'flight': '✈️'
};

function migrateLegacyIcons(pkg: any): any {
    // 1. Címkék (tags)
    if (pkg.tags && Array.isArray(pkg.tags)) {
        pkg.tags = pkg.tags.map((tag: any) => ({
            ...tag,
            icon: LEGACY_ICON_MAP[tag.icon] || tag.icon // Ha nincs a map-ben, marad az eredeti (ami lehet már emoji vagy ismeretlen string)
        }));
    }

    // 2. Napok és programpontok (days -> items)
    if (pkg.days && Array.isArray(pkg.days)) {
        pkg.days = pkg.days.map((day: any) => ({
            ...day,
            items: day.items.map((item: any) => ({
                ...item,
                icon: LEGACY_ICON_MAP[item.icon] || item.icon
            }))
        }));
    }

    return pkg;
}

export const PackageService = {
    async getPackages(): Promise<Package[]> {
        try {
            const response = await fetch(`${API_URL}/packages${EXT}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Ha üres a szerver válasz (pl. admin törölt mindent), akkor üres tömböt adunk vissza.
            // NEM fallbackelünk mock adatokra, mert akkor nem lehetne kiüríteni a rendszert.
            if (!Array.isArray(data)) {
                console.warn('Server returned non-array:', data);
                return [];
            }

            // MIGRÁCIÓ: Régi ikonok cseréje emojikra (csak a megjelenítéshez, a DB marad változatlan egyelőre)
            const migratedPackages = data.map(migrateLegacyIcons);
            return migratedPackages;
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
            formData.append(UPLOAD_FIELD_NAME, file, fileName);
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
            // If file path starts with '/', it's an absolute path from server root (Node/Dev)
            if (file.startsWith('/')) {
                return file;
            }
            // Otherwise it's relative, so prepend API_URL (PHP/Prod)
            const cleanFile = file;
            const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            return `${cleanApiUrl}/${cleanFile}`;
        });
    }


};
