const axios = require("axios")

module.exports = (dates, db, callAPI) => {
  // delete all data currently in the games table.
  db.query(`DELETE FROM games WHERE games.id > 0`)
  // ---------------------------------------------
  dates.map(date => {
    axios(`https://api-basketball.p.rapidapi.com/games?date=${date}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-host": "api-basketball.p.rapidapi.com",
        "x-rapidapi-key": "d8dfc5cbfdmshbb0b69d2a790b3dp1ba90ejsn8f36ab430b8b"
      }
    })
    .then(res => {
      // get all the games for the current date.
      res.data.response.forEach(game => {
        if (game.league.name === "NBA") {
          const game_id     = game.id
          const date        = game.date
          const timestamp   = game.timestamp
          const status      = game.status.short
          const home_team   = game.teams.home.name
          const away_team   = game.teams.away.name
          const home_first  = game.scores.home.quarter_1 || 0
          const home_second = game.scores.home.quarter_2 || 0
          const home_third  = game.scores.home.quarter_3 || 0
          const home_fourth = game.scores.home.quarter_4 || 0
          const away_first  = game.scores.away.quarter_1 || 0
          const away_second = game.scores.away.quarter_2 || 0
          const away_third  = game.scores.away.quarter_3 || 0
          const away_fourth = game.scores.away.quarter_4 || 0
          const home_total  = game.scores.home.total || 0
          const away_total  = game.scores.away.total || 0
          
          db.query(
              `
              INSERT INTO games (
                game_id, date, timestamp, status, home_team,
                away_team, home_first, home_second, home_third,
                home_fourth, away_first, away_second, away_third,
                away_fourth, home_total, away_total
              ) VALUES (
                $1::integer, $2::text, $3::integer, $4::text,
                $5::text, $6::text, $7::integer, $8::integer,
                $9::integer, $10::integer, $11::integer, $12::integer,
                $13::integer, $14::integer, $15::integer, $16::integer
              )`,
               [ game_id, date, timestamp, status,
                 home_team, away_team, home_first, home_second,
                 home_third, home_fourth, away_first, away_second,
                 away_third, away_fourth, home_total, away_total ]
            )
            .then(res => console.log)
            .catch(err => console.log(err))
        }
      })
    })
    // upon the completion of the update, call the games route to trigger the
    // a websocket call.
    .then(res => {
      if (callAPI)
        axios.get("http://localhost:8001/api/games/1")
    })
  })
}
