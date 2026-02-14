# Változásnapló (Changelog)

Minden jelentős változtatás ebben a dokumentumban kerül rögzítésre.

## [0.7.1] - 2026-02-14

### Hozzáadva
- **Dinamikus Layout Összehúzás**: Az idővonal helye automatikusan eltűnik a kezdőlapon és az összegzésnél, több helyet hagyva a tartalomnak.
- **Scrollbar Stabilitás**: Bevezetésre került a `scrollbar-gutter: stable`, amely megakadályozza a tartalom vízszintes ugrálását az áttűnések alatt.

### Módosítva
- **HashRouter migráció**: Átállás `HashRouter`-re a PHP alapú tárhelyekkel való teljes kompatibilitás érdekében.
- **Stabil Cross-fade**: Az oldalak közötti áttűnés most már tökéletesen simultán (popLayout + absolute exit), kiküszöbölve a kártyák egymás alá csúszását.
- **Layout finomhangolás**: A felső margó (padding-top) csökkentése (16px mobil / 32px desktop) a hatékonyabb helykihasználásért.

## [0.7.0] - 2026-02-14

### Hozzáadva
- **React Router integráció**: Valódi útvonalkezelés bevezetése minden tervezési lépéshez (Deep linking támogatás).
- **Smooth Transitions**: Simább átmenetek a lépések között a `framer-motion` (AnimatePresence) használatával.
- **Böngésző előzmények**: Működő "Vissza" gomb támogatás a böngészőben.

### Módosítva
- `App.tsx` refaktorálása: Állapot alapú léptetés helyett útvonal alapú navigáció.
- Lépéskomponensek frissítése: `onNext`/`onBack` callbackek helyett `useNavigate()` hook alkalmazása.
- `Card.tsx` frissítése: Animált konténer komponenssé alakítás.

## [0.6.2] - 2026-02-14

### Újdonságok és Változások
- **Navigációs gombok egységesítése:**
    - Az összes lépésnél (3-5. lépés is) a korábban kör alakú (`rounded-full`) navigációs nyíl gombok mostantól **lekerekített négyzet** (`rounded-2xl`) alakúak, igazodva az 1-2. lépés stílusához és a kártyák formavilágához.
    - A gombok mérete desktopnézetben (`md`) 48 px-ről **56 px-re** (`w-14 h-14`) nőtt, az ikonméret pedig 24 px-re (`text-2xl`), így minden navigációs elem mérete és formája tökéletesen megegyezik az egész folyamat során.
    - Eltávolítottam a gombokról az üvegstílust (`backdrop-blur`) és az árnyékot, helyette az 1-2. lépésben megszokott **átlátszó háttér + szürke szegély** (`border-gray-200`) designt kapták, és az ikonokat is Lucide-alapú chevronokra cseréltem a teljes vizuális azonosság érdekében.
- **UI-finomhangolás:**
    - A 4. lépésnél (ProgramTimeline) a "Lépés" címke és a régió neve közötti távolság desktopnézetben (`lg`) **50 px-re** nőtt a szellősebb elrendezés érdekében.
- **Globális padding-szinkronizálás (48 px):**
    - A nyitóoldal (Hero), az 1-2. lépés (Dátum, Térkép) és az **Összegzés** (Eredmények) oldal belső margója is egységesen **48 px** (`md:p-12`) lett, megszüntetve a korábbi 56/64 px-es eltéréseket.
    - A `StepCard` alapértelmezett értéke mostantól mindenhol a 48 px-es rácsot követi `md` nézet felett.
- **UI-finomhangolás:**
    - A nyitóoldali (Hero) főcím betűmérete desktopnézetben (`md`) 60 px-ről **48 px-re** (`text-5xl`) csökkent a kiegyensúlyozottabb megjelenés érdekében.

## [0.6.1] - 2026-02-14

### Újdonságok és Változások
- **UI-standardizálás (globális padding):**
    - Minden főbb lépés (Hero, Dátum, Térkép, Csomagok, Timeline, Összegzés) egységes **`48px` (p-12)** belső margót kapott 768px (`md`) feletti felbontáson.
    - Az abszolút pozicionált gombok és címkék (vissza- és továbbgomb, lépésjelzők) szintén követik a 48 px-es eltolást (`top-12`, `left-12`) `md` nézet felett a tökéletes igazodás érdekében, biztosítva a sortörésmentességet (`whitespace-nowrap`).
