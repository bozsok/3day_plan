import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'app.db');

async function cleanUp() {
    console.log("Initializing SQL.js...");
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        console.log(`Loading database from ${DB_PATH}...`);
        const buffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(buffer);

        console.log("Deleting User ID 1 (Indigo Pixel)...");

        // Check if user exists first
        const check = db.exec("SELECT * FROM users WHERE id = 1");
        if (check.length > 0) {
            console.log("User 1 exists, deleting...");
            db.run("DELETE FROM users WHERE id = 1");
            db.run("DELETE FROM vote_blocks WHERE user_id = 1");
            db.run("DELETE FROM date_selections WHERE user_id = 1");
            console.log("Deletion complete.");

            // Save underlying db
            const data = db.export();
            const newBuffer = Buffer.from(data);
            fs.writeFileSync(DB_PATH, newBuffer);
            console.log("Database saved successfully.");
        } else {
            console.log("User 1 not found.");
        }

        db.close();
    } else {
        console.error("Database file not found!");
    }
}

cleanUp().catch(err => console.error(err));
