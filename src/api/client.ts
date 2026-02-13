



/* ── API definíciók ── */

/* ── API definíciók ── */

export interface DateSelectionItem {
    date: string;
    regionId: string | null;
}

export interface VoteBlock {
    id: number;
    regionId: string;
    dates: string[];
    createdAt: string;
}

export interface User {
    id: number;
    name: string;
    dateSelections: DateSelectionItem[];
    voteBlocks: VoteBlock[];
}

// PHP Backend URL
const API_URL = import.meta.env.PROD ? 'server/api' : '/api';
const EXT = import.meta.env.PROD ? '.php' : '';

export const api = {
    users: {
        login: async (name: string): Promise<User> => {
            const res = await fetch(`${API_URL}/users${EXT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        },
        get: async (userId: number): Promise<User> => {
            // PHP uses query param: users.php?userId=1
            // Node uses path param: users/1
            const url = import.meta.env.PROD
                ? `${API_URL}/users${EXT}?userId=${userId}`
                : `${API_URL}/users/${userId}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('User fetch failed');
            return res.json();
        }
    },
    dates: {
        save: async (userId: number, dates: string[], regionId?: string) => {
            console.log('Sending date save request:', { userId, dates, regionId });
            const res = await fetch(`${API_URL}/dates${EXT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dates, regionId }),
            });
            if (!res.ok) {
                const text = await res.text();
                console.error('Date save failed response:', text);
                throw new Error(`Date save failed: ${res.statusText}`);
            }
            return res.json(); // Returns { userId, dateSelections: [...] }
        },
        delete: async (userId: number, dates: string[], regionId?: string) => {
            const res = await fetch(`${API_URL}/dates${EXT}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dates, regionId }),
            });
            if (!res.ok) throw new Error('Date delete failed');
            return res.json();
        }
    },
    votes: {
        // ÚJ: 3 napos blokk létrehozása
        cast: async (userId: number, regionId: string, dates: string[]) => {
            const res = await fetch(`${API_URL}/votes${EXT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, regionId, dates }),
            });
            if (!res.ok) throw new Error('Vote failed');
            return res.json();
        },
        // ÚJ: Blokk törlése ID alapján
        revoke: async (userId: number, blockId: number) => {
            const res = await fetch(`${API_URL}/votes${EXT}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, blockId }),
            });
            if (!res.ok) throw new Error('Vote revoke failed');
            return res.json();
        },
        list: async (userId: number): Promise<VoteBlock[]> => {
            const res = await fetch(`${API_URL}/votes${EXT}?userId=${userId}`);
            if (!res.ok) throw new Error('Vote list failed');
            return res.json();
        }
    },
    summary: {
        get: async () => {
            const res = await fetch(`${API_URL}/summary${EXT}`);
            if (!res.ok) throw new Error('Summary fetch failed');
            return res.json();
        }
    },
    admin: {
        reset: async () => {
            const res = await fetch(`${API_URL}/admin/reset`, { method: 'POST' });
            if (!res.ok) throw new Error('Admin reset failed');
            return res.json();
        },
        deleteUser: async (id: number) => {
            const res = await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Admin delete user failed');
            return res.json();
        }
    }
};
