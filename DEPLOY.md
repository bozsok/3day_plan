# Telepítési Útmutató (Deploy Guide) - v0.5.3

> [!IMPORTANT]
> **Hagyományos Tárhely (Apache + PHP)?**
> Ha a szervereden nem tudsz Node.js alkalmazásokat futtatni (pl. cPanel, Shared Hosting), ez az útmutató **NEM** érvényes!
> Ebben az esetben a backendet **PHP-re** kell cserélni. (A fejlesztés folyamatban...)

Mivel az alkalmazás most már **Backendet** (Node.js + SQLite) is használ, a telepítés folyamata megváltozott. Nem elég csak a statikus fájlokat másolni!

## 1. Előkészületek (Helyi Gép)

Először "le kell gyártanunk" a futtatható verziót mindkét oldalhoz.

### Frontend Build
A felhasználói felület (React) statikus fájlokká alakítása:
```bash
# A projekt gyökerében:
npm run build
# Létrejön a "dist" mappa.
```

### Backend Build
A szerver kód (TypeScript) lefordítása JavaScriptre:
```bash
cd server
npm run build
# Létrejön a "server/dist" mappa.
```

---

## 2. Fájlok Másolása a Szerverre

A szerveren létre kell hoznod egy mappát (pl. `/var/www/3nap-tervezo`), és oda másolni a következőket a helyi gépről:

1.  **Frontend fájlok:**
    - A teljes `dist` mappa tartalmát másold be egy `public` (vagy `client-dist`) mappába a szerveren. 
    - *VAGY*: Tartsd meg a struktúrát: másold fel a `dist` mappát a gyökérbe.

2.  **Backend fájlok:**
    - A `server` mappát másold fel (de a `node_modules` és `src` mappák NÉLKÜL!).
    - Aminek fent kell lennie a `server` mappában:
        - `dist` mappa (a lefordított JS kód)
        - `package.json`
        - `data` mappa (üresen vagy a meglévő `app.db`-vel, ha meg akarod tartani)

**Ajánlott Könyvtárszerkezet a Szerveren:**
```
/my-app/
├── dist/               <-- Frontend build (index.html, assets...)
└── server/
    ├── dist/           <-- Backend build (index.js...)
    ├── data/           <-- Adatbázis (app.db)
    └── package.json    <-- Backend függőségek
```

---

## 3. Szerver Beállítása (Linux)

Lépj be a szerverre SSH-val, és menj a `server` mappába:

```bash
cd /my-app/server
```

1.  **Függőségek telepítése:**
    ```bash
    npm install --production
    ```

2.  **Szerver indítása (Próba):**
    ```bash
    NODE_ENV=production node dist/index.js
    ```
    Ha minden jól megy, kiírja: `🚀 Szerver fut: http://localhost:3001` és `📁 Mód: PRODUCTION`.

3.  **Végleges futtatás (PM2-vel):**
    (Ha még nincs PM2: `npm install -g pm2`)
    ```bash
    pm2 start dist/index.js --name "3nap-tervezo" --env production
    ```

## 4. Reverse Proxy (Nginx)

Mivel a backend a 3001-es porton fut, be kell állítani az Nginx-et, hogy oda továbbítsa a kéréseket.

```nginx
server {
    listen 80;
    server_name pelda.hu;

    location / {
        # A backend kiszolgálja a frontendet is Production módban!
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Fontos:** A backend kód (`server/src/index.ts`) úgy van megírva, hogy Production módban automatikusan kiszolgálja a statikus fájlokat a `../../dist` mappából. Ezért elég csak a 3001-es portra irányítani mindent.

## 5. Telepítés Hagyományos Tárhelyre (PHP) - Bárhová!

A program most már **Relatív Útvonalakat** használ, így nem számít, melyik mappába teszed.

### 1. Build
```bash
npm run build
```

### 2. Másolás (FTP)
A generált `dist` mappa tartalmát és a `server` mappát másold fel a szerverre **egymás mellé**.

Példa szerkezet (bármilyen mappában lehetsz, pl. `www/nyaralas/`):
```
.../te-mappad/
├── assets/             <-- Frontend (dist-ből)
├── index.html          <-- Frontend (dist-ből)
└── server/             <-- Backend mappa
    ├── api/            <-- PHP Fájlok (Felül kell írni a régieket!)
    └── data/           <-- Adatbázis (Mostanra: db.json lesz benne)
```

**Lényeg:** Az `index.html` és a `server` mappa legyen egy szinten. Ennyi!

### 3. Jogosultságok
A `server/data` mappára adj **írási jogot** (777), hogy a PHP létrehozhassa benne a `db.json` fájlt.
(Ha már beállítottad az előbb, akkor jó vagy!)

