import { Router } from 'express';
import { getDb, saveDatabase } from '../db';

const router = Router();

// RESET DATABASE (Delete all data)
router.post('/reset', (req, res) => {
    try {
        const db = getDb();

        // Truncate tables
        db.run("DELETE FROM vote_blocks");
        db.run("DELETE FROM date_selections");
        db.run("DELETE FROM users");

        // Reset Auto Increment (optional, but good for clean state)
        db.run("DELETE FROM sqlite_sequence WHERE name='users'");
        db.run("DELETE FROM sqlite_sequence WHERE name='vote_blocks'");
        db.run("DELETE FROM sqlite_sequence WHERE name='date_selections'");

        saveDatabase();
        res.json({ success: true, message: 'Adatbázis sikeresen törölve.' });
    } catch (error) {
        console.error('Admin reset error:', error);
        res.status(500).json({ error: 'Nem sikerült a reset.' });
    }
});

// DELETE SPECIFIC USER
router.delete('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();

        db.run("DELETE FROM users WHERE id = ?", [id]);
        // Cascading deletes should handle relations, but manual cleanup is safer if foreign keys aren't strict
        db.run("DELETE FROM vote_blocks WHERE user_id = ?", [id]);
        db.run("DELETE FROM date_selections WHERE user_id = ?", [id]);

        saveDatabase();
        res.json({ success: true, message: `Felhasználó (${id}) törölve.` });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Nem sikerült a felhasználó törlése.' });
    }
});

export default router;
