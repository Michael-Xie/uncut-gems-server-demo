module.exports = {
  getUserBetsByParlay: function(db, parlayId) {
    const queryString =
      `
      SELECT * FROM bets
        JOIN user_bets ON bet_id = bets.id

      WHERE user_bets.parlay_id = $1;
      `;
    const values = [parlayId]
    return db.query(queryString, values)
      // .then((res) => res.rows); 
  }
  // getGameInfoByGames: function(db, games) {

  // }
}