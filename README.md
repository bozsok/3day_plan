# Hosszú Hétvége Tervező 🌲🗺️

Üdvözöllek a Hosszú Hétvége Tervezőben!

Ez az alkalmazás azoknak készült, akik szeretnének kiszakadni a hétköznapok mókuskerekéből, és egy tartalmas, előre megszervezett háromnapos kikapcsolódásra vágynak Magyarország legszebb tájain.

A célunk egyszerű: levenni a tervezés terhét a válladról. Nem kell órákat töltened azzal, hogy látnivalókat vadászol, éttermeket keresel vagy túraútvonalakat böngészel. Mi csomagba rendeztük az élményeket.

## Hogyan működik?

A tervezés nálunk egy játékos, három lépéses folyamat:

1.  **Időzítés**: Válaszd ki a naptárban azt a három egymást követő napot (péntek-szombat-vasárnap), amikor utazni szeretnél.
2.  **Tájegység**: Egy interaktív SVG térképen (SimpleMaps `hu.svg`) böngészhetsz Magyarország 7 turisztikai régiója között — hover-rel kiemeled, kattintással kiválasztod.
3.  **Programterv**: Részletes, napokra bontott idővonal a kiválasztott régió látnivalóival, étkezéseivel és aktív programjaival — összegzéssel, becsült költséggel.

## Technológiai háttér

- **React 19** + **TypeScript** — komponens-alapú architektúra
- **Tailwind CSS v4** — utility-first stílusozás, egyedi `@theme` konfiguráció
- **Vite** — gyors fejlesztői szerver és optimalizált production build
- **Saját naptár komponens** — CSS Grid alapú, magyar lokalizációval
- **Interaktív SVG térkép** — dinamikus `hu.svg` betöltés, 7 NUTS2 régió, Budapest jelölő
- **Material Icons Outlined** — program timeline ikonok
- **Lucide React** — általános ikoncímtár
- **date-fns** — dátumkezelés magyar locale-lal

## Fejlesztés

```bash
npm install     # Függőségek telepítése
npm run dev     # Fejlesztői szerver indítása
npm run build   # Production build
npm run preview # Build előnézet
```

Jó tervezést és még jobb kikapcsolódást kívánunk!
