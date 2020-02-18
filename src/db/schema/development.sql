INSERT INTO users
  (user_name, password)
VALUES
  ('anthonypisani', '123'),
  ('jamiekaram', '123'),
  ('michaelxie', '123');

INSERT INTO games
  (game_id, date, timestamp, home_team, away_team)
VALUES
  (26120, '2015-11-08T03:30:00+00:00', 1446953400, 'Los Angeles Clippers', 'Houston Rockets'),
  (26429, '2015-12-20T01:00:00+00:00', 1450573200, 'Atlanta Hawks', 'Boston Celtics');

INSERT INTO game_scores
  ( status,
  home_first ,
  home_second,
  home_third ,
  home_fourth,
  away_first ,
  away_second,
  away_third ,
  away_fourth,
  home_total ,
  away_total ,
  game_id
  )
VALUES
  ('FT', 10, 20, 30, 40, 10, 20, 30, 50, 100, 110, 26120),
  ('FT', 10, 20, 30, 50, 10, 20, 30, 40, 110, 100, 26429);


INSERT INTO participants
(payout, parlay_id, user_name)
VALUES
(0, 1, 'michaelxie'),
(0, 1, 'anthonypisani'),
(0, 1, 'jamiekaram'),
(0, 2, 'anthonypisani');

INSERT INTO parlays
(id, fee, current_status)
VALUES
(1, 5, 'close'),
(2, 10, 'open');


-- pickem
-- points_tf
-- points_th
-- race_to_10
-- race_to_100

INSERT INTO bets
(id, type, parlay_id, game_id)
VALUES
(1, 'pickem', 1, 26120),
(2, 'points_tf', 1, 26429),
(3, 'pickem', 2, 26120);

INSERT INTO user_bets
(value, user_id, bet_id)
VALUES
('Los Angeles Clippers', 1, 1),
('Houston Rockets', 2, 1),
('Los Angeles Clippers', 3, 1),

(100, 1, 2),
(200, 2, 2),
(300, 3, 2),

('Los Angeles Clippers', 3, 3);


-- CREATE TABLE user_bets (
--   id SERIAL PRIMARY KEY NOT NULL,
--   value VARCHAR(255) NOT NULL,
--   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
--   bet_id INTEGER REFERENCES bets(id) ON DELETE CASCADE,
-- );

-- CREATE TABLE bets (
--   id SERIAL PRIMARY KEY NOT NULL,
--   type TEXT NOT NULL,
--   parlay_id INTEGER NOT NULL,
--   game_id INTEGER NOT NULL
-- );

-- CREATE TABLE parlays (
--   id SERIAL PRIMARY KEY NOT NULL,
--   fee INTEGER NOT NULL,
--   current_status status NOT NULL
-- );

-- CREATE TABLE participants (
--   id SERIAL PRIMARY KEY NOT NULL,
--   payout INTEGER NOT NULL,
--   parlay_id INTEGER REFERENCES parlays(id) ON DELETE CASCADE,
--   user_name TEXT REFERENCES users(user_name) ON DELETE CASCADE
-- );

