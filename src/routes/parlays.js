const router = require("express").Router();

module.exports = (db) => {
  router.get("/parlays/:id", (request, response) => {
    db.query(`SELECT * FROM parlays`)
      .then(({rows: parlays}) => {
        response.send(parlays)
      })
  })

  router.post("/parlays", (request, response) => {
    db.query(
      `
      INSERT INTO parlays (fee, current_status) 
      VALUES ($1::integer, $2::status) RETURNING *
      `, [request.body.fee, request.body.status]
    )
    .then(({rows: parlay}) => {
      response.send(parlay)
    })
  })

  return router
}
