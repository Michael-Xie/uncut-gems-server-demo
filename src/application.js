// ---------- imports -----------------------
const fs   = require("fs")
const path = require("path")

const express    = require("express")
const bodyparser = require("body-parser")
const helmet     = require("helmet")
const cors       = require("cors")

const app = express();

const globalRoute = require("./routes/global")
const gameRoute   = require("./routes/games")
const scoreRoute  = require("./routes/scores")
const userRoute   = require("./routes/users")
const parlayRoute = require("./routes/parlays")
const testRoute = require("./routes/test");
const payRoute = require("./routes/pay");

const getGames   = require("./models/getGames")
const getScores  = require("./models/getScores")
const betsHelper = require("./models/bets")
const moneyHelper = require("./models/money");

const axios = require("axios")
const moment = require('moment');

const db = require("./db")

// -------------------------------------------

function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      file,
      {
        encoding: "utf-8"
      },
      (error, data) => {
        if (error) return reject(error);
        resolve(data);
      }
    );
  });
}

/*
Switching between mock and rapidapi servers:
- Go to getGames and getScores and set useMock to false to use rapidapi and vice versa

Heroku:
- https://uncut-gems-server-demo.herokuapp.com/
- `npm install -g heroku`

- Changes can be pushed by:
`git push heroku master`

- Can pause the server by:
`heroku maintenance:on`

- Then turn it back on:
`heroku maintenance:off`

- To access the database: 
`

postgres://siepqxkelzqgig:3f0559caa4d1ea80bfbe55868f938f6de8e884c2fbac9323c1421d3c62208ddf@ec2-34-192-30-15.compute-1.amazonaws.com:5432/dc7v3nldbjjgps
psql -h ec2-34-192-30-15.compute-1.amazonaws.com -p 5432 -U siepqxkelzqgig -d dc7v3nldbjjgps`

postgres://qcxscfubhxnste:b8cef78bbce06d7d8ec7291f797aa7117b702a75666c466f8ad6a7bc2b176e1c@ec2-3-234-169-147.compute-1.amazonaws.com:5432/d814rin7atpl5i
psql -h ec2-3-234-169-147.compute-1.amazonaws.com -p 5432 -U qcxscfubhxnste -d d814rin7atpl5i`


psql -h ec2-52-203-160-194.compute-1.amazonaws.com -p 5432 -U oawnanurcputti -d dcpo3e97vattid`
password in heroku > Settings > Reveal Config Vars > DATABASE_URL : select password portion
<username>:<password>@<host>:<port>/<database>
  - can use to recreate and reseed db
*/

module.exports = function application(ENV, actions = { updateState: () => {}}) {
 

  app.use(cors())
  app.use(helmet())
  app.use(bodyparser.json())

  // app.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin')
  // })
  let today = moment().toISOString(true).split('T')[0];
  let tomorrow = moment().add(1, 'days').toISOString(true).split('T')[0];

  let date = [today, tomorrow]
  getGames(date, db, true)
  axios.get(`/api/global/1`, {baseURL: 'https://uncut-gems-server-demo.herokuapp.com'})
    .catch(err => console.log(err))

  setInterval(() => {
    getScores(date, db)
    axios.get(`/api/global/1`, {baseURL: 'https://uncut-gems-server-demo.herokuapp.com'})
      .catch(err => console.log(err))
  }, 15000);
  
  setInterval(() => {
    getGames(date, db, true)
  }, 30000);
  
  app.use("/api/pay", payRoute(db, moneyHelper));
  app.use("/api/test", testRoute(db, betsHelper))
  app.use("/api", gameRoute(db, actions.updateState))
  app.use("/api", scoreRoute(db, actions.updateState))
  app.use("/api", userRoute(db))
  app.use("/api", globalRoute(db, actions.updateState))
  app.use("/api", parlayRoute(db, actions.updateState))

  if (ENV === "production" || ENV === "development" || ENV === "test") {
    Promise.all([
      read(path.resolve(__dirname, `db/schema/create.sql`)),
      read(path.resolve(__dirname, `db/schema/${ENV}.sql`))
    ])
      .then(([create, seed]) => {
        app.get('/api/debug/reset', (request, response) => {
          db.query(create)
            .then(() => db.query(seed))
            .then(() => {
              console.log("Database Reset");
              response.status(200).send("Database Reset")
            })
        })
      })
      .catch(error => {
        console.log(`Error setting up the reset route: ${error}`)
      })
  }

  app.close = function() {
    return db.end()
  };

  return app;
};
