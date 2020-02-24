const axios = require("axios")

module.exports = (dates, db, update) => {
  // delete all data currently in the games table.
  // if (update) {
  //   db.query(`DELETE FROM games WHERE games.id > 0`)
  //   db.query(`DELETE FROM game_scores WHERE game_scores.id > 0`)
  // }
  // ---------------------------------------------
  dates.map(date => {
    const useMock = false; //switch for using mock server
    let url = `https://api-basketball.p.rapidapi.com/games?date=${date}`

    if (useMock) {
      console.log('using mock server url for getGames');
      url = `http://localhost:8003/mock_data`
    }

    axios(url, {
      "method": "GET"
      ,
      "headers": {
        "x-rapidapi-host": "api-basketball.p.rapidapi.com",
        "x-rapidapi-key": "d8dfc5cbfdmshbb0b69d2a790b3dp1ba90ejsn8f36ab430b8b"
      }
    })
      .then(res => {
        // get all the games for the current date.
        res.data.response.forEach(game => {
          if (game.league.name === "NBA") {
            const game_id = game.id
            const date = game.date
            const timestamp = game.timestamp
            const status = game.status.short
            const home_team = game.teams.home.name
            const away_team = game.teams.away.name
            const home_first = game.scores.home.quarter_1 || 0
            const home_second = game.scores.home.quarter_2 || 0
            const home_third = game.scores.home.quarter_3 || 0
            const home_fourth = game.scores.home.quarter_4 || 0
            const away_first = game.scores.away.quarter_1 || 0
            const away_second = game.scores.away.quarter_2 || 0
            const away_third = game.scores.away.quarter_3 || 0
            const away_fourth = game.scores.away.quarter_4 || 0
            const home_total = game.scores.home.total || 0
            const away_total = game.scores.away.total || 0
            if (game_id) {
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
              );
              db.query(
                `
              INSERT INTO games (
                game_id, date, timestamp, home_team, away_team, status
              ) VALUES (
                $1::integer, $2::text, $3::integer, $4::text, $5::text, $6::text
              )
              ON CONFLICT (game_id)
              DO UPDATE SET
                status = Excluded.status
              `, [game_id, date, timestamp, home_team, away_team, status]
              )
                .catch(err => console.log(err))
            }
          }
        })
      })
      // upon the completion of the update, 
      // call the games route to trigger the websocket call.
      .then(() => {
        if (update) {
          setTimeout(() => {
            axios.get("http://localhost:8001/api/games/1")
          }, 1000)
        }
      })
      .catch(err => console.log("ERROR in getGames: ", err))
  })
}
