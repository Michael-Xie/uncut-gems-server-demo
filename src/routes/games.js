const router = require("express").Router();

module.exports = (db, update) => {
  router.get("/games/:id", (request, response) => {
    db.query(`SELECT * FROM games`)
      .then(({rows: games}) => {
        response.json(games)
        if (request.params.id === '1')
          update({type: 'SET_GAMES', games})
      })
  })

  return router
}
