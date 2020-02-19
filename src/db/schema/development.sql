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

INSERT INTO parlays
(fee, current_status, admin, name)
VALUES
(500, 'close', 3, 'parlay1'),
(1000, 'open', 1, 'parlay2');

INSERT INTO participants
(payout, parlay_id, user_name)
VALUES
(0, 1, 'michaelxie'),
(0, 1, 'anthonypisani'),
(0, 1, 'jamiekaram'),
(0, 2, 'anthonypisani');

-- pickem
-- points_tf
-- points_th
-- race_to_10
-- race_to_100

INSERT INTO bets
(type, parlay_id, game_id)
VALUES
('pickem', 1, 26120),
('points_tf', 1, 26429),
('pickem', 2, 26120);

INSERT INTO user_bets
(selection, user_id, bet_id, parlay_id)
VALUES
('Los Angeles Clippers', 1, 1, 1),
('Houston Rockets', 2, 1, 1),
('Los Angeles Clippers', 3, 1, 1),

(100, 1, 2, 1),
(200, 2, 2, 1),
(300, 3, 2, 1),

('Los Angeles Clippers', 1, 3, 2);
