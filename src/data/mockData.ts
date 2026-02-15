
export interface County {
    id: string; // SVG ID (pl. HU-BU)
    name: string;
    description: string;
    pathId: string; // Az SVG path 'id' attribútuma vagy class (pl. HUBU)
    regionId: string; // Tájegység / Régió ID (pl. eszak-alfold)
}

/**
 * Magyarország megyéi (country.svg alapján)
 */
export const counties: County[] = [
    { id: 'budapest', name: 'Budapest', description: 'A főváros', pathId: 'HUBU', regionId: 'kozep-magyarorszag' },
    { id: 'baranya', name: 'Baranya', description: 'Pécs, Villány, Mecsek', pathId: 'HUBA', regionId: 'del-dunantul' },
    { id: 'bacs-kiskun', name: 'Bács-Kiskun', description: 'Kecskemét, Kiskunság', pathId: 'HUBK', regionId: 'del-alfold' },
    { id: 'bekes', name: 'Békés', description: 'Gyula, Békéscsaba', pathId: 'HUBE', regionId: 'del-alfold' },
    { id: 'borsod-abauj-zemplen', name: 'Borsod-Abaúj-Zemplén', description: 'Miskolc, Bükk, Zemplén', pathId: 'HUBZ', regionId: 'eszak-magyarorszag' },
    { id: 'csongrad-csanad', name: 'Csongrád-Csanád', description: 'Szeged, Tisza', pathId: 'HUCS', regionId: 'del-alfold' },
    { id: 'fejer', name: 'Fejér', description: 'Székesfehérvár, Velencei-tó', pathId: 'HUFE', regionId: 'kozep-dunantul' },
    { id: 'gyor-moson-sopron', name: 'Győr-Moson-Sopron', description: 'Győr, Sopron, Pannonhalma', pathId: 'HUGS', regionId: 'nyugat-dunantul' },
    { id: 'hajdu-bihar', name: 'Hajdú-Bihar', description: 'Debrecen, Hortobágy', pathId: 'HUHB', regionId: 'eszak-alfold' },
    { id: 'heves', name: 'Heves', description: 'Eger, Mátra, Tisza-tó', pathId: 'HUHE', regionId: 'eszak-magyarorszag' },
    { id: 'jasz-nagykun-szolnok', name: 'Jász-Nagykun-Szolnok', description: 'Szolnok, Tisza-tó', pathId: 'HUJN', regionId: 'eszak-alfold' },
    { id: 'komarom-esztergom', name: 'Komárom-Esztergom', description: 'Esztergom, Tata, Dunakanyar', pathId: 'HUKE', regionId: 'kozep-dunantul' },
    { id: 'nograd', name: 'Nógrád', description: 'Salgótarján, Hollókő', pathId: 'HUNO', regionId: 'eszak-magyarorszag' },
    { id: 'pest', name: 'Pest', description: 'Szentendre, Visegrád, Gödöllő', pathId: 'HUPE', regionId: 'kozep-magyarorszag' },
    { id: 'somogy', name: 'Somogy', description: 'Kaposvár, Balaton déli part', pathId: 'HUSO', regionId: 'del-dunantul' },
    { id: 'szabolcs-szatmar-bereg', name: 'Szabolcs-Szatmár-Bereg', description: 'Nyíregyháza, Felső-Tisza', pathId: 'HUSZ', regionId: 'eszak-alfold' },
    { id: 'tolna', name: 'Tolna', description: 'Szekszárd, Gemenc', pathId: 'HUTO', regionId: 'del-dunantul' },
    { id: 'vas', name: 'Vas', description: 'Szombathely, Őrség', pathId: 'HUVA', regionId: 'nyugat-dunantul' },
    { id: 'veszprem', name: 'Veszprém', description: 'Veszprém, Balaton északi part', pathId: 'HUVE', regionId: 'kozep-dunantul' },
    { id: 'zala', name: 'Zala', description: 'Zalaegerszeg, Hévíz, Keszthely', pathId: 'HUZA', regionId: 'nyugat-dunantul' }
];

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
    countyId: string; // Megye ID-hez kötött csomagok
    title: string;
    description: string; // Kártyán megjelenő rövid leírás
    imageUrl: string; // Kártya háttérkép
    tags: PackageTag[]; // Kártya címkék (pl. Túra, Bor, Wellness)
    estimatedCost: string;
    days: DailyProgram[];
}

