import type { Package } from '../data/mockData';
import { packages as mockPackages } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'; // Vagy relatív útvonal productionben

export const PackageService = {
    async getPackages(): Promise<Package[]> {
        try {
            const response = await fetch(`${API_URL}/packages`);
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
        const response = await fetch(`${API_URL}/packages`, {
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
        files.forEach((file) => {
            formData.append('images', file); // Node.js multer usually expects 'images' not 'images[]' unless configured otherwise
        });

        const response = await fetch(`${API_URL}/upload`, { // Feltételezve, hogy lesz upload route is
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload images');
        }

        const data = await response.json();
        return data.files || [];
    }
};
