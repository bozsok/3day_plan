const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/data/app.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Connecting to database at:", dbPath);

    db.run("DELETE FROM users WHERE id = 1", function (err) {
        if (err) {
            return console.error("Error deleting user:", err.message);
        }
        console.log(`User rows deleted: ${this.changes}`);
    });

    db.run("DELETE FROM vote_blocks WHERE user_id = 1", function (err) {
        if (err) {
            return console.error("Error deleting votes:", err.message);
        }
        console.log(`Vote blocks deleted: ${this.changes}`);
    });

    db.run("DELETE FROM date_selections WHERE user_id = 1", function (err) {
        if (err) {
            return console.error("Error deleting dates:", err.message);
        }
        console.log(`Date selections deleted: ${this.changes}`);
    });
});

db.close();
