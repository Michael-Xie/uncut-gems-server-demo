const router = require("express").Router();

module.exports = (db, helper) => {
  router.get("/parlays/:id/bets", (request, response) => {
    helper.getBetsByParlay(db, request.params.id)
      .then((result) => response.json(result.rows))
  })

  router.get("/parlays/:id/user_bets", (request, response) => {
    helper.getUserBetsByParlay(db, request.params.id)
      .then((result) => response.json(result.rows))

  })

  router.get("/parlays/:id/game_scores", (request, response) => {
    helper.getGamesByParlay(db, request.params.id)
    .then(res => {
      let games = res.rows;
      games = games.map((game) => game.game_id);
      return games;
    })
    .then((games) => {
      return helper.getGameScoresByGames(db, games);
    })
    .then((res) => {
      response.json(res.rows);
    })
  }) 

  return router
}
