import { Router } from 'express';
import { getDb, saveDatabase } from '../db.js';

const router = Router();

// GET all packages
router.get('/', (req, res) => {
    try {
        const db = getDb();
        // A packages tábla 'data' oszlopa tárolja a teljes JSON-t stringként
        const result = db.exec("SELECT data FROM packages");

        if (result.length === 0 || !result[0].values) {
            return res.json([]);
        }

        // result[0].values egy tömb tömbökkel: [['{"id":...}']]
        const packages = result[0].values.map((row: any[]) => JSON.parse(row[0] as string));

        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

// SAVE all packages (Replace all or Upsert - itt most package builder savePackages logikája a teljes listát küldi?)
// A PackageService.savePackages a backendre a Package[] tömböt küldi, vagy egy csomagot?
// A frontend kód: await savePackages(updatedPackages); -> TEHÁT A TELJES LISTÁT KÜLDI.
// Ezért itt egyszerűsíthetünk: töröljük a régieket és beírjuk az újakat, VAGY upsert.
// Mivel SQLite és JSON storage, a legegyszerűbb, ha végigmegyünk a kapott listán és mentjük őket.

router.post('/', (req, res) => {
    try {
        const packages = req.body; // Array of packages
        if (!Array.isArray(packages)) {
            return res.status(400).json({ error: 'Expected an array of packages' });
        }

        const db = getDb();

        // Transaction: Delete all and re-insert to ensure sync
        db.run("BEGIN TRANSACTION");

        try {
            // 1. Töröljük a meglévőket (hogy a kliens oldalon töröltek innen is eltűnjenek)
            db.run("DELETE FROM packages");

            // 2. Beszúrjuk az újakat
            const stmt = db.prepare("INSERT INTO packages (id, data, updated_at) VALUES (?, ?, datetime('now'))");

            packages.forEach((pkg: any) => {
                if (!pkg.id) return;
                const jsonStr = JSON.stringify(pkg);
                stmt.run([pkg.id, jsonStr]);
            });

            stmt.free();
            db.run("COMMIT");
            saveDatabase();

            res.json({ success: true, count: packages.length });
        } catch (innerError) {
            db.run("ROLLBACK");
            throw innerError;
        }

    } catch (error) {
        console.error('Error saving packages:', error);
        res.status(500).json({ error: 'Failed to save packages' });
    }
});

export default router;
