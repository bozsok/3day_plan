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

Az alkalmazás legújabb verziója (v1.1+) a vizuális tökéletességre, az egységes ikonrendszerre (Lucide) és a technikai stabilitásra fókuszál:

- **Tesztelhetőségre felkészítve:** Minden UI elem egyedi azonosítót (ID) kapott, amelyek dokumentálva vannak az `element_id_map.md` fájlban. Ez lehetővé teszi a könnyű automatizált tesztelést és az elemek pontos beazonosítását.

- **Gördülékeny navigáció:** A **React Router** és a **Framer Motion** integrációjának köszönhetően az oldalak között sima, professzionális áttűnésekkel mozoghatsz. A böngésző "Vissza" gombja is pontosan úgy működik, ahogy elvárod.
- **Intelligens adatkezelés:** A **TanStack Query** biztosítja, hogy minden szavazat és dátumválasztás azonnal és hibabiztosan célba érjen. A rendszer a háttérben folyamatosan szinkronizál, így mindig a legfrissebb eredményeket látod te és a barátaid is.
- **Élő folyamat-visszajelzés (v0.11.0):** Valós idejű kommunikáció a résztvevők között már a naptárnál is. Ha valaki épp kijelöl egy időszakot, a többiek azonnal látják az aktív státuszt.
- **Intelligens állapotkezelés:** Ha visszalépsz a kezdőlapra, a rendszer tudja, hogy újra szeretnéd kezdeni a tervezést, és automatikusan törli a szerverről a korábbi próbálkozásaidat, így mindig tiszta lappal indulsz.
- **Ponthű dizájn:** A felületvisszaállítása során minden lekerekítés, margó és gombméret a helyére került. Legyen szó asztali monitorról vagy egy apró mobilról, a design konzisztens és prémium érzetet nyújt.
- **Atomic design alapok:** A motorháztető alatt az alkalmazást jól elkülönített, moduláris egységekre bontottuk, ami villámgyors működést és könnyű bővíthetőséget garantál.

## Technológiai háttér

### Frontend
- **React 19** + **TypeScript** — a legmodernebb komponensalapú architektúra
- **React Router 7** — stabil, URL alapú útvonalkezelés
- **TanStack Query** — robusztus szerver állapotkezelés és polling
- **Framer Motion** — magas minőségű UI animációk és áttűnések
- **Tailwind CSS v4** — utility-first stílusozás, egyedi `@theme` konfiguráció
- **Interaktív SVG-térkép** — dinamikus `hu.svg` betöltés megyékkel és turisztikai régiókkal

### Backend
- **PHP 8 / Node.js Express** — rugalmasan választható szerveroldali implementáció
- **SQLite** — megbízható, hordozható adatbázis
- **Többfelhasználós támogatás** — valós idejű közös tervezés és szavazatszámlálás

## Fejlesztés és futtatás

A projekt futtatásához indítsd el külön terminálban a backend és a frontend szervert is. Részletes útmutatót az egyes mappákban (`server`, `root`) található fájlokban találsz.

## Adminisztráció 🛠️

A rendszer tartalmaz egy rejtett adminisztrációs felületet a szervezők számára. Az **Összegzés** oldalon a "Közös Tervezés" címre való **5 gyors kattintással** érhető el a vezérlőpult, ahol az adatbázis tisztítása vagy egyes felhasználók kezelése végezhető el.

Jó tervezést és még jobb kikapcsolódást kívánunk!
