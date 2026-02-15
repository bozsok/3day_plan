import { initDatabase, getDb } from './src/db.js';

async function test() {
    try {
        await initDatabase();
        const db = getDb();
        console.log('Testing DELETE from user_progress...');
        db.run("DELETE FROM user_progress WHERE user_id = ?", [2]);
        console.log('DELETE success');

        console.log('Testing SELECT...');
        const stmt = db.prepare("SELECT * FROM user_progress");
        while (stmt.step()) {
            console.log(stmt.get());
        }
        stmt.free();
        console.log('SELECT success');
    } catch (e) {
        console.error('TEST FAILED:', e);
    }
}

test();
