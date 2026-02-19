



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
// A HashRouter mellett a relatív útvonal (mostantól fixen a gyökérhez képest) stabil marad.
const API_URL = import.meta.env.PROD ? 'server/api' : '/api';
const EXT = import.meta.env.PROD ? '.php' : '';

// Helper for cache busting and safe relative URLs
const getUrl = (endpoint: string, params: Record<string, any> = {}) => {
    // A relatív utat az API_URL-ből építjük fel
    const relativePath = `${API_URL}/${endpoint}${EXT}`;
    // A böngésző a window.location.href-hez képest oldja fel a relatív utat
    const url = new URL(relativePath, window.location.href);

    Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, String(val)));
    url.searchParams.append('t', Date.now().toString()); // Cache busting
    return url.toString();
};

export const api = {
    users: {
        login: async (name: string, password: string): Promise<User> => {
            const res = await fetch(getUrl('users'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });
            if (res.status === 401) throw new Error('Hibás jelszó');
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        },
        get: async (userId: number): Promise<User> => {
            const res = await fetch(getUrl('users', { userId }));
            if (!res.ok) throw new Error('User fetch failed');
            return res.json();
        }
    },
    dates: {
        save: async (userId: number, dates: string[], regionId?: string) => {
            const res = await fetch(getUrl('dates'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dates, regionId }),
            });
            if (!res.ok) {
                throw new Error(`Date save failed: ${res.statusText}`);
            }
            return res.json();
        },
        delete: async (userId: number, dates: string[], regionId?: string) => {
            const res = await fetch(getUrl('dates'), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dates, regionId }),
            });
            if (!res.ok) throw new Error('Date delete failed');
            return res.json();
        }
    },
    votes: {
        cast: async (userId: number, regionId: string, dates: string[], packageId?: string) => {
            const res = await fetch(getUrl('votes'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, regionId, dates, packageId }),
            });
            if (!res.ok) throw new Error('Vote failed');
            return res.json();
        },
        revoke: async (userId: number, blockId: number) => {
            const res = await fetch(getUrl('votes'), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, blockId }),
            });
            if (!res.ok) throw new Error('Vote revoke failed');
            return res.json();
        },
        list: async (userId: number): Promise<VoteBlock[]> => {
            const res = await fetch(getUrl('votes', { userId }));
            if (!res.ok) throw new Error('Vote list failed');
            return res.json();
        }
    },
    summary: {
        get: async () => {
            const res = await fetch(getUrl('summary'));
            if (!res.ok) throw new Error('Summary fetch failed');
            return res.json();
        }
    },
    progress: {
        update: async (userId: number, data: { hasDates?: boolean, regionId?: string | null, packageId?: string | null, dates?: string[] }) => {
            const res = await fetch(getUrl('progress'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...data }),
            });
            if (!res.ok) throw new Error('Progress update failed');
            return res.json();
        },
        clear: async (userId: number) => {
            const res = await fetch(getUrl('progress', { action: 'clear', userId }), {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Progress clear failed');
            return res.json();
        }
    },
    admin: {
        reset: async () => {
            const res = await fetch(getUrl('admin', { action: 'reset' }), { method: 'POST' });
            if (!res.ok) throw new Error('Admin reset failed');
            return res.json();
        },
        resetUserVote: async (id: number) => {
            const res = await fetch(getUrl('admin', { action: 'reset_user_vote', id }), { method: 'POST' });
            if (!res.ok) throw new Error('Admin reset user vote failed');
            return res.json();
        },
        deleteUser: async (id: number) => {
            const res = await fetch(getUrl('admin', { action: 'delete_user', id }), { method: 'DELETE' });
            if (!res.ok) throw new Error('Admin delete user failed');
            return res.json();
        }
    }
};
