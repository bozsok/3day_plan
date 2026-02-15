import { Router } from 'express';
import { getDb, saveDatabase } from '../db.js';

const router = Router();

/** Sql.js helper: single row result → plain object */
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

/** POST /api/progress - Haladás mentése */
router.post('/', (req, res) => {
    try {
        const { userId: rawUserId, hasDates, regionId, packageId } = req.body || {};
        if (!rawUserId) return res.status(400).json({ error: 'userId required' });
        const userId = Number(rawUserId);

        const db = getDb();
        const now = Math.floor(Date.now() / 1000);

        // Kikeressük az aktuálisat (Helyesen segédfüggvénnyel)
        const existing = queryOne("SELECT user_id FROM user_progress WHERE user_id = ?", [userId]);

        if (existing) {
            // UPDATE
            let sql = "UPDATE user_progress SET last_active = ?";
            const params: any[] = [now];

            if (hasDates !== undefined) {
                sql += ", has_dates = ?";
                params.push(hasDates ? 1 : 0);
            }
            if (regionId !== undefined) {
                sql += ", region_id = ?";
                params.push(regionId);
            }
            if (packageId !== undefined) {
                sql += ", package_id = ?";
                params.push(packageId);
            }

            params.push(userId);
            db.run(sql + " WHERE user_id = ?", params);
        } else {
            // INSERT
            db.run(
                "INSERT INTO user_progress (user_id, has_dates, region_id, package_id, last_active) VALUES (?, ?, ?, ?, ?)",
                [userId, hasDates ? 1 : 0, regionId || null, packageId || null, now]
            );
        }

        saveDatabase();
        res.json({ status: 'success' });
    } catch (err: any) {
        console.error('Progress POST error:', err);
        res.status(500).json({ error: err.message });
    }
});

/** DELETE /api/progress - Piszkozat törlése */
router.delete('/', (req, res) => {
    try {
        // Elviszi a body-t és a query-t is a biztonság kedvéért
        const rawUserId = req.body?.userId || req.query?.userId;
        if (!rawUserId) return res.status(400).json({ error: 'userId required' });
        const userId = Number(rawUserId);

        const db = getDb();

        // Biztonságosabb törlés prepare-rel
        const stmt = db.prepare("DELETE FROM user_progress WHERE user_id = ?");
        stmt.run([userId]);
        stmt.free();

        saveDatabase();
        res.json({ status: 'cleared' });
    } catch (err: any) {
        console.error('Progress DELETE error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
