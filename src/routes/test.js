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
    let userToScores = await helper.getUserBetsGameScoresByParlay(db, request.params.id);
    userToScores = userToScores.rows;

    let userRankByBetType = {};
    for (const userBet of userToScores) {
      let userRank = {}
      // set ranking or intermediate values based on bet type
      if (userBet.type === 'pickem' && userBet.status === 'FT') {
        const actual = userBet.home_total > userBet.away_total ? userBet.home_team : userBet.away_team;
        const expect = userBet.selection;
        userRank = actual === expect ? { user_name: userBet.user_name, rank: 1} : { user_name: userBet.user_name, rank: 2 };
      } else if (userBet.type === 'points_tf' && userBet.status == 'FT') {
        const actual = userBet.home_total + userBet.away_total;
        const expect = Number(userBet.selection);
        const diff = Math.abs(actual - expect);
        userRank = { user_name: userBet.user_name, intermediate: diff };
      } else if (userBet.type === 'points_hf' && userBet.status == 'HT') {
        const actual = userBet.home_total + userBet.away_total;
        const expect = Number(userBet.selection);
        const diff = Math.abs(actual - expect);
        userRank = { user_name: userBet.user_name, intermediate: diff };
      } else if (userBet.type === 'race_to_100' && (userBet.home_total >= 100 || userBet.away_total >= 100)) {
        const actual = userBet.home_total > userBet.away_total? userBet.home_team: userBet.away_team;
        const expect = userBet.selection;
        userRank = actual === expect ? { user_name: userBet.user_name, rank: 1 } : { user_name: userBet.user_name, rank: 2 };
      } else if (userBet.type === 'race_to_10' && (userBet.home_total >= 10 || userBet.away_total >= 10)) {
        const actual = userBet.home_total > userBet.away_total? userBet.home_team: userBet.away_team;
        const expect = userBet.selection;
        userRank = actual === expect ? { user_name: userBet.user_name, rank: 1 } : { user_name: userBet.user_name, rank: 2 };
      } else {
        continue;
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
      for (const game_id in userRankByBetType[betType]) {
        if (betType === 'points_tf' || betType === 'points_th') {
          userRankByBetType[betType][game_id] = userRankByBetType[betType][game_id]
            .sort((a, b) => {
              return a.intermediate - b.intermediate;
            })
            .map((user, index) => {
              return { ...user, rank: index + 1 }
            })
        } else if (betType === 'pickem' || betType === 'race_to_10' || betType === 'race_to_100') {
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
      if (userRanking[bet.user_name]) {
        userRanking[bet.user_name].push(bet.rank);
      } else {
        userRanking[bet.user_name] = [bet.rank];
      }
    }
    for (const user_name of Object.keys(userRanking)) {
      overallRanking.push({ user_name: user_name, rank: userRanking[user_name].reduce((acc, curr) => acc+curr, 0)/userRanking[user_name].length })
    }
    overallRanking.sort((a, b) => a.rank - b.rank);
    userRankByBetType['overall_rank'] = overallRanking;

    response.json({ userToScores, userRankByBetType });
  })

  return router
}

// -- pickem
// -- points_tf
// -- points_th
// -- race_to_10
// -- race_to_100