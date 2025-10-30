const express = require("express");
const sqlite3 = require("sqlite3");
const axios = require("axios");
const cheerio = require("cheerio");
const port = 3000;
const app = express();

const db = new sqlite3.Database("./games.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, link TEXT, price TEXT)"
  );
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  db.all("SELECT id, name, link, price FROM games", (err, rows) => {
    res.render("index", { title: "Game Tracker", games: rows });
  });
});

app.post("/add-game", async (req, res) => {
  const link = req.body.link;
  const response = await axios.get(link);
  const $ = cheerio.load(response.data);
  const name = $(".apphub_AppName").text();
  const price =
    $(".game_purchase_price").text();
  db.run(
    "INSERT INTO games (name, link, price) VALUES (?,?,?)",
    [name, link, price],
    (err, rows) => {
      if (err) {
        return res.send(err);
      } else
      return res.redirect("/");
    }
  );
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
