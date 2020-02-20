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
const testRoute = require("./routes/test");

const getGames  = require("./models/getGames")
const getScores = require("./models/getScores")
const betsHelper = require("./models/bets")

const axios = require("axios")

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

module.exports = function application(ENV, actions = { updateState: () => {}}) {
  let date = ["2020-02-23"]
  getGames(date, db, true)

  setInterval(() => {
    getScores(date, db)
  }, 60000)

  app.use(cors())
  app.use(helmet())
  app.use(bodyparser.json())
  
  app.use("/api/test", testRoute(db, betsHelper))
  app.use("/api", gameRoute(db, actions.updateState))
  app.use("/api", scoreRoute(db, actions.updateState))
  app.use("/api", userRoute(db))
  app.use("/api", parlayRoute(db, actions.updateState))
  app.use("/api/parlay", betRoute(db))
  app.use("/api/parlay", particRoute(db))

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
