const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.resolve(__dirname, "meetings.db"));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      transcript TEXT
    )
  `);
});

function saveMeeting(filename, transcript) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO meetings (filename, transcript) VALUES (?, ?)",
      [filename, transcript],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

module.exports = { saveMeeting };