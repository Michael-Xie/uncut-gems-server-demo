const router   = require("express").Router();
const rankings = require("./../models/getRankings")

module.exports = (db, update) => {
  router.get("/global/:id", (request, response) => {
    const result = {}
    db.query(`SELECT * FROM games`)
      .then(({rows: games}) => {
        result['games'] = [...games]
        db.query(`SELECT * FROM game_scores`)
          .then(({rows: scores}) => {
            result['scores'] = [...scores]
            db.query(`SELECT * FROM parlays`)
              .then(({rows: parlays}) => {
                result['parlays'] = [...parlays]
                db.query(`SELECT * FROM participants`)
                  .then(({rows: participants}) => {
                    result['participants'] = [...participants]
                      db.query(`SELECT * FROM users`)
                        .then(({rows: users}) => {
                          result['users'] = [...users]
                          db.query(`SELECT * FROM bets`)
                            .then(({rows: bets}) => {
                              result['bets'] = [...bets]
                              db.query(`SELECT * FROM user_bets`)
                                .then(({rows: user_bets}) => {
                                  result['user_bets'] = [...user_bets]
                                  // call here.
                                  result['rankings'] = rankings(db, bets, user_bets, parlays, participants, scores)
                                  response.send({...result})
                                  if (request.params.id === '1')
                                    update({
                                      type: 'GLOBAL_UPDATE',
                                      games: result.games,
                                      scores: result.scores,
                                      parlays: result.parlays,
                                      participants: result.participants,
                                      bets: result.bets,
                                      users: result.users,
                                      user_bets: result.user_bets,
                                      rankings: result.rankings
                                  })
                              })
                          })
                      })
                  })
              })
          })
      })
  })

  return router
}
