const router = require("express").Router();

module.exports = (db) => {
  router.get("/participants", (request, response) => {
    db.query(`SELECT * FROM participants`)
      .then(({rows: participants}) => {
        response.send(participants)
      })
  })

  router.post("/participants", (request, response) => {
    db.query(
      `
      INSERT INTO participants (payout, user_name, parlay_id) 
      VALUES ($1::integer, $2::text, $3::integer) RETURNING *
      `, [0, request.body.user_name, request.body.parlay_id]
    )
    .then(({rows: participant}) => {
      response.send(participant)
    })
  })

  return router
}