- **Kódrefaktorálás:**
    - Bevezetésre került a közös **StepCard-komponens** (`src/components/common/StepCard.tsx`), amely egységesíti az összes főbb lépés keretstílusát (árnyék, lekerekítés, szegély, reszponzív belső margó).
    - Minden fő komponens átállt a `StepCard` használatára, jelentősen csökkentve a kódismétlést.
- **UI-finomhangolás:**
    - A 4. lépésnél (ProgramTimeline) a bal oldali információs sáv desktopnézetben (`lg`) mostantól függőlegesen középre van igazítva a fehér kártyán belül.

## [0.6.0] - 2026-02-14

### Újdonságok és Változások
- **UI-egységesítés (mobilnézet):**
    - Minden főbb lépés egységes **15 px-es belső margót** kapott 440 px alatti felbontáson.
    - Az összes kártya és modális ablak lekerekítése egységesen **16 px-es (rounded-2xl)** lett mobilnézeten.
- **Navigáció:**
    - **Tovább gomb:** A 3. és 4. lépéshez is bekerült egy jobb felső "Tovább" nyíl a könnyebb haladás érdekében.
    - **Vissza gomb:** Az Összegző képernyőre is bekerült egy visszalépési lehetőség.
- **Stílus:**
    - **Csomagválasztó:** A "kalandod" szó zöld kiemelést kapott.
    - A szavazatszámláló badge-ek mérete és stílusa egységesítésre került.

## [0.5.6] - 2026-02-13

### Javítások
- **HTTP/2 protokollhiba elhárítása (KRITIKUS):**
    - Sikerült elhárítani a szerveroldali `net::ERR_HTTP2_PROTOCOL_ERROR` hibát, amely terhelés alatt jelentkezett.
    - **Ok:** „race condition” lépett fel a fájl zárolása során: a kliens túl gyakran kérte le az adatokat (5 mp), miközben valaki éppen írta az adatbázist. A szerver ilyenkor „beragadt”, vagy üres fájlt próbált olvasni.
    - **Megoldás 1 (backend):** A `summary.php` mostantól **non-blocking** (nem blokkoló) fájlzárolást használ visszavonulási (retry) mechanizmussal. Ha a fájl éppen írás alatt van, a szkript nem fagy le, hanem vár kicsit, vagy végső esetben üres adatot küld vissza összeomlás helyett.
    - **Megoldás 2 (frontend):** Az automatikus frissítés (polling) gyakoriságát **12 másodpercre** csökkentettük (5 mp helyett), drasztikusan csökkentve a szerver terhelését.
- **API Stabilitás:**
    - Minden PHP végpont (`dates.php`, `votes.php`, `users.php`, `admin.php`) átírásra került "self-contained" (önálló) struktúrára, megszüntetve a külső fájlfüggőségeket (`require`), amelyek instabilitást okozhattak egyes szervereken.
    - "Soft Failure" mód bevezetése: A szerver kritikus hiba esetén is `200 OK` státuszt küld (JSON error üzenettel), hogy elkerülje a szigorúbb protokoll-szintű blokkolást.

## [0.5.5] - 2026-02-13

### Újdonságok
- **Adminisztrációs Felület (Rendszergazda):**
    - Új "Admin Zone" (titkos elérés: 5x kattintás a címre az Összegzés oldalon).
    - **Adatbázis Törlés (Atomcsapás):** Egyetlen gombnyomással törölhető a teljes adatbázis és minden felhasználó munkamenete.
    - **Felhasználó Törlés:** Lehetőség van egyes felhasználók célzott törlésére is.
    - **Instant Reakció:** Minden megerősítő kérdés ("Biztos?") eltávolítva – a gombok azonnal végrehajtják az utasítást.
- **UI Finomhangolás:**
    - Csomagválasztó kártyák: A képek hover effektusa javítva (nem lóg ki a keretből).
    - Szövegezés: "Kattints kettőt..." -> "Kattints párat...", "Válassza ki" -> "Válaszd ki" (tegeződés egységesítése).

### Javítások
- **"Zombie User" Hiba:** Adatbázis reset után a kliens oldali `localStorage` is automatikusan törlődik, megakadályozva, hogy a törölt felhasználók "szellemként" visszatérjenek. Kikapcsoltuk a "Silent Re-login" funkciót, ami korábban ezt okozta.

