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

  router.get("/parlays/:id/game_scores", async (request, response) => {
    let games = await helper.getGamesByParlay(db, request.params.id);
    games = games.rows.map((game) => game.game_id);

    let scores = await helper.getGameScoresByGames(db, games);
    scores = scores.rows;
    response.json(scores);

    // .then(res => {
    //   let games = res.rows;
    //   games = games.map((game) => game.game_id);
    //   return games;
    // })
    // .then((games) => {
    //   return helper.getGameScoresByGames(db, games);
    // })
    // .then((res) => {
    //   response.json(res.rows);
    // })
  })

  router.get("/parlays/:id/participants/ranking", async (request, response) => {
    // let games = await helper.getGamesByParlay(db, request.params.id);
    // games = games.rows.map((game) => game.game_id);

    // let scores = await helper.getGameScoresByGames(db, games);
    // scores = scores.rows;

    // let bets = await helper.getBetsByParlay(db, request.params.id);
    // bets = bets.rows;

    // let user_bets = await helper.getUserBetsByParlay(db, request.params.id);
    // user_bets = user_bets.rows;
    // response.json(user_bets);
    // for (const bet of bets) {
    //   for (const user_bet of user_bets) {

    //   }
    // }
    let userToScores = await helper.getUserBetsGameScoresByParlay(db, request.params.id);
    userToScores = userToScores.rows;
    // response.json(userToScores);

    let userRankByBetType = {};
    for (const userBet of userToScores) {
      let userRank = {}
      // set ranking or intermediate values based on bet type
      if (userBet.type === 'pickem' && userBet.status === 'FT') {
        const actual = userBet.home_total > userBet.away_total ? userBet.home_team : userBet.away_team;
        const expect = userBet.selection;
        userRank = actual === expect ? { user_name: userBet.user_name, rank: 1 } : { user_name: userBet.user_name, rank: 2 };
      } else if (userBet.type === 'points_tf' && userBet.status == 'FT') {
        const actual = userBet.home_total + userBet.away_total;
        const expect = Number(userBet.selection);
        const diff = Math.abs(actual - expect);
        userRank = { user_name: userBet.user_name, intermediate: diff };
      }
      // add to rankings by bet type and game_id
      if (userRankByBetType[userBet.type]) {
        userRankByBetType[userBet.type][userBet.game_id].push(userRank);
      } else {
        userRankByBetType[userBet.type] = {}
        userRankByBetType[userBet.type][userBet.game_id] = [userRank];
      }
    }
    // post-process the ranking for points_tf from diff to rankings
    const betCollection = [];
    for (const betType in userRankByBetType) {
      console.log("bet type", betType);
      for (const game_id in userRankByBetType[betType]) {
        if (betType === 'points_tf') {
          userRankByBetType[betType][game_id] = userRankByBetType[betType][game_id]
          .sort((a, b) => {
            return a.intermediate - b.intermediate;
          })
          .map((user, index) => {
            return {...user, rank: index+1}
          })
        } else if (betType === 'pickem') {
          userRankByBetType[betType][game_id] = userRankByBetType[betType][game_id]
          .sort((a, b) => {
            return a.rank - b.rank;
          })
        } else {
          continue;
        }
        betCollection.push(...userRankByBetType[betType][game_id]);

      }
    }
    // create overall ranking for parlay
    const overallRanking = []
    const userRanking = {}
    for (const bet of betCollection) {
      console.log("bet", bet);
      console.log("bet rank", bet.rank);
      if (userRanking[bet.user_name]) {
        userRanking[bet.user_name] = (userRanking[bet.user_name] + bet.rank)/2
      } else {
        userRanking[bet.user_name] = bet.rank;
      }
    }
    for (const user_name of Object.keys(userRanking)) {
      overallRanking.push({user_name:user_name, rank: userRanking[user_name]})
    }
    overallRanking.sort((a,b) => a.rank - b.rank);
    userRankByBetType['overall_rank'] = overallRanking;

    response.json(userRankByBetType);
    // if (userRankByBetType['points_tf']) {
    //   userRankByBetType['points_tf'].sort((a, b) => {
    //     return a.intermediate - b.intermediate;
    //   })
    // }
    // response.json(userRankByBetType);

  })

  return router
}

// -- pickem
// -- points_tf
// -- points_th
// -- race_to_10
// -- race_to_100