const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyparser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

const gameRoute = require("./routes/games")
const getGames = require("./models/getGames")

const db = require("./db");
// -----------------------------------

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

module.exports = function application(ENV) {
  app.use(cors());
  app.use(helmet());
  app.use(bodyparser.json());
  
  app.use("/api", gameRoute(db))

  if (ENV === "development" || ENV === "test") {
    Promise.all([
      read(path.resolve(__dirname, `db/schema/create.sql`))
      read(path.resolve(__dirname, `db/schema/${ENV}.sql`))
    ])
      .then(([create, seed]) => {
        app.get("/api/debug/reset", (request, response) => {
          db.query(create)
            .then(() => db.query(seed))
            .then(() => {
              console.log("Database Reset");
              response.status(200).send("Database Reset");
            });
        });
      })
      .catch(error => {
        console.log(`Error setting up the reset route: ${error}`);
      });
  }

  // format dates
  const dates = ['2020-02-14']
  getGames(dates, db)

  let i = 0
  setInterval(() => {
    getGames(dates, db)
    i++
    console.log(`API call #${i}`)
  }, 30000)

  app.close = function() {
    return db.end();
  };

  return app;
};
