const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/data/app.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("DELETE FROM users WHERE id = 1", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) deleted: ${this.changes}`);
    });

    // Also delete associated votes if any (just in case)
    db.run("DELETE FROM vote_blocks WHERE user_id = 1", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Vote blocks deleted: ${this.changes}`);
    });

    // Also delete associated date selections if any
    db.run("DELETE FROM date_selections WHERE user_id = 1", function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Date selections deleted: ${this.changes}`);
    });
});

db.close();
