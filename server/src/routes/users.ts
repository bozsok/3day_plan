import { Router } from 'express';
import { getDb, saveDatabase } from '../db.js';

const router = Router();
// Restart trigger 2

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

/** Sql.js helper: all rows → array of plain objects */
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

/** POST /api/users — Létrehozás VAGY visszaadás név alapján */
router.post('/', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'A név megadása kötelező.' });
        return;
    }

    const trimmed = name.trim();
    const existing = queryOne('SELECT * FROM users WHERE name = ?', [trimmed]);
    if (existing) {
        res.json(existing);
        return;
    }

    const db = getDb();
    db.run('INSERT INTO users (name) VALUES (?)', [trimmed]);
    saveDatabase();
    const user = queryOne('SELECT * FROM users WHERE name = ?', [trimmed]);
    res.status(201).json(user);
});

/** GET /api/users — Összes user */
router.get('/', (_req, res) => {
    res.json(queryAll('SELECT * FROM users ORDER BY name'));
});

/** GET /api/users/:id — Egy user adatai dátumokkal és szavazatokkal */
router.get('/:id', (req, res) => {
    const user = queryOne('SELECT * FROM users WHERE id = ?', [Number(req.params.id)]);
    if (!user) {
        res.status(404).json({ error: 'Felhasználó nem található.' });
        return;
    }

    const dates = queryAll('SELECT date, region_id as regionId FROM date_selections WHERE user_id = ? ORDER BY date', [user.id]);
    const voteBlocks = queryAll('SELECT id, region_id as regionId, dates, created_at as createdAt FROM vote_blocks WHERE user_id = ? ORDER BY created_at DESC', [user.id]);

    // Parse dates JSON in voteBlocks
    const parsedVoteBlocks = voteBlocks.map((block: any) => ({
        ...block,
        dates: JSON.parse(block.dates)
    }));

    res.json({
        ...user,
        dateSelections: dates,
        voteBlocks: parsedVoteBlocks
    });
});

export default router;
