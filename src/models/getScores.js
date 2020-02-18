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
      // if (res.data.response.length > 0)
        // db.query(`DELETE FROM game_scores WHERE id > 0`)
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

          db.query(
            `
            INSERT INTO game_scores (
              status, home_first, home_second, home_third,
              home_fourth, away_first, away_second, away_third,
              away_fourth, home_total, away_total, game_id
            ) VALUES (
              $1::text, $2::integer, $3::integer, $4::integer,
              $5::integer, $6::integer, $7::integer, $8::integer,
              $9::integer, $10::integer, $11::integer, $12::integer
            ) 
            ON CONFLICT (game_id)
            DO UPDATE SET 
              status = Excluded.status,
              home_first = Excluded.home_first,
              home_second = Excluded.home_second,
              home_third = Excluded.home_third,
              home_fourth = Excluded.home_fourth,
              away_first = Excluded.away_first,
              away_second = Excluded.away_second,
              away_third = Excluded.away_third,
              away_fourth = Excluded.away_fourth,
              home_total = Excluded.home_total,
              away_total = Excluded.away_total

            RETURNING *;
            `, [status, home_first, home_second, home_third,
                home_fourth, away_first, away_second, away_third,
                away_fourth, home_total, away_total, game_id]
          )
          .catch(err => console.log(err))
        }
      })
    })
    // upon the completion of the update, call the games route to trigger the
    // a websocket call.
    .then(res => {
      axios.get("http://localhost:8001/api/scores")
    })
    .catch(err => console.log(err))
  })
}
