# Hosszú Hétvége Tervező 🌲🗺️

Üdvözöllek a Hosszú Hétvége Tervezőben!

Ez az alkalmazás azoknak készült, akik szeretnének kiszakadni a hétköznapok mókuskerekéből, és egy tartalmas, előre megszervezett háromnapos kikapcsolódásra vágynak Magyarország legszebb tájain. A projekt mára egy kiforrott, modern és vizuálisan lenyűgöző platformmá fejlődött, amely a legújabb webes technológiákra építve teszi élménnyé a közös tervezést.

A célunk egyszerű: levenni a tervezés terhét a válladról. Nem kell órákat töltened azzal, hogy látnivalókat vadászol, éttermeket keresel vagy túraútvonalakat böngészel. Mi precízen összeállított csomagokba rendeztük az élményeket, amelyeket most már minden eszközön kristálytisztán és villámgyorsan érhetsz el.

## Hogyan működik?

A tervezés nálunk egy játékos, gördülékeny folyamat, ahol az oldalak közötti navigáció szinte észrevétlen:
1.  **Időzítés**: Válaszd ki a naptárban azt a három egymást követő napot (péntek–szombat–vasárnap), amikor utazni szeretnél. A felület azonnal menti és szinkronizálja a választásodat.
2.  **Tájegység**: Egy interaktív SVG-térképen böngészhetsz Magyarország megyéi és turisztikai régiói között — a kurzorral rámutatva kiemeled, kattintással kiválasztod. A térkép mostantól még részletesebb és pontosabb.
3.  **Programterv**: Részletes, napokra bontott idővonal a kiválasztott régió látnivalóival. Itt már nemcsak nézelődhetsz, hanem szavazhatsz is a kedvenc terveidre, miközben a költségek alakulását is nyomon követheted.

## Modern felhasználói élmény

Az alkalmazás legújabb verziója (**v2.4.0**) a vizuális élményre, a rugalmas tartalomkezelésre és a stabil adminisztrációra fókuszál:

- **Gördülékeny Galéria (v2.4.0):** Modernebb, navigálható képgaléria swipe támogatással és billentyűzet vezérléssel.
- **Gazdag szövegtámogatás:** Markdown-lite formázás (félkövér, listák, sortörések) minden leírásban és megjegyzésben.
- **Intelligens hozzáférés-kezelés:** Az Admin gomb előzetes ellenőrzést végez — ha nem vagy bejelentkezve, nem nyitunk feleslegesen új lapot, hanem helyben figyelmeztetünk a hiányzó adatokra.
- **Egyedi Favicon:** Az alkalmazás saját, modern arculatát tükröző 3-szegmensű ikonnal rendelkezik, amely minden böngészőfülön professzionális megjelenést nyújt.
- **Tesztelhetőségre felkészítve:** Minden UI elem egyedi azonosítót (ID) kapott, amelyek dokumentálva vannak az [element_id_map.md](file:///C:/Users/Bozsó%20Krisztián/.gemini/antigravity/brain/90a6e7d7-da1d-47ba-848d-4a1e225a3634/element_id_map.md) fájlban.
- **Gördülékeny navigáció:** A **React Router** és a **Framer Motion** integrációjának köszönhetően az oldalak között sima, professzionális áttűnésekkel mozoghatsz.
- **Intelligens adatkezelés:** A **TanStack Query** biztosítja a valós idejű szinkronizációt a résztvevők között, így az eredmények azonnal frissülnek mindenkinél.

## Technológiai háttér

### Frontend
- **React 19** + **TypeScript** — modern komponens architektúra
- **React Router 7** — stabil útvonalkezelés
- **TanStack Query** — robusztus szerver állapotkezelés és polling
- **Framer Motion** — prémium UI animációk és áttűnések
- **Tailwind CSS v4** — utility-first stílusozás
- **Interaktív SVG-térkép** — dinamikus megye- és régiókezelés

### Backend
- **PHP 8 / Node.js Express** — választható szerveroldali implementáció
- **SQLite / JSON** — megbízható adatperzisztencia
- **Többfelhasználós támogatás** — valós idejű közös tervezés

## Fejlesztés és futtatás

A projekt futtatásához indítsd el külön terminálban a backend és a frontend szervert is.
- **Frontend:** `npm run dev` a gyökérmappában.
- **Backend (Node):** `npm run dev` a `server` mappában.

## Adminisztráció és csomagkészítő 🛠️

A rendszer egy rejtett adminisztrációs felületet is tartalmaz. Az **összegzés** oldalon a "Közös tervezés" címre való **5 gyors kattintással** érhető el a vezérlőpult.

### Kalandor varázsló (v2.1+) 🧙‍♂️
Egy narratív alapú csomagkészítő felület, ahol lépésről lépésre állíthatók össze az új tervek.
- **Névhez kötöttség (Új):** A szerkesztő csak névvel érhető el, a mentett csomagok pedig őrzik az alkotójuk nevét.
- **Interaktív szerkesztő:** Drag & drop programrendezés és élő előnézet.
- **StatusModal:** Minden fontos visszajelzés (mentés, törlés, hiba) egységes, elegáns modális ablakokon keresztül érkezik.

Jó tervezést és kikapcsolódást kívánunk!
