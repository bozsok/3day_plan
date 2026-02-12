# Változásnapló (Changelog)

Minden jelentős változtatás ebben a dokumentumban kerül rögzítésre.

## [0.4.0] - 2026-02-12

Negyedik iteráció: valódi SVG térkép integráció és a Program Idővonal teljes vizuális újratervezése.

### Hozzáadva
- **Interaktív Magyarország térkép (`HungaryMap.tsx`):**
    - SimpleMaps `hu.svg` dinamikus betöltése (`fetch` + DOMParser).
    - 20 megyét 7 NUTS2 turisztikai régióba csoportosítva (Budapest és környéke, Közép-Dunántúl, Nyugat-Dunántúl, Dél-Dunántúl, Észak-Magyarország, Észak-Alföld, Dél-Alföld).
    - Budapest jelölő: piros kör fehér szegéllyel + „Budapest" felirat.
    - Event delegation alapú kattintás/hover kezelés (`data-region` attribútummal).
- **ProgramTimeline újratervezése (dizájn referencia alapján):**
    - Kétoszlopos elrendezés: bal sidebar (Utazás Összegzése, becsült költség, Mentés/Megosztás gombok, Útiterv Adatok) + jobb tartalom.
    - Nap-fülek `border-bottom-4` aktív jelzéssel és dinamikus napnév (`date-fns`).
    - Timeline idővonal: zöld körök Material Icons-szal, időpont badge, kategória címke, opcionális kép.
- **Material Icons Outlined** betűtípus betöltése az `index.html`-ben.
- **Gazdagított mock adatok:** `icon`, `category`, `estimatedCost` mezők + 4 programelem naponként régiónként.

### Módosítva
- **`mockData.ts`:** Region interface `countyIds` tömbbel és `countyToRegion` lookup-pal bővítve.
- **`MapSelection.tsx`:** Az új `HungaryMap` komponenst használja; hover és kiválasztás info panel.

## [0.3.0] - 2026-02-12

Harmadik iteráció: Tailwind CSS migráció, saját naptár komponens, projekttisztítás és szerveroldali deploy javítás.

### Hozzáadva
- **Tailwind CSS v4:**
    - Teljes migráció CSS Modules-ról Tailwind CSS v4 utility class-okra.
    - `@tailwindcss/vite` plugin integráció a Vite build rendszerbe.
    - Egyedi téma (`@theme`) konfiguráció az `index.css`-ben (primary, background, neutral színek).
- **Saját naptár komponens (`CustomCalendar.tsx`):**
    - CSS Grid alapú (`grid-cols-7`), a forrás dizájn HTML-lel 1:1 egyező naptár.
    - Magyar hónap- és napnevek, hónapváltó navigáció.
    - 3 egymást követő nap kijelölése pozíció-alapú kerekítéssel (első/közép/utolsó).
    - Mai nap kiemelése zöld kerettel.
- **Google Font:** `Plus Jakarta Sans` betűtípus betöltése az `index.html`-ben (400–800 vastagság).
- **Deploy konfiguráció:** `base: './'` beállítás a `vite.config.ts`-ben a relatív útvonalakhoz.

### Módosítva
- **Összes komponens** (Hero, DateSelection, MapSelection, ProgramTimeline, MainLayout, App, Card, StepIndicator) Tailwind utility class-okra átírva.
- **DateSelection:** `react-day-picker` helyett saját `CustomCalendar` komponens.
- **Gombok:** DateSelection „Tovább" gomb már nem nyúlik teljes szélességűre kis képernyőn.
- **`index.css`:** 140 sorról 75 sorra csökkentve — csak az aktívan használt CSS maradt.

### Eltávolítva
- **`react-day-picker`** csomag és az összes CSS override (~55 sor).
- **CSS Modules:** Minden `.module.css` fájl törölve (korábbi iterációban).
- **Felesleges fájlok (8 db):**
    - `App.css` (Vite boilerplate)
    - `styles/base.css`, `styles/variables.css` (régi CSS rendszer)
    - `Footer.tsx`, `Footer.module.css` (nem használt komponens)
    - `Header.tsx`, `Header.module.css` (nem használt komponens)
    - `assets/react.svg` (Vite boilerplate)
- **Halott CSS:** `.card-container` animáció, `@keyframes fadeIn`, `.animate-fade-in`.

## [0.2.0] - 2026-02-12

Második iteráció: UX finomhangolás és animált felület.

### Hozzáadva
- **UX / UI:**
    - **Hero Képernyő:** Új, látványos köszöntő oldal a folyamat indításához.
    - **Kártya alapú elrendezés:** A lépések (Naptár, Térkép, Timeline) animált kártyákon jelennek meg.
    - **Slide Animációk:** Finom csúszó animációk a lépések közötti váltáskor (előre/hátra).
    - **Step Indicator:** Vizuális folyamatjelző sáv a fejlécben.
- **Logika:**
    - **Dátum Validáció:** A naptárban mostantól kötelező 3 *egymást követő* napot választani (pl. Péntek-Szombat-Vasárnap).

## [0.1.0] - 2026-02-12

Ez az első stabil prototípus verzió (MVP), amely tartalmazza az alkalmazás alapvető keretrendszerét és a felhasználói útvonal főbb lépéseit.

### Hozzáadva
- **Projekt Architektúra:**
    - Vite + React + TypeScript alapok.
    - Hagyományos CSS (CSS Modules) és CSS változók (Variables) alapú design rendszer.
    - `lucide-react` ikoncsomag integrációja.
    - `date-fns` a dátumkezeléshez.
- **Funkciók:**
    - **Dátumválasztó:** `react-day-picker` alapú komponens, amely 3 napos intervallum kiválasztását teszi lehetővé.
    - **Térképválasztó:** Interaktív SVG alapú Magyarország térkép, kattintható régiókkal (egyelőre "Északi-középhegység" és "Alföld").
    - **Program Idővonal:** A kiválasztott tájegységhez tartozó 3 napos programcsomag részletes megjelenítése.
- **Adatkezelés:**
    - Mock adatbázis (`mockData.ts`) létrehozása a prototípus működésének demonstrálására.
    - Állapotkezelés (State Management) a fő `App` komponensben.
