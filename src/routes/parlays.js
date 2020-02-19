const router = require("express").Router();

module.exports = (db, update) => {
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

  router.get("/parlays/open", (request, response) => {
    db.query(
      `
      SELECT * 
      FROM parlays
      WHERE current_status = 'open'
      `
    )
      .then(({rows: parlays}) => {
        response.send(parlays)
        update({type: "SET_PARLAY", parlays})
      })
  })

  router.get("/parlays/:name", (request, response) => {
    db.query(
      `
      SELECT * 
      FROM parlays
      WHERE current_status = 'open'
      AND name LIKE $1::text
      `, [request.params.name + '%']
    )
      .then(({rows: parlays}) => {
        response.send(parlays)
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
