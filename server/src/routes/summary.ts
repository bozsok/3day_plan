import { Router } from 'express';
import { getDb } from '../db.js';

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

/** GET /api/summary — Teljes összegzés */
router.get('/', (_req, res) => {
    // 1. Dátum Intervallumok (Top 3)
    // 1. Dátum Intervallumok (Top 3) - MOST MÁR A LEADOTT SZAVAZATOK ALAPJÁN
    const blocks = queryAll(`
        SELECT vb.dates, u.name
        FROM vote_blocks vb
        JOIN users u ON vb.user_id = u.id
    `);

    // Intervallumok számlálása
    const intervalCounts: Record<string, { count: number, users: string[], start: string, end: string }> = {};

    for (const block of blocks) {
        try {
            const dates: string[] = JSON.parse(block.dates);
            if (dates.length > 0) {
                const sorted = dates.sort();
                const start = sorted[0];
                const end = sorted[sorted.length - 1];
                const key = `${start}|${end}`;

                if (!intervalCounts[key]) {
                    intervalCounts[key] = { count: 0, users: [], start, end };
                }
                intervalCounts[key].count++;
                // Hozzáadjuk a nevet, ha még nincs benne (vagy mindig? A user azt kérte, látszódjon a többszörözés?)
                // A UI "users" listája a tooltipben van. Ha valaki 5-ször szavazott, 5-ször legyen ott a neve?
                // A kérdés: "de a dátumbejegyzésnél marad 1szavazat". Ez a count-ra vonatkozott.
                // A nevek listázásánál logikus lehet, ha többször szerepel, vagy zárójelben (x2).
                // Egyelőre simán push-oljuk, így többször lesz ott, ami jelzi a "súlyt".
                intervalCounts[key].users.push(block.name);
            }
        } catch (e) {
            console.error('Json parse error in summary:', e);
        }
    }

    // Top 3 kiválasztása
    const topIntervals = Object.values(intervalCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    // 2. Szavazási rangsor
    const voteRows = queryAll(`
        SELECT v.region_id, COUNT(*) as count, GROUP_CONCAT(u.name, ', ') as voters
        FROM vote_blocks v
        JOIN users u ON v.user_id = u.id
        GROUP BY v.region_id
        ORDER BY count DESC
    `);

    const voteRanking = voteRows.map(row => ({
        regionId: row.region_id,
        count: row.count,
        voters: (row.voters as string).split(', '),
    }));

    // 3. Felhasználó státuszok
    const userRows = queryAll(`
        SELECT
            u.id, u.name, u.created_at,
            (SELECT COUNT(*) FROM date_selections WHERE user_id = u.id) as dates_count,
            (SELECT COUNT(*) FROM vote_blocks WHERE user_id = u.id) as votes_count
        FROM users u
        ORDER BY u.name
    `);

    const userStatuses = userRows.map(row => ({
        id: row.id,
        name: row.name,
    }));

    // 4. Live Haladás adatok (Progress)
    const now = Math.floor(Date.now() / 1000);
    const progressRows = queryAll(`
        SELECT * FROM user_progress 
        WHERE last_active >= ?
    `, [now - 900]);

    const userProgress: Record<number, any> = {};
    for (const p of progressRows) {
        let ongoingDates = [];
        try {
            if (p.dates) {
                ongoingDates = JSON.parse(p.dates);
            }
        } catch (e) {
            console.error('Json parse error in userProgress dates:', e);
        }

        userProgress[p.user_id] = {
            hasDates: p.has_dates === 1,
            dates: ongoingDates, // Új mező
            regionId: p.region_id,
            packageId: p.package_id,
            lastActive: p.last_active
        };
    }

    // 5. Részletes Szavazatok (ÚJ) - A táblázathoz
    let detailedVotes: any[] = [];
    try {
        const detailedVotesRows = queryAll(`
            SELECT 
                vb.id,
                vb.user_id, 
                u.name, 
                vb.dates, 
                vb.region_id, 
                vb.package_id, 
                strftime('%s', vb.created_at) as created_at_unix
            FROM vote_blocks vb 
            JOIN users u ON vb.user_id = u.id 
            ORDER BY vb.created_at DESC
        `);

        detailedVotes = detailedVotesRows.map(row => {
            let datesParsed = [];
            try {
                datesParsed = JSON.parse(row.dates || '[]');
            } catch (e) {
                console.error('Json parse error in detailed votes:', e);
            }

            // Dátum formázása
            const dateStr = datesParsed.length > 0 ? `${datesParsed[0]}` : '';
            const endDateStr = datesParsed.length > 0 ? datesParsed[datesParsed.length - 1] : '';

            return {
                id: row.id,
                userId: row.user_id,
                userName: row.name,
                dates: datesParsed,
                startDate: dateStr,
                endDate: endDateStr,
                regionId: row.region_id,
                packageId: row.package_id,
                timestamp: row.created_at_unix ? Number(row.created_at_unix) : Math.floor(Date.now() / 1000)
            };
        });
    } catch (err) {
        console.error('Error fetching detailed votes (schema mismatch?):', err);
        // Fallback: üres tömb, hogy ne haljon meg az oldal
        detailedVotes = [];
    }

    res.json({
        topIntervals,
        voteRanking,
        userStatuses,
        userProgress,
        detailedVotes
    });
});

export default router;
