export interface Region {
    id: string;
    name: string;
    description: string;
    /** Label center X coordinate in the 1000×613 SVG viewBox */
    centerX: number;
    /** Label center Y coordinate in the 1000×613 SVG viewBox */
    centerY: number;
    /** County IDs from hu.svg that belong to this region */
    countyIds: string[];
}

/**
 * Magyarország 7 turisztikai régiója (NUTS2 alapú felosztás).
 * Minden régió a hu.svg-ben lévő megyék csoportosításából áll.
 */
export const regions: Region[] = [
    {
        id: 'budapest',
        name: 'Budapest és környéke',
        description: 'Budai Vár, Margit-sziget, Szentendre, Gödöllő',
        centerX: 458, centerY: 261,
        countyIds: ['HUBU', 'HUER', 'HUPE'],
    },
    {
        id: 'kozep-dunantul',
        name: 'Közép-Dunántúl',
        description: 'Székesfehérvár, Velencei-tó, Veszprém',
        centerX: 338, centerY: 300,
        countyIds: ['HUFE', 'HUKE', 'HUVE', 'HUSF', 'HUTB', 'HUDU', 'HUVM'],
    },
    {
        id: 'nyugat-dunantul',
        name: 'Nyugat-Dunántúl',
        description: 'Sopron, Győr, Fertő-tó, Pannonhalma',
        centerX: 160, centerY: 280,
        countyIds: ['HUGS', 'HUVA', 'HUZA', 'HUGY', 'HUSN', 'HUSH', 'HUZE', 'HUNK'],
    },
    {
        id: 'del-dunantul',
        name: 'Dél-Dunántúl',
        description: 'Pécs, Villány, Mohács, Kaposvár',
        centerX: 315, centerY: 483,
        countyIds: ['HUBA', 'HUSO', 'HUTO', 'HUPS', 'HUKV', 'HUSS'],
    },
    {
        id: 'eszak-magyarorszag',
        name: 'Észak-Magyarország',
        description: 'Eger, Bükk, Mátra, Tokaj, Aggtelek',
        centerX: 607, centerY: 137,
        countyIds: ['HUBZ', 'HUHE', 'HUNO', 'HUMI', 'HUEG', 'HUST'],
    },
    {
        id: 'eszak-alfold',
        name: 'Észak-Alföld',
        description: 'Debrecen, Hortobágy, Tisza-tó, Nyíregyháza',
        centerX: 735, centerY: 223,
        countyIds: ['HUSZ', 'HUHB', 'HUJN', 'HUNY', 'HUDE', 'HUSK'],
    },
    {
        id: 'del-alfold',
        name: 'Dél-Alföld',
        description: 'Szeged, Kecskemét, Bugac, Hortobágy',
        centerX: 570, centerY: 420,
        countyIds: ['HUBK', 'HUBE', 'HUCS', 'HUKM', 'HUBC', 'HUSD', 'HUHV'],
    },
];

/**
 * County ID → Region ID lookup (generated from regions array).
 */
export const countyToRegion: Record<string, string> = {};
regions.forEach(r => r.countyIds.forEach(cid => { countyToRegion[cid] = r.id; }));

/* ── Mock programadatok (Csomagok) ── */
export interface ProgramItem {
    id: string;
    time: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    imageUrl?: string;
}

export interface DailyProgram {
    dayIndex: number;
    items: ProgramItem[];
}

export interface PackageTag {
    icon: string;
    label: string;
}

export interface Package {
    id: string;
    regionId: string;
    title: string;
    description: string; // Kártyán megjelenő rövid leírás
    imageUrl: string; // Kártya háttérkép
    tags: PackageTag[]; // Kártya címkék (pl. Túra, Bor, Wellness)
    estimatedCost: string;
    days: DailyProgram[];
}

