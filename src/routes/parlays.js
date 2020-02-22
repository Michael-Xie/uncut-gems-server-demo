const router = require("express").Router();

module.exports = (db, update) => {
  router.put("/parlays/set_active/:id", (request, response) => {
    db.query(
      `
      UPDATE parlays
      SET current_status = $2::status
      WHERE id = $1::integer
      `, [request.params.id, request.body.current_status]
    )
      .then(res => {
        response.send(res.data)
        db.query(`SELECT * FROM parlays`)
          .then(({rows: parlays}) => {
            update({type: 'UPDATE_PARLAYS', parlays})
          })
      })
  })

  router.post("/parlays", (request, response) => {
    db.query(
      `
      INSERT INTO parlays (name, fee, current_status, admin, start_time) 
      VALUES ($1::text, $2::integer, $3::status, $4::integer, $5::integer) RETURNING *
      `, [request.body.name, request.body.fee, 
          request.body.status, request.body.admin,
          request.body.start_time]
    )
    .then(({rows: parlay}) => response.send(parlay))
  })

  router.post("/parlays/bets/fill", (request, response) => {
    db.query(
      `
      INSERT INTO user_bets (selection, parlay_id, bet_id, user_id)
      VALUES ($1::text, $2::integer, $3::integer, $4::TEXT)
      `, [request.body.selection, request.body.parlay_id, request.body.bet_id, request.body.user_id]
    )
    .then(res => {
      response.send(res)
      const result = {}
      db.query(`SELECT * FROM participants`)
        .then(({rows: participants}) => {
          result['participants'] = participants
          db.query(`SELECT * FROM user_bets`)
            .then(({rows: user_bets}) => {
              update({
                type: 'SET_USER_BETS', 
                user_bets,
                participants: result.participants
              })
            })
        })
    })
  })

  router.post("/parlays/bets", (request, response) => {
    db.query(
      `
      INSERT INTO bets (type, parlay_id, game_id)
      VALUES ($1::text, $2::integer, $3::integer) RETURNING *
      `, [request.body.type, request.body.parlay_id, request.body.game_id]
    )
    .then(res => {
      response.send(res)
      const result = {}
      db.query(`SELECT * FROM parlays`)
        .then(({rows: parlays}) => {
          result['parlays'] = parlays
          db.query(`SELECT * FROM bets`)
            .then(({rows: bets}) => {
              update({
                type: 'SET_PARLAYS', 
                parlays: result.parlays,
                bets: bets
              })
            })
        })
    })
  })

  router.post("/parlays/participants", (request, response) => {
    db.query(
      `
      INSERT INTO participants (payout, user_name, parlay_id)
      VALUES ($1::integer, $2::text, $3::integer) RETURNING *
      `, [0, request.body.user_name, request.body.parlay_id]
    )
    .then(res => response.send(res))
    .catch(err => console.log(err))
  })

  return router
}
