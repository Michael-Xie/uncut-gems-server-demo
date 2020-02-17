// ---------- imports -----------------------
const fs   = require("fs")
const path = require("path")

const express    = require("express")
const bodyparser = require("body-parser")
const helmet     = require("helmet")
const cors       = require("cors")

const app = express();

const gameRoute   = require("./routes/games")
const scoreRoute  = require("./routes/scores")
const userRoute   = require("./routes/users")
const parlayRoute = require("./routes/parlays")
const betRoute    = require("./routes/bets")
const particRoute = require("./routes/participants")

const getGames  = require("./models/getGames")
const getScores = require("./models/getScores")

const db = require("./db")

// -------------------------------------------

function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      file,
      {
        encoding: "utf-8"
      },
      (error, data) => {
        if (error) return reject(error);
        resolve(data);
      }
    );
  });
}

module.exports = function application(ENV, actions = { updateGames: () => {}}) {
  /* logic to handle calling the basketball-api and updating the client 
   * [TODO] set the games date. 
   */
  let date = ["2020-02-11"]
  getGames(date, db, true)

  setInterval(() => {
    date = ["2020-02-13"]
    getGames(date, db, true)
  }, 600000)

  setInterval(() => {
    getScores(date, db)
  }, 60000)

  app.use(cors())
  app.use(helmet())
  app.use(bodyparser.json())

  app.use("/api", gameRoute(db, actions.updateGames))
  app.use("/api", scoreRoute(db, actions.updateGames))
  app.use("/api", userRoute(db))
  app.use("/api", parlayRoute(db))
  app.use("/api", betRoute(db))
  app.use("/api", particRoute(db))

  if (ENV === "development" || ENV === "test") {
    Promise.all([
      read(path.resolve(__dirname, `db/schema/create.sql`)),
      read(path.resolve(__dirname, `db/schema/${ENV}.sql`))
    ])
      .then(([create, seed]) => {
        app.get("/api/debug/reset", (request, response) => {
          db.query(create)
            .then(() => db.query(seed))
            .then(() => {
              console.log("Database Reset");
              response.status(200).send("Database Reset")
            })
        })
      })
      .catch(error => {
        console.log(`Error setting up the reset route: ${error}`)
      })
  }

  app.close = function() {
    return db.end()
  };

  return app;
};
