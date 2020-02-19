const router = require("express").Router();

module.exports = (db, updateState) => {
  router.get("/games/:id", (request, response) => {
    db.query(`SELECT * FROM games`)
      .then(({rows: games}) => {
        response.json(games)
        if (request.params.id === '1')
          updateState({type: "SET_GAMES", games})
      })
  })

  return router
}
