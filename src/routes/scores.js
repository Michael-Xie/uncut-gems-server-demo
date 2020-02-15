const router = require("express").Router();

module.exports = (db, updateGames) => {
  router.get("/scores", (request, response) => {
    db.query(`SELECT * FROM game_scores`)
      .then(({rows: scores}) => {
        response.json(scores)
        updateGames({type: "SET_SCORES", scores})
      })
  })

  return router
}
