# Implementációs Terv: 3-Lépcsős Élő Haladásjelző Rendszer

Ez a dokumentum a "3nap Tervező" alkalmazás haladásjelző rendszerének (dátum, helyszín, csomag) technikai és logikai felépítését részletezi. A cél egy "becsapásmentes", őszinte és élő visszajelzés az Összegzés oldalon.

## 1. Backend Infrastruktúra (Linux Kompatibilis)
- [x] **különálló `progress.json` fájl létrehozása**: A szavazatoktól elkülönítve tároljuk az ideiglenes haladást, hogy elkerüljük a fájlzárolási ütközéseket.
- [x] **`api/progress.php` létrehozása**: Új végpont a haladás kezelésére.
    - [x] `POST`: Haladás mentése/frissítése (beírja a `lastActive` időbélyeget is).
    - [x] `DELETE` / `action=clear`: Egy adott felhasználó piszkozatának törlése.
- [x] **Passzív takarítás (TTL) implementálása**: A `summary.php`-ban lekérdezéskor minden rekordot, ami régebbi 15 percnél, figyelmen kívül hagyunk.

## 2. API Kliens Bővítése (`src/api/client.ts`)
- [x] **Progress API definíció**:
    - `progress.update(userId, data)`: Hívás a `progress.php`-nak.
    - `progress.clear(userId)`: Piszkozat törlése.

## 3. Frontend Haladás-kezelés (Checkpoint Mentések)
Minden lépésnél a "Tovább" gomb checkpoint-ként funkcionál.
- [x] **DateSelection (1. lépés)**: A "Tovább" gombra nyomva mentés: `{ hasDates: true }`.
- [x] **MapSelection (2. lépés)**: A "Tovább" gombra nyomva mentés: `{ regionId: '...' }`.
- [x] **PackageSelection (3. lépés)**: A csomag kiválasztásakor/Tovább gombnál mentés: `{ packageId: '...' }`.
- [x] **Reset Logika**: A "Tovább tervezek" gomb megnyomásakor az `api.progress.clear(user.id)` hívása kötelező.

## 4. Összegzés Oldal Frissítése (`DesignerStatus.tsx`)
- [x] **Ikonok visszavezetése**: A "Még úton vannak felénk..." listában a nevek mellett megjelenítjük a 3 piktogramot:
    - [x] `📅` (Dátum): Ha `hasDates` igaz.
    - [x] `📍` (Helyszín): Ha `regionId` nem null.
    - [x] `📦` (Csomag): Ha `packageId` nem null.
- [x] **Szigorú plecsni logika**:
    - **KÉSZ (Zöld kártya)**: Csak ha van rekord a `vote_blocks`-ban.
    - **Haladás (Ikonok)**: Csak az aktuális `user_progress` alapján.

## 5. Edge Case-ek és Gyengeségek Kezelése
- [x] **Visszalépés (Route Watcher)**: Ha a felhasználó visszalép az előző lépésekre, a szerveren korrigáljuk a piszkozatot (töröljük a későbbi lépések ikonjait).
- [x] **Megerősített Mentés (Ack)**: A "Tovább" gombok bevárják a szerver válaszát.
- [x] **Inaktivitás**: Az Összegzés oldal pollingja (12s) frissíti a listát, az inaktív (15 perc+) felhasználók ikonjai eltűnnek.

---
*Utolsó frissítés: 2026. 02. 15. 03:20*
*Státusz: KÉSZ*