export const packages: Package[] = [
    // ── Észak-Magyarország ──
    {
        id: 'matrai-magassagok', // Re-created from Tokaji template
        regionId: 'eszak-magyarorszag',
        title: 'Mátrai Magasságok',
        description: 'Hódítsa meg Magyarország legmagasabb csúcsait, töltődjön fel a tiszta hegyi levegőn és élvezze az erdei csendet.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPud2dEWrfLNXmY-oiPgDaJT_DnDZrSEGET7_Ykv2xpEGleogvVeG9OfVu0BpmIz9u_cn3NOP00KjMo3JKIJskjKadeHC73BpAxdUFVGHKh7DBYjV91xj4ax_8QYd9d03iY68nKnNDdOqvlJJJcQdyDofJjcnjOw3l1yix4RBquqwagWhFHQSIjmyuNgUPZAmQ8RAsBV6ggUzIXJSQBQacg8Yjgr_jr8G6gY8JWiFZViNQApnOyZ0_y6lCXpvn7odXFXdtR0Hpt6U',
        tags: [
            { icon: 'flag', label: 'Hegyvidék' },
            { icon: 'spa', label: 'Wellness' },
            { icon: 'self_improvement', label: 'Relax' }
        ],
        estimatedCost: '52.000',
        days: [
            {
                dayIndex: 1,
                items: [
                    { id: 'm1-1', time: '10:00', icon: 'luggage', category: 'ÉRKEZÉS', title: 'Érkezés Mátraházára', description: 'Szállás elfoglalása a hegyek ölelésében.' },
                    { id: 'm1-2', time: '12:00', icon: 'restaurant', category: 'GASZTRO', title: 'Ebéd a Vörösmarty fogadóban', description: 'Vadételek és palóc leves.' },
                    { id: 'm1-3', time: '14:00', icon: 'hiking', category: 'AKTÍV', title: 'Kékestető meghódítása', description: 'Séta Magyarország legmagasabb pontjára.' }
                ]
            },
            { dayIndex: 2, items: [] },
            { dayIndex: 3, items: [] }
        ]
    },
    {
        id: 'tokaji-borvidek',
        regionId: 'eszak-magyarorszag',
        title: 'Tokaji Borvidék',
        description: 'Merüljön el a világhírű aszú hazájában. Pincetúrák, dűlőséták és exkluzív borkóstolók várják.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy9v6A98guH7AZKCtlaRQ81mU_zV6RXbjAkXr2RCmBRHAGiXO3l8Z_ZtJ84nUUI1QDLFGElN_LOVy0s7wzewUL14ZMTXyl2cgsdXtH1k0D8KMximmYYyU7Lbnf5iWrXPmB3IRZLQ3dqzNrhMkcg7sDEfpSzH8C8cjuV5tSrGGd7--dNyaGLfCvy93U0V0hW-AzFd7I80nyAxsZ9YbjZSOorV6-QQD3WK6P2Y29FNPZ9Fdy3Ikvcs1jtZNiOhYVTpF6SojnTJQdsTc',
        tags: [
            { icon: 'wine_bar', label: 'Bor' },
            { icon: 'restaurant', label: 'Gasztró' },
            { icon: 'spa', label: 'Wellness' }
        ],
        estimatedCost: '65.000',
        days: [
            // Copy of original layout but adapted for Tokaj if needed, or keeping generic for now
            {
                dayIndex: 1,
                items: [
                    { id: 't1-1', time: '14:00', icon: 'wine_bar', category: 'KULTÚRA', title: 'Pincelátogatás', description: 'Ismerkedés a Tokaji Aszú készítésével.' }
                ]
            },
            { dayIndex: 2, items: [] },
            { dayIndex: 3, items: [] }
        ]
    },

    // ── Észak-Alföld ──
    {
        id: 'puszta-romantika',
        regionId: 'eszak-alfold',
        title: 'Puszta Romantika',
        description: 'Fedezze fel a Hortobágy varázsát, a kilenclyukú hidat és a végtelen puszta nyugalmát.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYVfkYik-AxXeAwvEOdbbw35cO04hdTTEjF7IB1mktETIU5JLx0hztrGxxaqYmWW9vBdDGntFcOs4ho89HhL4CPYl9aTGK0GibPxu3kF15nVCQ5WeW2GrfZULftIyLpQ5Yz0HRrHVj2dwwPY-GBiAICdgeO9w2nBaDaIzWWQOfiSmrflkdIXVHJ44_nXit-tXMlhnP-zcCMEjwzyCUa8qZS6IhyljQlvVhM-mHeK9Nn8lk8aYLU7j4H0cYtqoHDMobeEoN_j0kdlY', // Placeholder image
        tags: [
            { icon: 'pets', label: 'Természet' },
            { icon: 'restaurant', label: 'Gasztró' },
            { icon: 'museum', label: 'Kultúra' }
        ],
        estimatedCost: '38.000',
        days: [
            {
                dayIndex: 1,
                items: [
                    { id: 'a1-1', time: '10:00', icon: 'directions_car', category: 'ÉRKEZÉS', title: 'Érkezés a Hortobágyra', description: 'Szállás elfoglalása a csárda közelében.' },
                    { id: 'a1-2', time: '12:00', icon: 'photo_camera', category: 'LÁTNIVALÓ', title: 'Kilenclyukú híd', description: 'Séta a világörökség részét képező hídnál.' }
                ]
            },
            { dayIndex: 2, items: [] },
            { dayIndex: 3, items: [] }
        ]
    },

    // ── Budapest és környéke (Dunakanyar) ──
    {
        id: 'dunakanyar-kaland',
        regionId: 'budapest', // Using 'budapest' region for Dunakanyar based on user map logic
        title: 'Dunakanyar Kaland',
        description: 'Fedezze fel a fenséges Dunakanyart, Visegrád történelmi várát és a környék lélegzetelállító panorámáját.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUS-YUmmlaB6dz4HVi4rHseCozEBuOu_3sh6icjVVD-laPuRQSx7NAM4t3_WReZJyPUJbuObjTd9EhPou0mnneryhGWKBhr3S6QXYeOkZCrZETshuiscgq0woXsosTZnAOv9EbFEj5s6liNGfU5K5RCOS8WrwQU1RAHLSDJydykSkI1By3dObKrVI-c4ZTBp8zeBmSgnZgiTecXj1KrJ7v9fvXRZnqonGtmTYRH_gf66Jdm5YlEh7XVa5LWY-m5tPLoFT-DSPo92o',
        tags: [
            { icon: 'hiking', label: 'Túra' },
            { icon: 'castle', label: 'Kultúra' },
            { icon: 'restaurant', label: 'Gasztró' }
        ],
        estimatedCost: '45.000',
        days: [
            { dayIndex: 1, items: [] },
            { dayIndex: 2, items: [] },
            { dayIndex: 3, items: [] }
        ]
    },

    // ── Közép-Dunántúl (Balaton) ──
    {
        id: 'balatoni-riviera',
        regionId: 'kozep-dunantul',
        title: 'Balatoni Riviéra',
        description: 'Vitorlázás a magyar tengeren, naplemente a Tihanyi Apátságnál és felejthetetlen mediterrán hangulat.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYVfkYik-AxXeAwvEOdbbw35cO04hdTTEjF7IB1mktETIU5JLx0hztrGxxaqYmWW9vBdDGntFcOs4ho89HhL4CPYl9aTGK0GibPxu3kF15nVCQ5WeW2GrfZULftIyLpQ5Yz0HRrHVj2dwwPY-GBiAICdgeO9w2nBaDaIzWWQOfiSmrflkdIXVHJ44_nXit-tXMlhnP-zcCMEjwzyCUa8qZS6IhyljQlvVhM-mHeK9Nn8lk8aYLU7j4H0cYtqoHDMobeEoN_j0kdlY',
        tags: [
            { icon: 'sailing', label: 'Vízi sport' },
            { icon: 'directions_bike', label: 'Bicikli' },
            { icon: 'festival', label: 'Életérzés' }
        ],
        estimatedCost: '55.000',
        days: [
            { dayIndex: 1, items: [] },
            { dayIndex: 2, items: [] },
            { dayIndex: 3, items: [] }
        ]
    }
];
