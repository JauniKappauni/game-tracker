const express = require("express");
const sqlite3 = require("sqlite3");
const axios = require("axios");
const cheerio = require("cheerio");
const port = 3000;
const app = express();

const db = new sqlite3.Database("./games.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, link TEXT, price TEXT, image TEXT, RPT TEXT)"
  );
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  db.all("SELECT * FROM games", (err, rows) => {
    res.render("index", { title: "Game Tracker", games: rows });
  });
});

app.post("/add-game", async (req, res) => {
  const link = req.body.link;
  const response = await axios.get(link);
  const $ = cheerio.load(response.data);
  const name = $(".apphub_AppName").first().text();
  const description = $(".game_description_snippet").first().text();
  let price = $(".game_purchase_price").first().text();
  if (!price) {
    price = $(".discount_final_price").first().text();
  }
  if (!price) {
    price = "Unavailable";
  }
  const image = $(".game_header_image_full").attr("src");
  const supportsRPT =
    $("*").filter((i, el) => $(el).text().trim() === "Remote Play Together")
      .length > 0 || /Remote Play Together/i.test(response.data);
  const RPT = supportsRPT ? "✅" : "❌";
  db.run(
    "INSERT INTO games (name, description, link, price, image, RPT) VALUES (?,?,?,?,?,?)",
    [name, description, link, price, image, RPT],
    (err, rows) => {
      if (err) {
        return res.send(err);
      }
      return res.redirect("/");
    }
  );
});

app.get("/game/:id", (req, res) => {
  gameId = req.params.id;
  db.get(
    "SELECT * FROM games WHERE id = ?",
    [gameId],
    (err, row) => {
      res.render("game", { title: row.name, game: row });
    }
  );
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
