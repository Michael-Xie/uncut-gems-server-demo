const axios = require("axios")

module.exports = (dates, db) => {
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
        }
      })
    }) 
  })
}
