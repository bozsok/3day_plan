# Hosszú Hétvége Tervező 🌲🗺️

Üdvözöllek a Hosszú Hétvége Tervezőben!

Ez az alkalmazás azoknak készült, akik szeretnének kiszakadni a hétköznapok mókuskerekéből, és egy tartalmas, előre megszervezett háromnapos kikapcsolódásra vágynak Magyarország legszebb tájain.

A célunk egyszerű: levenni a tervezés terhét a válladról. Nem kell órákat töltened azzal, hogy látnivalókat vadászol, éttermeket keresel vagy túraútvonalakat böngészel. Mi csomagba rendeztük az élményeket.

## Hogyan működik?

A tervezés nálunk egy játékos, háromlépéses folyamat:

1.  **Időzítés**: Válaszd ki a naptárban azt a három egymást követő napot (péntek–szombat–vasárnap), amikor utazni szeretnél.
2.  **Tájegység**: Egy interaktív SVG-térképen (SimpleMaps `hu.svg`) böngészhetsz Magyarország hét turisztikai régiója között — a kurzorral rámutatva kiemeled, kattintással kiválasztod.
3.  **Programterv**: Részletes, napokra bontott idővonal a kiválasztott régió látnivalóival, étkezéseivel és aktív programjaival — összegzéssel, becsült költséggel.

## Technológiai háttér

### Frontend
- **React 19** + **TypeScript** — komponensalapú architektúra
- **Tailwind CSS v4** — utility-first stílusozás, egyedi `@theme` konfiguráció
- **Vite** — gyors fejlesztői szerver és optimalizált production build
- **Saját naptárkomponens** — CSS Grid alapú, magyar lokalizációval
- **Interaktív SVG-térkép** — dinamikus `hu.svg` betöltés, hét NUTS2 régió, Budapest-jelölő

### Backend (v0.5+)
- **Node.js + Express** — REST API-kiszolgáló
- **SQLite (@sql.js)** — hordozható, fájlalapú adatbázis (`data/app.db`)
- **Többfelhasználós támogatás** — egyedi felhasználó-azonosítás és szavazás
- **Valós idejű szinkronizálás** — dátumok és szavazatok azonnali mentése

## Fejlesztés

A projekt futtatásához indítsd el külön terminálban a backend és a frontend szervert is:

### 1. Backend indítása
```bash
cd server
npm install     # Függőségek telepítése (csak egyszer)
npm run dev     # Backend szerver indítása (port: 3001)
```

### 2. Frontend indítása (új terminálban)
```bash
# Gyökérkönyvtárban
npm install     # Függőségek telepítése (csak egyszer)
npm run dev     # Frontend szerver indítása (port: 5173 - proxy: 3001)
```

## Funkciók
- **Közös tervezés:** Oszd meg az oldalt barátaiddal, és tervezzetek együtt!
- **Dátumegyeztetés:** Mindenki megjelölheti a neki megfelelő hétvégéket, a rendszer pedig összegzi a legnépszerűbb időpontot.
- **Régió Szavazás:** Szavazzatok a kedvenc úti célokra! Egy felhasználó **több régióra** és egy régión belül **több időpontra** is leadhat szavazatot.
- **Több Időpont:** Rugalmas tervezés: jelöld meg az összes hétvégét, amikor ráérsz, a rendszer pedig összesíti a legjobb átfedéseket.

## Adminisztráció 🛠️

A rendszer tartalmaz egy rejtett adminisztrációs felületet karbantartási célokra:

1.  **Elérés:** Navigálj az **Összegzés** (4. lépés) oldalra.
2.  **Titkos Kapcsoló:** Kattints **5-ször gyorsan** a fejlécben található "Közös Tervezés" címre.
3.  **Funkciók:**
    - **Adatbázis-visszaállítás (reset – „atomcsapás”):** Egyetlen gombnyomással töröl minden adatot (felhasználók, szavazatok, dátumok), és kiléptet minden klienst. Hasznos újratervezés indításakor.
    - **Felhasználótörlés:** Egyesével törölhetők a beragadt vagy duplikált felhasználók.
    - **Figyelem:** A műveletek azonnal végrehajtódnak, megerősítő kérdés (alert) nélkül!

Jó tervezést és még jobb kikapcsolódást kívánunk!
