module.exports = {
  getUserBetsByParlay: function(db, parlayId) {
    const queryString =
      `
      SELECT * FROM user_bets
      WHERE user_bets.parlay_id = $1;
      `;
    const values = [parlayId]
    return db.query(queryString, values)
  },
  getBetsByParlay: function(db, parlayId) {
    const queryString =
    `
    SELECT * FROM bets
    WHERE parlay_id = $1;
    `
    const values = [parlayId]
    return db.query(queryString, values);
  },
  getGamesByParlay: function(db, parlayId) {
    const queryString = 
    `
    SELECT game_id FROM parlays
    JOIN bets ON parlay_id = parlays.id
    WHERE parlay_id = $1;
    `
    const values = [parlayId];
    return db.query(queryString, values);
  },
  getGameScoresByGames: function(db, games) {
    let queryString =
    `
    SELECT * FROM games
    JOIN game_scores ON games.game_id=game_scores.game_id
    WHERE
    `
    let condition = games.map((game, index)=>{
       return `games.game_id=$${index+1}`
    }).join(' OR ');
    queryString += condition;
    const values = [...games]
    return db.query(queryString, values);
  },
  getUserBetsGameScoresByParlay: function(db, parlayId) {
    let queryString = 
    `
    SELECT * FROM user_bets
    JOIN bets ON bets.id = bet_id
    JOIN parlays ON parlays.id = bets.parlay_id
    JOIN games ON games.game_id = bets.game_id
    JOIN game_scores ON games.game_id = game_scores.game_id
    JOIN users ON user_bets.user_id = users.id
    WHERE parlays.id = $1;
    `
    const values = [parlayId];
    return db.query(queryString, values);

  }
}
