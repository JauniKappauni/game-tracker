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
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  db.all("SELECT id, name, link, category FROM games", (err, rows) => {
    res.render("index", { title: "Game Tracker", games: rows });
  });
});

app.post("/add-game", (req, res) => {
  const name = req.body.name;
  const link = req.body.link;
  const category = req.body.category;
  db.run(
    "INSERT INTO games (name, link, category) VALUES (?,?,?)",
    [name, link, category],
    (err, rows) => {
      if (err) {
        res.send(err);
      } else {
        res.send(rows);
      }
    }
  );
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
