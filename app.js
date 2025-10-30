const express = require("express");
const sqlite3 = require("sqlite3");
const port = 3000;
const app = express();

const db = new sqlite3.Database("./games.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, link TEXT, category TEXT)"
  );
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
