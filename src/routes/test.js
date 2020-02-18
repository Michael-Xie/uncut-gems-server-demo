const router = require("express").Router();

module.exports = (db, helper) => {
  router.get("/parlay/:id/bets", (request, response) => {
    console.log("params", request.params);
    
    helper.getUserBetsByParlay(db, request.params.id)
    .then((result) => response.json(result.rows))
  })


  return router
}
