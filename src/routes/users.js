const router = require("express").Router();

module.exports = db => {
  router.get("/users", (request, response) => {
    db.query(
      `
      SELECT * FROM users
      `
    )
    .then(({ rows: users }) => {
      response.json(users)
    })
  })

  router.post("/users", (request, response) => {
    const {user_name, password, wallet_amount, stripe_charge_id} = request.body
    db.query(
      `
      INSERT INTO users (
        user_name, password, wallet_amount, stripe_charge_id
      ) VALUES (
        $1::text, $2::text, $3::integer, $4::integer 
      )
      `, [user_name, password, wallet_amount, stripe_charge_id]
    )
  })

  return router
}