## [0.5.4] - 2026-02-13

### Újdonságok és Változások
- **Backend Szinkronizáció (Dual Stack):**
    - A fejlesztés során használt **Node.js** (`server/src`) és az éles környezethez szánt **PHP** (`server/api`) backend kódok teljeskörűen szinkronizálva lettek.
    - Mindkét rendszer támogatja az új többszörös szavazási logikát és a javított összegzést, így a projekt tetszőleges környezetbe (Node vagy PHP/Apache) telepíthető.
- **Többszörös Szavazás:** A felhasználók mostantól **több különböző időpontra** is szavazhatnak ugyanazon régión belül. A rendszer csak a teljesen azonos (Dátum + Régió) duplikációkat tiltja.
- **Összegzés (Summary) Javítás:**
    - A "Mikor menjünk?" statisztika mostantól a **leadott szavazatok (blokkok)** számát összegzi, nem a felhasználók számát.
    - Javítottuk a duplikált kulcs hibákat a felhasználói listákban.
- **Frontend:**
    - Intelligens "Szavazok erre / Visszavonás" gomb.

## [0.5.3] - 2026-02-12

### Újdonságok
- **Több Időpont Támogatása:** A felhasználók mostantól több különálló időszakot is megjelölhetnek a naptárban. Az "Összegzés" oldal intelligensen csoportosítja ezeket (pl. "feb. 20-22" és "márc. 1-3").
- **UI Tisztítás:** A Program oldalról eltávolításra került a felesleges "Megosztás" gomb. A "Tovább az eredményekhez" gomb kék színűre változott a jobb láthatóság érdekében.

### Javítások
- **Backend:** A dátummentés mostantól hozzáadó (append) logikával működik, nem felülíróval.
- **Stabilitás:** Javított típuskezelés a szerver oldali adatbázis műveleteknél (szám vs szöveg ID).

## [0.5.2] - 2026-02-12

### Módosítva
- **Összegzés (Frontend/Backend):** A "Mikor menjünk?" szekció mostantól intelligensen csoportosítja a felhasználók 3 napos választásait intervallumokba (pl. "júl. 15. - júl. 17."), ahelyett hogy külön napokat listázna.
- **Navigáció:** A "Hova menjünk?" listában a régiók mostantól kattinthatóak. A kattintás közvetlenül a Program Idővonalra visz, betöltve a választott régió tervét.

## [0.5.1] - 2026-02-12

### Hozzáadva
- **Navigáció:** "Tovább tervezek" lebegő gomb a Summary oldalon, amely visszavisz a Térképválasztóhoz (2. lépés), lehetővé téve újabb régiók megtekintését és szavazását.

## [0.5.0] - 2026-02-12

Ötödik iteráció: Backend integráció és többfelhasználós funkciók (MVP).

### Hozzáadva
- **Backend (Node.js + Express + SQLite):**
    - `server/` mappa: önálló Express alkalmazás.
    - `sql.js` alapú SQLite adatbázis (fájl alapú perzisztencia: `data/app.db`).
    - API végpontok:
        - `POST /api/users`: Név alapú "login" (idempotens).
        - `POST /api/dates`: Dátumválasztás mentése.
        - `POST /api/votes`: Szavazat leadása/visszavonása régiókra.
        - `GET /api/summary`: Összesített adatok (Mátrix, Rangsor, Státusz).
- **Többfelhasználós Frontend Funkciók:**
    - **Login (Hero):** Név bekérése induláskor, `UserContext` + `localStorage` perzisztencia.
    - **Adatmentés:** A naptárban kiválasztott dátumok automatikusan mentésre kerülnek a backendre.
    - **Szavazás (Timeline):** "Szavazok erre!" gomb a ProgramTimeline oldalsávjában (zöld feedback szavazás után).
    - **Élő Összegzés (Summary):** Új 4. lépés, amely valós időben (5mp poll) mutatja:
        - Melyik napot hányan választották (névsorral).
        - Melyik régió vezet a szavazatokban.
        - Csapattagok státusza (ki végzett a tervezéssel).
    - **Navigáció:** "Tovább az eredményekhez" gomb szavazás után.
- **Deploy:** A backend szerver production módban kiszolgálja a statikus frontend fájlokat is (SPA fallback).

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
