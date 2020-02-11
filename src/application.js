const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyparser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const axios = require("axios");

const app = express();

const gameRoute = require("./routes/games")

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

const games = []
function getGames(date) {
  axios(`https://api-basketball.p.rapidapi.com/games?date=${date}`, {
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "api-basketball.p.rapidapi.com",
      "x-rapidapi-key": "d8dfc5cbfdmshbb0b69d2a790b3dp1ba90ejsn8f36ab430b8b"
    }
  })
  .then(res => {
    // get all the games for the current date.
    res.data.response.forEach(result => {
      if (result.league.name === "NBA") {
        games.push(result)
      }
    })
  })
  .catch(err => console.log)
}
const dates = ['2020-02-10', '2020-02-11', '2020-02-12']
dates.forEach(date => {
  getGames(date)
})

module.exports = function application(
  ENV, 
  actions= { getGames: () => {} }
  ) {
  app.use(cors());
  app.use(helmet());
  app.use(bodyparser.json());
  
  app.use("/api", gameRoute(db))

  if (ENV === "development" || ENV === "test") {
    Promise.all([
      read(path.resolve(__dirname, `db/schema/create.sql`)),
      read(path.resolve(__dirname, `db/schema/${ENV}.sql`))
    ])
      .then(([create, seed]) => {
        app.get("/api/debug/reset", (request, response) => {
          // make a call to games and reset the db.
          // [TODO] cleanup -- put this into a separate function.
          db.query(create)
            .then(() => {
              games.forEach(game => {
                const game_id   = game.id
                const date      = game.date
                const timestamp = game.timestamp
                const status    = game.status.short
                const home_team = game.teams.home.name
                const away_team = game.teams.away.name
                const home_score= game.scores.home.total || 0
                const away_score= game.scores.away.total || 0

                db.query(
                  `
                  INSERT INTO games (
                    game_id, date, timestamp, status, home_team, 
                    away_team, home_score, away_score
                  ) VALUES (
                    $1::integer, $2::text, $3::integer, $4::text, 
                    $5::text, $6::text, $7::integer, $8::integer
                  )`,
                   [ game_id, date, timestamp, status,
                      home_team, away_team, home_score, away_score ]        
                )
                .then(res => console.log)
                .catch(err => console.log(err))
            });
        })
        .catch(error => {
          console.log(`Error setting up the reset route: ${error}`);
        })
          
        console.log("Database Reset");
        response.status(200).send("Database Reset");
      })
    })
  }

  app.close = function() {
    return db.end();
  };

  return app;
};
