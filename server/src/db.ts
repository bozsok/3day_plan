import initSqlJs, { type Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'app.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db: Database;

/** Adatbázis inicializálása (aszinkron, egyszer kell hívni induláskor) */
export async function initDatabase(): Promise<Database> {
    const SQL = await initSqlJs();

    // Ha létezik fájl, betöltjük; ha nem, újat hozunk létre
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    // Schema
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS date_selections (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            region_id  TEXT,
            date       TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(user_id, region_id, date)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS vote_blocks (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            region_id  TEXT NOT NULL,
            dates      TEXT NOT NULL, -- JSON string a dátumok tömbjéről
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS user_progress (
            user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            has_dates  INTEGER DEFAULT 0,
            region_id  TEXT,
            package_id TEXT,
            last_active INTEGER
        );
    `);

    db.run('PRAGMA foreign_keys = ON');

    // Automatikus mentés leálláskor
    saveDatabase();

    return db;
}

/** Adatbázis mentése fájlba */
export function saveDatabase(): void {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

/** Adatbázis lekérése (szinkron, init után) */
export function getDb(): Database {
    if (!db) throw new Error('Database not initialized! Call initDatabase() first.');
    return db;
}
