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

/* ── Mock programadatok ── */
export interface ProgramItem {
    id: string;
    time: string;
    title: string;
    description: string;
    /** Material Icons Outlined icon neve (pl. 'restaurant', 'terrain') */
    icon: string;
    /** Kategória címke (pl. 'GASZTRO', 'AKTÍV', 'KULTÚRA') */
    category: string;
    /** Opcionális kép URL */
    imageUrl?: string;
}

export interface DailyProgram {
    dayIndex: number;
    items: ProgramItem[];
}

export interface RegionProgram {
    regionId: string;
    title: string;
    /** Becsült összköltség (szövegként, pl. "45.000") */
    estimatedCost: string;
    days: DailyProgram[];
}

export const mockPrograms: RegionProgram[] = [
    {
        regionId: 'eszak-magyarorszag',
        title: 'Hegyvidéki Kalandok',
        estimatedCost: '52.000',
        days: [
            {
                dayIndex: 1,
                items: [
                    {
                        id: '1-1', time: '10:00', icon: 'luggage', category: 'ÉRKEZÉS',
                        title: 'Érkezés Egerbe',
                        description: 'Szállás elfoglalása és séta a hangulatos Dobó István téren, ahol a vár és a Minaret vár ránk.',
                    },
                    {
                        id: '1-2', time: '13:00', icon: 'wine_bar', category: 'GASZTRO',
                        title: 'Ebéd a Szépasszonyvölgyben',
                        description: 'Borkóstoló az egri bikavérrel és hagyományos magyar ételek egy autentikus pincében.',
                    },
                    {
                        id: '1-3', time: '16:00', icon: 'castle', category: 'KULTÚRA',
                        title: 'Egri Vár látogatás',
                        description: 'Történelmi séta a várban, interaktív kiállítások és páratlan panoráma a város felett.',
                    },
                    {
                        id: '1-4', time: '19:30', icon: 'restaurant', category: 'GASZTRO',
                        title: 'Vacsora az Óvárosban',
                        description: 'Hangulatos étterem a belváros szívében, helyi specialitásokkal és élőzenével.',
                    },
                ],
            },
            {
                dayIndex: 2,
                items: [
                    {
                        id: '2-1', time: '08:30', icon: 'restaurant', category: 'GASZTRO',
                        title: 'Reggeli a szálláson',
                        description: 'Bőséges magyar reggeli házi lekvárokkal és friss péksüteményekkel.',
                    },
                    {
                        id: '2-2', time: '10:00', icon: 'terrain', category: 'AKTÍV',
                        title: 'Túra a Szalajka-völgyben',
                        description: 'Gyönyörű erdei séta a Fátyol-vízesésig. Családbarát, közepes nehézségű útvonal.',
                    },
                    {
                        id: '2-3', time: '14:00', icon: 'train', category: 'ÉLMÉNY',
                        title: 'Lillafüredi kisvonat',
                        description: 'Utazás a festői erdei vasúttal a Garadna-völgyön keresztül Lillafüredig.',
                    },
                    {
                        id: '2-4', time: '17:00', icon: 'spa', category: 'WELLNESS',
                        title: 'Miskolctapolca Barlangfürdő',
                        description: 'Relaxálás Európa egyedülálló barlangi termálfürdőjében, természetes sziklák között.',
                    },
                ],
            },
            {
                dayIndex: 3,
                items: [
                    {
                        id: '3-1', time: '09:00', icon: 'local_cafe', category: 'GASZTRO',
                        title: 'Kávé és palacsinta',
                        description: 'Nyugodt reggeli indítás egy hangulatos kávézóban, házi palacsintával.',
                    },
                    {
                        id: '3-2', time: '11:00', icon: 'church', category: 'KULTÚRA',
                        title: 'Eger Minaret',
                        description: 'Európa legészakibb minaretje — 97 lépcsőfokon feljutva páratlan kilátás vár.',
                    },
                    {
                        id: '3-3', time: '13:00', icon: 'local_dining', category: 'GASZTRO',
                        title: 'Búcsú ebéd',
                        description: 'Utolsó egri étkezés a piac melletti étteremben, helyi alapanyagokból készült fogásokkal.',
                    },
                    {
                        id: '3-4', time: '15:00', icon: 'home', category: 'HAZAUTAZÁS',
                        title: 'Hazautazás',
                        description: 'Búcsú a hegyektől, emlékezetes élményekkel a poggyászban.',
                    },
                ],
            },
        ],
    },
    {
        regionId: 'eszak-alfold',
        title: 'Puszta Romantika',
        estimatedCost: '38.000',
        days: [
            {
                dayIndex: 1,
                items: [
                    {
                        id: 'a1-1', time: '10:00', icon: 'directions_car', category: 'ÉRKEZÉS',
                        title: 'Érkezés a Hortobágyra',
                        description: 'Szállás elfoglalása a Hortobágyi Csárda közelében.',
                    },
                    {
                        id: 'a1-2', time: '12:00', icon: 'photo_camera', category: 'LÁTNIVALÓ',
                        title: 'Kilenclyukú híd',
                        description: 'Séta a világörökség részét képező hídnál, a puszta ikonikus jelképénél.',
                    },
                    {
                        id: 'a1-3', time: '14:00', icon: 'museum', category: 'KULTÚRA',
                        title: 'Pásztormúzeum',
                        description: 'Ismerkedés a hagyományos pusztai élettel, pásztoreszközök és néprajzi gyűjtemény.',
                    },
                    {
                        id: 'a1-4', time: '18:00', icon: 'restaurant', category: 'GASZTRO',
                        title: 'Vacsora a Csárdában',
                        description: 'Hortobágyi palacsinta, bográcsgulyás és birkapörkölt, élőzenés vacsora.',
                    },
                ],
            },
            {
                dayIndex: 2,
                items: [
                    {
                        id: 'a2-1', time: '09:00', icon: 'restaurant', category: 'GASZTRO',
                        title: 'Reggeli',
                        description: 'Tanyasi reggeli frissen fejt tejjel és házi kenyérrel.',
                    },
                    {
                        id: 'a2-2', time: '10:30', icon: 'pets', category: 'ÉLMÉNY',
                        title: 'Lovasbemutató',
                        description: 'Csikósok látványos bemutatója a Mátai Ménesben — az ötös fogat bravúrja.',
                    },
                    {
                        id: 'a2-3', time: '14:00', icon: 'water', category: 'TERMÉSZET',
                        title: 'Tisza-tavi Ökocentrum',
                        description: 'Európa legnagyobb édesvízi akváriuma és a Tisza-tó élővilága.',
                    },
                    {
                        id: 'a2-4', time: '17:00', icon: 'kayaking', category: 'AKTÍV',
                        title: 'Csónakázás a Tisza-tavon',
                        description: 'Nyugodt evezés a holtágak és vízililiomok között naplementében.',
                    },
                ],
            },
            {
                dayIndex: 3,
                items: [
                    {
                        id: 'a3-1', time: '09:00', icon: 'local_cafe', category: 'GASZTRO',
                        title: 'Reggeli kávé',
                        description: 'Kávé és kürtőskalács a debreceni belvárosban.',
                    },
                    {
                        id: 'a3-2', time: '10:30', icon: 'church', category: 'KULTÚRA',
                        title: 'Debreceni Nagytemplom',
                        description: 'Városnézés a Református Nagytemplommal és a Kossuth térrel.',
                    },
                    {
                        id: 'a3-3', time: '13:00', icon: 'local_dining', category: 'GASZTRO',
                        title: 'Ebéd Debrecenben',
                        description: 'Debreceni specialitások: sült kolbász, debreceni és töltött káposzta.',
                    },
                    {
                        id: 'a3-4', time: '15:00', icon: 'home', category: 'HAZAUTAZÁS',
                        title: 'Hazautazás',
                        description: 'Búcsú az Alföldtől — csodálatos puszta-élmények emlékével.',
                    },
                ],
            },
        ],
    },
];
