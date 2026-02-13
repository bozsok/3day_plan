import { Router } from 'express';
import { getDb, saveDatabase } from '../db.js';

const router = Router();

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

/** POST /api/dates — Dátumok mentése (régieket törli, újakat szúrja be) */
router.post('/', (req, res) => {
    const { userId, dates, regionId } = req.body;
    if (!userId || !Array.isArray(dates)) {
        res.status(400).json({ error: 'userId és dates[] megadása kötelező.' });
        return;
    }

    const db = getDb();
    const uid = Number(userId);

    // Megjegyzés: A "homokozó" koncepció szerint nem töröljük a régieket automatikusan,
    // de kerülni kell a duplikációt (user_id + region_id + date).

    // Ha regionId nincs megadva, akkor NULL-ként kezeljük (bár a UI mindig küldi)
    const rid = regionId || null;

    const insertStmt = db.prepare('INSERT OR IGNORE INTO date_selections (user_id, region_id, date) VALUES (?, ?, ?)');

    db.run("BEGIN TRANSACTION");
    try {
        for (const date of dates) {
            insertStmt.run([uid, rid, date]);
        }
        db.run("COMMIT");
    } catch (e) {
        db.run("ROLLBACK");
        throw e;
    } finally {
        insertStmt.free();
    }
    saveDatabase();

    // Visszatérés az aktuális listával (objektumok)
    const saved = queryAll('SELECT date, region_id as regionId FROM date_selections WHERE user_id = ? ORDER BY date', [uid]);
    res.json({ userId, dateSelections: saved });
});

/** DELETE /api/dates — Dátumok törlése */
router.delete('/', (req, res) => {
    const { userId, dates, regionId } = req.body;
    if (!userId || !Array.isArray(dates)) {
        res.status(400).json({ error: 'userId és dates[] megadása kötelező.' });
        return;
    }

    const db = getDb();
    const uid = Number(userId);
    const rid = regionId || null;

    // Törlés: csak azokat, amik a megadott dátumok ÉS régió
    // Ha a dates tömb üres, nem törlünk semmit (vagy mindent? Nem, biztonságosabb a konkrét).

    if (dates.length > 0) {
        // SQL IN klauzula felépítése
        const placeholders = dates.map(() => '?').join(',');
        const params = [uid, rid, ...dates]; // regionId lehet null, de az SQL-ben IS küldeni kell?
        // SQL: WHERE user_id = ? AND region_id IS ? AND date IN (...)
        // SQLite: IS comparison works for NULL.

        // Egyszerűbb ciklusban, vagy precíz query-vel.
        // Mivel SQLite driver kötései néha trükkösek NULL-nál, inkább query builder logika vagy ciklus.
        // De a "region_id = ?" nem találja meg a NULL-t. "region_id IS ?" kell.

        const sql = `DELETE FROM date_selections WHERE user_id = ? AND (region_id = ? OR (region_id IS NULL AND ? IS NULL)) AND date IN (${placeholders})`;
        // paraméterek: uid, rid, rid, ...dates
        db.run(sql, [uid, rid, rid, ...dates]);
        saveDatabase();
    }

    const saved = queryAll('SELECT date, region_id as regionId FROM date_selections WHERE user_id = ? ORDER BY date', [uid]);
    res.json({ userId, dateSelections: saved });
});

/** GET /api/dates?userId=X — Dátumok lekérdezése */
router.get('/', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        res.status(400).json({ error: 'userId megadása kötelező.' });
        return;
    }

    const saved = queryAll('SELECT date, region_id as regionId FROM date_selections WHERE user_id = ? ORDER BY date', [Number(userId)]);
    res.json({ userId: Number(userId), dateSelections: saved });
});

export default router;
