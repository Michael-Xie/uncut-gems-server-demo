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
    read(path.resolve(__dirname, `db/schema/create.sql`))
  }

  const dates = ['2020-02-11', '2020-02-12', '2020-02-14']
  getGames(dates, db)
  setInterval(() => {
    getGames(['2020-02-11'], db)
    console.log('updated')
  }, 10000)

  app.close = function() {
    return db.end();
  };

  return app;
};
