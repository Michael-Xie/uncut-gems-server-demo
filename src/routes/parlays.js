const router = require("express").Router();

module.exports = (db) => {
  router.get("/parlays/:id", (request, response) => {
    db.query(`SELECT * FROM parlays`)
      .then(({rows: parlays}) => {
        response.send(parlays)
      })
  })

  router.post("/parlays", (request, response) => {
    console.log(request.body)
    db.query(
      `
      INSERT INTO parlays (fee, current_status) 
      VALUES ($1::integer, $2::status)
      `, [request.body.fee, request.body.status]
    )
  })

  return router
}
