const router = require("express").Router();

const getUserWithUsername = function (db, userName) {
  const queryString =
    `
    SELECT * FROM users
    WHERE user_name = $1;
    `;
  const value = [userName];
  return db.query(queryString, value);
}

module.exports = db => {
  router.put("/users/update/:user_name", (request, response) => {
    db.query(
      `
      UPDATE users
      SET wallet_am
      WHERE user_name = $1::text
      `
    )
  })

  router.get("/users", (request, response) => {
    const { user_name, password, wallet_amount, stripe_charge_id } = request.body
    db.query(
      `
      SELECT * FROM users
      `
    )
      .then(({ rows: users }) => {
        response.json(users)
      })
  })



  const login = function (userName, password) {
    return getUserWithUsername(db, userName)
      .then(user => {
        if (password === user.rows[0].password) {
          return user.rows[0];
        }
        return {};
      })
      .catch((err) => console.log(err));
  }
  router.post('/login', (req, res) => {
    const { user_name, password } = req.body;
    login(user_name, password)
      .then( response => {
        res.json(response)
      })
  });


  router.post("/users", (request, response) => {
    const { user_name, password, stripe_charge_id } = request.body
    getUserWithUsername(db, user_name)
    .then((result) => {
      const user = result.rows[0];
      if (!user && password.length > 0) {
        db.query(
          `
          INSERT INTO users (
            user_name, password, stripe_charge_id
          ) VALUES (
            $1::text, $2::text, $3::integer 
          ) RETURNING *
          `, [user_name, password, stripe_charge_id]
        ).then((res) => {
          response.json(res.rows[0]);
        })
      } else {
        response.json({})
      }
    })
    .catch((err) => response.send(err));
  })

  return router
}
