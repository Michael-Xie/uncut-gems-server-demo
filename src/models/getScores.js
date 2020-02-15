const axios = require("axios")

module.exports = (dates, db) => {
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
          const status      = game.status.short
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

          db.query(`SELECT * FROM games`)
            .then(result => {
              result.rows.forEach(row => {
                const id = row.id
                db.query(
                  `
                  UPDATE game_scores SET 
                    status      = $1::text,
                    home_first  = $2::integer,
                    home_second = $3::integer,
                    home_third  = $4::integer,
                    home_fourth = $5::integer,
                    away_first  = $6::integer,
                    away_second = $7::integer,
                    away_third  = $8::integer,
                    away_fourth = $9::integer,
                    home_total  = $10::integer,
                    away_total  = $11::integer
                  WHERE id = $12::integer
                  `
                , [status, home_first, home_second, home_third,
                   home_fourth, away_first, away_second, away_third,
                   away_fourth, home_total, away_total, id]
                )
                .catch(err => console.log(err))
              })
            })
        }
      })
    })
    // upon the completion of the update, call the games route to trigger the
    // a websocket call.
    .then(res => {
      axios.get("http://localhost:8001/api/scores")
    })
  })
}
