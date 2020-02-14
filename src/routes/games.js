const router = require("express").Router();

module.exports = (db, updateGames) => {
  router.get("/games", (request, response) => {
    db.query(`SELECT * FROM games`)
      .then(({rows: games}) => {
        response.json(games)
        updateGames(games)
      })
  })

  return router
}
