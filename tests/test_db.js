const sqlite3 = require('sqlite3').verbose();
let db;

function setupTestDB() {
    return new Promise((resolve) => {
        if (db) db.close(); // Ensure old DB is closed before creating a new one

        db = new sqlite3.Database(':memory:'); // In-memory DB for tests

        db.serialize(() => {
            db.run("PRAGMA foreign_keys=ON;"); // Enable foreign key constraints
            db.exec(require('fs').readFileSync('db_schema.sql').toString(), (err) => {
                if (err) throw err;
                resolve(db);
            });
        });
    });
}

function closeTestDB() {
    return new Promise((resolve) => {
        if (db) {
            db.close(() => resolve());
            db = null;
        } else {
            resolve();
        }
    });
}

module.exports = { setupTestDB, closeTestDB };
