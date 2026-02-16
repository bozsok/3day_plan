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
            package_id TEXT, -- Új oszlop a csomaghoz
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
            last_active INTEGER,
            dates      TEXT -- JSON string
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS packages (
            id         TEXT PRIMARY KEY,
            data       TEXT NOT NULL, -- Teljes JSON objektum (Package interface)
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
    `);

    db.run('PRAGMA foreign_keys = ON');

    // --- AUTOMATIKUS MIGRÁCIÓ (Meglévő adatbázisok frissítése) ---

    // 1. vote_blocks: package_id hozzáadása
    try {
        const columns = db.exec("PRAGMA table_info(vote_blocks)")[0].values;
        // columns: [cid, name, type, notnull, dflt_value, pk]
        const hasPackageId = columns.some((col: any) => col[1] === 'package_id');
        if (!hasPackageId) {
            console.log('Migráció: vote_blocks tábla bővítése package_id oszloppal...');
            db.run("ALTER TABLE vote_blocks ADD COLUMN package_id TEXT");
        }
    } catch (e) {
        console.error('Hiba a vote_blocks migrációnál:', e);
    }

    // 2. user_progress: dates (JSON) hozzáadása
    try {
        const columns = db.exec("PRAGMA table_info(user_progress)")[0].values;
        const hasDates = columns.some((col: any) => col[1] === 'dates');
        if (!hasDates) {
            console.log('Migráció: user_progress tábla bővítése dates oszloppal...');
            db.run("ALTER TABLE user_progress ADD COLUMN dates TEXT");
        }
    } catch (e) {
        console.error('Hiba a user_progress migrációnál:', e);
    }

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
