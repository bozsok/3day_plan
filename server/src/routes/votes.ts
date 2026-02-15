import { Router } from 'express';
import { getDb, saveDatabase } from '../db.js';

const router = Router();

function queryOne(sql: string, params: any[] = []): any {
    const db = getDb();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) {
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        row = Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
    }
    stmt.free();
    return row;
}

function queryAll(sql: string, params: any[] = []): any[] {
    const db = getDb();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows: any[] = [];
    const cols = stmt.getColumnNames();
    while (stmt.step()) {
        const vals = stmt.get();
        rows.push(Object.fromEntries(cols.map((c, i) => [c, vals[i]])));
    }
    stmt.free();
    return rows;
}

/** POST /api/votes — Új szavazási blokk létrehozása */
router.post('/', (req, res) => {
    const { userId, regionId, dates, packageId } = req.body; // packageId hozzáadva
    if (!userId || !regionId || !Array.isArray(dates) || dates.length !== 3) {
        res.status(400).json({ error: 'userId, regionId és pontosan 3 dátum kötelező.' });
        return;
    }

    const db = getDb();
    const uid = Number(userId);
    // Biztosítjuk, hogy a dátumok mindig rendezve legyenek a JSON stringben
    const sortedDates = [...dates].sort();
    const datesJson = JSON.stringify(sortedDates);

    // 1. Ellenőrzés: Van-e már PONTOSAN ILYEN szavazata (user + region + dates + package)?
    // Ha a csomag változik, az új szavazatnak számít a részletes nézetben?
    // A logika szerint: "A felhasználó a dátum után helyszínt is választ... Csomag: amelyiket éppen kiválasztotta".
    // Ha módosítja a csomagot, az lehet UPDATE vagy új INSERT.
    // Mivel a "Detailed Votes" előzményeket is mutathat, de a Summary csak a legutolsót kéne, hogy számolja...
    // Jelenleg a rendszer enged több szavazatot. Maradjunk az INSERT-nél, ha eltér.

    const existing = queryOne(
        'SELECT id FROM vote_blocks WHERE user_id = ? AND region_id = ? AND dates = ? AND (package_id = ? OR (? IS NULL AND package_id IS NULL))',
        [uid, regionId, datesJson, packageId || null, packageId || null]
    );

    let blockId;

    if (existing) {
        // Már létezik ez a konkrét szavazat -> Nem csinálunk semmit
        blockId = existing.id;
    } else {
        // Még nem létezik -> Létrehozzuk (ÚJ szavazat)
        const createdAt = new Date().toISOString();
        db.run(
            'INSERT INTO vote_blocks (user_id, region_id, package_id, dates, created_at) VALUES (?, ?, ?, ?, ?)',
            [uid, regionId, packageId || null, datesJson, createdAt]
        );
        const newBlock = queryOne('SELECT id FROM vote_blocks WHERE user_id = ? ORDER BY id DESC LIMIT 1', [uid]);
        blockId = newBlock.id;
    }

    saveDatabase();

    // Visszaadjuk a blokkot
    const resultBlock = queryOne(
        'SELECT id, region_id as regionId, package_id as packageId, dates, created_at as createdAt FROM vote_blocks WHERE id = ?',
        [blockId]
    );

    if (resultBlock) {
        resultBlock.dates = JSON.parse(resultBlock.dates);
    }

    res.json({ success: true, block: resultBlock });
});

/** DELETE /api/votes — Szavazási blokk törlése */
router.delete('/', (req, res) => {
    const { userId, blockId } = req.body;
    if (!userId || !blockId) {
        res.status(400).json({ error: 'userId és blockId kötelező.' });
        return;
    }

    const db = getDb();
    const uid = Number(userId);
    const bid = Number(blockId);

    // Opcionális: Szerezze meg a blokkot törlés előtt, hogy tudjuk a dátumokat törölni a date_selections-ből
    // A SPEC szerint ez a javasolt viselkedés.
    const block = queryOne('SELECT * FROM vote_blocks WHERE id = ? AND user_id = ?', [bid, uid]);

    if (block) {
        const datesToRemove = JSON.parse(block.dates);
        const rid = block.region_id;

        db.run('DELETE FROM vote_blocks WHERE id = ?', [bid]);

        // Dátumok takarítása (date_selections)
        // Csak azokat, amik ehhez a régióhoz és ezekhez a napokhoz tartoztak
        if (datesToRemove.length > 0) {
            const placeholders = datesToRemove.map(() => '?').join(',');
            // region_id itt biztosan string (nem null), mert blokkhoz van kötve
            const sql = `DELETE FROM date_selections WHERE user_id = ? AND region_id = ? AND date IN (${placeholders})`;
            db.run(sql, [uid, rid, ...datesToRemove]);
        }

        saveDatabase();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'A szavazat nem található.' });
    }
});

/** GET /api/votes?userId=X — Szavazatok lekérdezése */
router.get('/', (req, res) => {
    const { userId } = req.query;
    let sql = 'SELECT id, user_id, region_id as regionId, dates, created_at as createdAt FROM vote_blocks ORDER BY created_at DESC';
    let params: any[] = [];

    if (userId) {
        sql = 'SELECT id, user_id, region_id as regionId, dates, created_at as createdAt FROM vote_blocks WHERE user_id = ? ORDER BY created_at DESC';
        params = [Number(userId)];
    }

    const rows = queryAll(sql, params);
    const parsed = rows.map((r: any) => ({
        ...r,
        dates: JSON.parse(r.dates)
    }));

    res.json(parsed);
});

export default router;
