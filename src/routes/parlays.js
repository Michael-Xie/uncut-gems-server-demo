const router = require("express").Router();

module.exports = (db) => {
  router.get("/parlay/:id", (request, response) => {
    db.query(
      `
      SELECT * 
      FROM parlays 
      WHERE id = $1::integer
      `, [request.params.id]
    )
      .then(({rows: parlay}) => {
        response.send(parlay)
      })
  })

  router.get("/parlays", (request, response) => {
    db.query(`SELECT * FROM parlays`)
      .then(({rows: parlays}) => {
        response.send(parlays)
      })
  })

  router.post("/parlay", (request, response) => {
    db.query(
      `
      INSERT INTO parlays (name, fee, current_status, admin) 
      VALUES ($1::text, $2::integer, $3::status, $4::integer) RETURNING *
      `, [request.body.name, request.body.fee, 
          request.body.status, request.body.admin]
    )
    .then(({rows: parlay}) => {
      response.send(parlay)
    })
  })

  return router
}
