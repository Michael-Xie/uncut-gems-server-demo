const router = require("express").Router();

module.exports = (db) => {
  router.get("/bet/user/:id", (request, response) => {
    db.query(
      `
      SELECT * 
      FROM bets
      WHERE parlay_id = $1::integer
      `, [request.params.id]
    )
      .then(({rows: bets}) => {
        response.send(bets)
      })
  })

  router.get("/bet/fill/:id", (request, response) => {
    db.query(
      `
      SELECT * 
      FROM user_bets
      WHERE user_id = $1::integer
      `, [request.params.id]
    )
      .then(({rows: bets}) => {
        response.send(bets)
      })
  })

  router.get("/bet/:id", (request, response) => {
    db.query(
      `
      SELECT * 
      FROM bets
      WHERE parlay_id = $1::integer
      `, [request.params.id]
    )
      .then(({rows: bets}) => {
        response.send(bets)
      })
  })

  router.get("/bets", (request, response) => {
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
