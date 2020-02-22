module.exports = {
  addToWallet: function(db, user_id, money) {
    const queryString =
    `
    UPDATE users
    SET wallet_amount = wallet_amount + $2::integer
    WHERE id = $1::integer
    RETURNING *;
    `;
    const values = [user_id, money];
    return db.query(queryString, values).then((result) => console.log(result.rows));
  }
}