export const packages: Package[] = [
    // ── Észak-Magyarország (Heves / Borsod) ──
    {
        id: 'matrai-magassagok',
        countyId: 'heves', // Mátra -> Heves megye
        title: 'Mátrai Magasságok',
        description: 'Hódítsa meg Magyarország legmagasabb csúcsait, töltődjön fel a tiszta hegyi levegőn és élvezze az erdei csendet.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPud2dEWrfLNXmY-oiPgDaJT_DnDZrSEGET7_Ykv2xpEGleogvVeG9OfVu0BpmIz9u_cn3NOP00KjMo3JKIJskjKadeHC73BpAxdUFVGHKh7DBYjV91xj4ax_8QYd9d03iY68nKnNDdOqvlJJJcQdyDofJjcnjOw3l1yix4RBquqwagWhFHQSIjmyuNgUPZAmQ8RAsBV6ggUzIXJSQBQacg8Yjgr_jr8G6gY8JWiFZViNQApnOyZ0_y6lCXpvn7odXFXdtR0Hpt6U',
        tags: [
            { icon: 'flag', label: 'Hegyvidék' },
            { icon: 'spa', label: 'SPA' },
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
            {
                dayIndex: 2,
                items: [
                    { id: 'm2-1', time: '09:00', icon: 'wb_sunny', category: 'TERMÉSZET', title: 'Reggeli a csúcson', description: 'Napfelkelte nézés a Kékesről.' },
                    { id: 'm2-2', time: '11:00', icon: 'directions_walk', category: 'AKTÍV', title: 'Túra Sástó felé', description: 'Látogatás az ország legmagasabb tavához.' },
                    { id: 'm2-3', time: '16:00', icon: 'spa', category: 'RELAX', title: 'Wellness délután', description: 'Pihenés szaunával és masszázzsal.' }
                ]
            },
            {
                dayIndex: 3,
                items: [
                    { id: 'm3-1', time: '10:00', icon: 'shopping_bag', category: 'HELYI', title: 'Kézműves piac', description: 'Vásárlás a helyi kistermelőktől.' },
                    { id: 'm3-2', time: '13:00', icon: 'restaurant', category: 'GASZTRO', title: 'Búcsúebéd Gyöngyösön', description: 'Hagyományos pásztorételek a város szívében.' }
                ]
            }
        ]
    },
    {
        id: 'tokaji-borvidek',
        countyId: 'borsod-abauj-zemplen', // Tokaj -> Borsod
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
            {
                dayIndex: 1,
                items: [
                    { id: 't1-1', time: '14:00', icon: 'wine_bar', category: 'KULTÚRA', title: 'Pincelátogatás', description: 'Ismerkedés a Tokaji Aszú készítésével.' },
                    { id: 't1-2', time: '19:00', icon: 'dinner_dining', category: 'GASZTRO', title: 'Borvacsora', description: 'Helyi borokhoz komponált 5 fogásos menü.' }
                ]
            },
            {
                dayIndex: 2,
                items: [
                    { id: 't2-1', time: '10:00', icon: 'terrain', category: 'AKTÍV', title: 'Dűlőtúra terepjáróval', description: 'Látogatás a legszebb szőlőültetvényekre.' },
                    { id: 't2-2', time: '15:00', icon: 'castle', category: 'KULTÚRA', title: 'Rákóczi-vár', description: 'Történelmi séta Sárospatakon.' }
                ]
            },
            {
                dayIndex: 3,
                items: [
                    { id: 't3-1', time: '11:00', icon: 'sailing', category: 'RELAX', title: 'Bodrog-parti séta', description: 'Hajózás vagy séta a folyóparton.' }
                ]
            }
        ]
    },

    // ── Észak-Alföld (Hajdú-Bihar) ──
    {
        id: 'puszta-romantika',
        countyId: 'hajdu-bihar', // Hortobágy -> Hajdú-Bihar
        title: 'Puszta Romantika',
        description: 'Fedezze fel a Hortobágy varázsát, a kilenclyukú hidat és a végtelen puszta nyugalmát.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYVfkYik-AxXeAwvEOdbbw35cO04hdTTEjF7IB1mktETIU5JLx0hztrGxxaqYmWW9vBdDGntFcOs4ho89HhL4CPYl9aTGK0GibPxu3kF15nVCQ5WeW2GrfZULftIyLpQ5Yz0HRrHVj2dwwPY-GBiAICdgeO9w2nBaDaIzWWQOfiSmrflkdIXVHJ44_nXit-tXMlhnP-zcCMEjwzyCUa8qZS6IhyljQlvVhM-mHeK9Nn8lk8aYLU7j4H0cYtqoHDMobeEoN_j0kdlY',
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
            {
                dayIndex: 2,
                items: [
                    { id: 'a2-1', time: '09:00', icon: 'agriculture', category: 'KULTÚRA', title: 'Puszta-szafari', description: 'Vadszamarak és őstulkok megfigyelése.' },
                    { id: 'a2-2', time: '14:00', icon: 'potted_plant', category: 'TERMÉSZET', title: 'Madárpark látogatás', description: 'Ismerkedés a megmentett ragadozó madarakkal.' }
                ]
            },
            {
                dayIndex: 3,
                items: [
                    { id: 'a3-1', time: '11:00', icon: 'menu_book', category: 'KULTÚRA', title: 'Pásztormúzeum', description: 'Hagyományok és életmód a pusztán.' }
                ]
            }
        ]
    },

    // ── Budapest és környéke (Pest megye) ──
    {
        id: 'dunakanyar-kaland',
        countyId: 'pest', // Dunakanyar -> Pest megye (nagy része)
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
            {
                dayIndex: 1,
                items: [
                    { id: 'p1-1', time: '10:00', icon: 'directions_boat', category: 'UTAZÁS', title: 'Hajókázás Szentendrére', description: 'Romantikus hajóút a Dunán.' },
                    { id: 'p1-2', time: '13:00', icon: 'palette', category: 'KULTÚRA', title: 'Művészetek városa', description: 'Galériák és a Kovács Margit Múzeum megtekintése.' }
                ]
            },
            {
                dayIndex: 2,
                items: [
                    { id: 'p2-1', time: '09:00', icon: 'fort', category: 'LÁTNIVALÓ', title: 'Visegrádi Fellegvár', description: 'Panoráma a Dunakanyarra a történelmi falakról.' },
                    { id: 'p2-2', time: '15:00', icon: 'kayaking', category: 'AKTÍV', title: 'Kenutúra a Dunán', description: 'Evezés a Dunakanyar legszebb részein.' }
                ]
            },
            {
                dayIndex: 3,
                items: [
                    { id: 'p3-1', time: '11:00', icon: 'park', category: 'RELAX', title: 'Vácrátóti Arborétum', description: 'Botanikai séta hazánk leggazdagabb kertjében.' }
                ]
            }
        ]
    },

    // ── Közép-Dunántúl (Veszprém) ──
    {
        id: 'balatoni-riviera',
        countyId: 'veszprem', // Balaton-felvidék -> Veszprém
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
            {
                dayIndex: 1,
                items: [
                    { id: 'v1-1', time: '14:00', icon: 'church', category: 'KULTÚRA', title: 'Tihanyi Apátság', description: 'Látogatás az 1055-ben alapított bencés monostorban.' },
                    { id: 'v1-2', time: '18:00', icon: 'sunny', category: 'RELAX', title: 'Naplemente a Belső-tónál', description: 'Séta a levendulamezők mentén.' }
                ]
            },
            {
                dayIndex: 2,
                items: [
                    { id: 'v2-1', time: '10:00', icon: 'sailing', category: 'AKTÍV', title: 'Vitorlázás Balatonfüredről', description: 'Délelőtti skipperlés a nyílt vízen.' },
                    { id: 'v2-2', time: '16:00', icon: 'wine_bar', category: 'GASZTRO', title: 'Borkóstoló a Badacsonyban', description: 'Kéknyelű és olaszrizling válogatás.' }
                ]
            },
            {
                dayIndex: 3,
                items: [
                    { id: 'v3-1', time: '11:00', icon: 'pool', category: 'SPA', title: 'Hévízi-tó', description: 'Reggeli fürdőzés a világ legnagyobb termál tavában.' }
                ]
            }
        ]
    }
];
