const router = require("express").Router();

module.exports = (db, updateGames) => {
  router.get("/games/:id", (request, response) => {
    db.query(`SELECT * FROM games`)
      .then(({rows: games}) => {
        response.json(games)
        if (request.params.id === '1')
          updateGames({type: "SET_GAMES", games})
      })
  })

  return router
}
