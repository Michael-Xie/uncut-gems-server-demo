const router = require("express").Router();

module.exports = (db) => {
  router.get("/:id/participants/:user_name", (request, response) => {
    db.query(
      `SELECT * 
       FROM participants
       WHERE user_name = $1::text
       AND parlay_id = $2::integer
      `, [request.params.user_name, request.params.id]
    )
      .then(({rows: user_parlays}) => {
        response.send(user_parlays)
      })
  })

  router.get("/:id/participants", (request, response) => {
    db.query(
      `SELECT * 
       FROM participants 
       WHERE parlay_id = $1::integer
      `, [request.params.id]
    )
      .then(({rows: participants}) => {
        response.send(participants)
      })
  })

  router.post("/:id/participants", (request, response) => {
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
