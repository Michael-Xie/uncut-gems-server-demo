const getRankings = (db, bets, user_bets, parlays, participants, scores) => {
  const results = {}
  parlays.map(parlay => results[parlay.id] = {})
  const parlays_in_progress = Object.keys(results)
  participants.map(participant => {
    if (parlays_in_progress.includes(`${participant.parlay_id}`)) {
      results[participant.parlay_id][participant.user_name] = [0, 0]
    }
  })
  parlays_in_progress.map(parlay_id_key => {
    parlay_id_key = parseInt(parlay_id_key, 10)
    const user_keys = Object.keys(results[parlay_id_key])
    bets.map(bet => {
      if (bet.parlay_id === parlay_id_key) {
        const score = scores.filter(score => {
          if (score.game_id === bet.game_id) return score
        })[0]
        // iterate over bets and determine the score.
        if (bet.type === 'pickem') {
          // check who is in front.
          const difference = score.home_total - score.away_total
          let lead;
          if (difference > 0)  lead = 'home'
          else if (difference) lead = 'away'
          else                 lead = 'none'
          // check the user_bets
          user_bets.map(user_bet => {
            if (user_keys.includes(user_bet.user_id)) {
              if (user_bet.selection === lead &&
                  user_bet.bet_id    === bet.id) {
                if (results[parlay_id_key][user_bet.user_id])
                  results[parlay_id_key][user_bet.user_id][0] += 50
              }
            }
          })
        } else if (bet.type === 'points_tf') {
          // filter scores and calculate total.
          const total = score.home_total + score.away_total
          // allocate points based on le division
          let number;
          user_bets.map(user_bet => {
            if (user_keys.includes(user_bet.user_id)) {
              if (user_bet.selection > 0 && user_bet.bet_id === bet.id) {
                if (user_bet.selection - total === 0)
                  number = 500
                else
                  number = parseInt(500 / Math.abs(user_bet.selection - total), 10)
                results[parlay_id_key][user_bet.user_id][0] += number
              }
            }
          })
        } else if (bet.type === 'points_th') {
          const total = score.home_first + score.home_second +
                        score.away_first + score.away_second
          let number;
          user_bets.map(user_bet => {
            if (user_keys.includes(user_bet.user_id)) {
              if (user_bet.selection > 0 && user_bet.bet_id === bet.id) {
                if (user_bet.selection - total === 0)
                  number = 350
                else
                  number = parseInt(350 / Math.abs(user_bet.selection - total), 10)
                results[parlay_id_key][user_bet.user_id][0] += number
               }
            }
          })
        }
      }
    })
    // rank order the users.
    const scoring = {}
    for (let key of user_keys) {
      scoring[key] = results[parlay_id_key][key][0]
    }
    const order = Object.keys(scoring).sort((a, b) => scoring[b] - scoring[a])
    const obj = {}
    // orderKeys --> 0, 1, 2
    // orderVales --> anthony, jamie
    let prev = -1
    let curr = 0
    for (let key in order) {
      const prevScore = scoring[order[prevKey]]
      const currScore = scoring[order[currKey]]
      if (curr > 0 && prevScore === currScore) {
        obj[prev].push({ order[prev]: results[parlay_id_key][order][key]})
        curr++
      } else {
        obj[curr] = [ { [order[curr]]: results[parlay_id_key][order[key]] } ]
        prev++
        curr++
      }
    }
    const winnings = (participants) => {
      const split = (key) => {
        if (obj[key])
          return obj[key].length
        return 1
      }
      if (participants <= 5) {
        return [100 / split(1)]
      } else if (participants <= 10) {
        if      (split(1) > 1)   return [100 / split(1)]
        else if (split(2) > 1)   return [80, 20 / split(2)]
        else                     return [80, 20]
      } else {
        if      (split(1) === 3) return [33]
        else if (split(2) === 2 &&
                 split(2) === 1) return [35, 30]
        else if (split(1) === 2 &&
                 split(2) > 1)   return [35, 30 / split(2)]
        else if (split(1) === 1 &&
                 split(2) === 2) return [70, 15]
        else if (split(1) === 1 &&
                 split(2) > 2)   return [70, 30 / split(2)]
        else if (split(1) === 1 &&
                 split(2) === 1) return [70, 20, 10 / split(3)]
        else                     return [70, 20, 10]
      }
    }
    // get winnings
    const money = {}
    user_keys.forEach(name => {
      const value = winnings(user_keys.length)
      const fee   = parlays.filter(parlay => parlay.id === parlay_id_key)
                           .map(parlay => parlay.fee)[0]
      for (let index in value) {
        if (obj[parseInt(index) + 1].length > 1) {
          for (let i = 0; i < obj[parseInt(index) + 1].length; i++) {
            if (Object.keys(obj[parseInt(index) + 1][i]).includes(name)) {
              obj[parseInt(index) + 1][i][name][1] = (50 / 100) * fee * user_keys.length
              const values = [...obj[parseInt(index) + 1][i][name]]
              money[name] = values[1]
              db.query(
                `
                UPDATE participants
                SET payout = $1::integer, points = $2::integer
                WHERE parlay_id = $3::integer
                AND user_name = $4::text
                `, [values[1], values[0], parlay_id_key, name]
              )
            }
          }
        } else {
          if (obj[parseInt(index) + 1][0][name]) {
            obj[parseInt(index) + 1][0][name][1] = (value / 100) * fee * user_keys.length
            const values = obj[parseInt(index) + 1][0][name]
            money[name] = values[1]
            db.query(
              `
              UPDATE participants
              SET payout = $1::integer, points = $2::integer
              WHERE parlay_id = $3::integer
              AND user_name = $4::text
              `, [values[1], values[0], parlay_id_key, name]
            )
          }
        }
      }
    })
    results[parlay_id_key] = obj
    // get parlay and check status.
    const thisParlay = parlays.filter(parlay => parlay.id === parlay_id_key)[0].current_status
    // check if we can close the parlay.
    if (thisParlay !== 'close') {
      const id = bets.map(bet => {
        if (bet.parlay_id === parlay_id_key)
          return bet.game_id
      })
      const ss = scores.filter(score => {
        if (id.includes(score.game_id)) return score
      })
      const sl = ss.filter(score => score.status === 'FT' || score.status === 'AOT')
                   .map(score => score.status)
      if (ss.length === sl.length) {
        // update parlay status
        db.query(
          `
          UPDATE parlays
          SET current_status = 'close'
          WHERE id = $1::integer
          `, [parlay_id_key]
        )
        // update user wallets with winnings
        user_keys.map(name => {
          let value;
          if (!money[name]) value = 0
          else              value = money[name]
          db.query(
            `
            UPDATE users
            SET wallet_amount = wallet_amount + $1::integer
            WHERE user_name = $2::text
            `, [value, name]
          )
        })
      }
    }
  })
  // return -> rankings => {parlay_id: {user1: __, user2: __, user3: __}
  return results
}
module.exports = getRankings
