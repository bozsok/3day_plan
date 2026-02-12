export interface ProgramItem {
    id: string;
    time: string;
    title: string;
    description: string;
    image?: string;
}

export interface DailyProgram {
    dayIndex: number; // 1, 2, 3
    items: ProgramItem[];
}

export interface RegionProgram {
    regionId: string;
    title: string; // e.g. "Gasztro túra a hegyekben"
    days: DailyProgram[];
}

export const mockPrograms: RegionProgram[] = [
    {
        regionId: 'eszak-magyarorszag',
        title: 'Hegyvidéki Kalandok',
        days: [
            {
                dayIndex: 1,
                items: [
                    { id: '1-1', time: '10:00', title: 'Érkezés Egerbe', description: 'Szállás elfoglalása és séta a Dobó téren.' },
                    { id: '1-2', time: '13:00', title: 'Ebéd a Szépasszonyvölgyben', description: 'Borkóstoló és hagyományos ételek.' },
                    { id: '1-3', time: '16:00', title: 'Egri Vár látogatás', description: 'Történelmi séta a várban.' }
                ]
            },
            {
                dayIndex: 2,
                items: [
                    { id: '2-1', time: '09:00', title: 'Túra a Bükkben', description: 'Szalajka-völgy és Fátyol-vízesés.' },
                    { id: '2-2', time: '14:00', title: 'Lillafüredi kisvonat', description: 'Utazás az erdei vasúttal.' }
                ]
            },
            {
                dayIndex: 3,
                items: [
                    { id: '3-1', time: '10:00', title: 'Miskolctapolca Barlangfürdő', description: 'Relaxálás a termálvízben.' },
                    { id: '3-2', time: '14:00', title: 'Hazautazás', description: 'Búcsú a hegyektől.' }
                ]
            }
        ]
    },
    {
        regionId: 'alfold',
        title: 'Puszta Romantika',
        days: [
            {
                dayIndex: 1,
                items: [
                    { id: 'a1-1', time: '11:00', title: 'Hortobágyi Kilenclyukú híd', description: 'Séta a világörökség részét képező hídnál.' },
                    { id: 'a1-2', time: '13:00', title: 'Pásztormúzeum', description: 'Ismerkedés a pusztai élettel.' }
                ]
            },
            {
                dayIndex: 2,
                items: [
                    { id: 'a2-1', time: '10:00', title: 'Lovasbemutató', description: 'Csikósok bemutatója a Mátai Ménesben.' },
                    { id: 'a2-2', time: '15:00', title: 'Tisza-tavi Ökocentrum', description: 'Európa legnagyobb édesvízi akváriuma.' }
                ]
            },
            {
                dayIndex: 3,
                items: [
                    { id: 'a3-1', time: '10:00', title: 'Debreceni Nagytemplom', description: 'Városnézés Debrecenben.' }
                ]
            }
        ]
    }
];

export interface Region {
    id: string;
    name: string;
    path: string;
    centerX: number;
    centerY: number;
}

export const regions: Region[] = [
    {
        id: 'eszak-magyarorszag',
        name: 'Északi-középhegység',
        path: 'M305,40 L450,40 L420,130 L305,100 Z', // Adapted from design path 4
        centerX: 380,
        centerY: 90
    },
    {
        id: 'alfold', // Updated Mock path to existing mock Programs
        name: 'Alföld',
        path: 'M305,105 L460,135 L440,280 L230,255 L325,185 Z', // Adapted from design path 5
        centerX: 350,
        centerY: 200
    },
    {
        id: 'balaton',
        name: 'Balaton-felvidék',
        path: 'M120,150 L200,150 L210,210 L130,210 Z', // Design path 3 (Primary)
        centerX: 165,
        centerY: 180
    },
    {
        id: 'dunantul',
        name: 'Dunántúl',
        path: 'M30,100 L180,100 L220,250 L50,250 Z', // Design path 1
        centerX: 125,
        centerY: 175
    },
    {
        id: 'budapest',
        name: 'Budapest és környéke',
        path: 'M185,80 L300,80 L320,180 L225,250 L185,100 Z', // Design path 2
        centerX: 250,
        centerY: 150
    }
];
