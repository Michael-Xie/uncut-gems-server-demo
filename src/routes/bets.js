const router = require("express").Router();

module.exports = (db) => {
  router.get("/bets/:id", (request, response) => {
    db.query(`SELECT * FROM bets`)
      .then(({rows: bets}) => {
        response.send(bets)
      })
  })

  router.post("/bets", (request, response) => {
    db.query(
      `
      INSERT INTO bets (type, parlay_id, game_id) 
      VALUES ($1::text, $2::integer, $3::integer) RETURNING *
      `, [request.body.type, request.body.parlay_id, request.body.game_id]
    )
    .then(({rows: bet}) => {
      response.send(bet)
    })
  })

  return router
}
