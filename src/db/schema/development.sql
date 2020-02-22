INSERT INTO users
  (user_name, password, wallet_amount)
VALUES
  ('anthonypisani', '123', 10000),
  ('jamiekaram', '123', 10000),
  ('michaelxie', '123', 10000);

INSERT INTO games
  (game_id, status, date, timestamp, home_team, away_team)
VALUES
  (26120, 'FT', '2015-11-08T03:30:00+00:00', 1446953400, 'Los Angeles Clippers', 'Houston Rockets'),
  (26429, 'FT', '2015-12-20T01:00:00+00:00', 1450573200, 'Atlanta Hawks', 'Boston Celtics'),
  (5555,  'Q1', '2019-11-26T06:35:00-05:00', 1574768100, 'Cleveland Cavaliers', 'Dallas Mavericks');

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
  ('FT', 10, 20, 30, 50, 10, 20, 30, 40, 110, 100, 26429),
  ('Q1', 9, 0, 0, 0, 10, 0, 0, 0, 9, 10, 5555);

INSERT INTO parlays
(fee, current_status, admin, name, start_time)
VALUES
(500, 'close', 3, 'parlay1', 1446953400),
(1000, 'open', 1, 'parlay2', 1582329600);

INSERT INTO participants
(payout, parlay_id, user_name)
VALUES
(0, 1, 'michaelxie'),
(0, 1, 'anthonypisani'),
(0, 1, 'jamiekaram'),

(0, 2, 'anthonypisani'),
(0, 2, 'jamiekaram');

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
('race_to_10', 1, 5555),

('pickem', 2, 26120),
('points_th', 2, 5555);

INSERT INTO user_bets
(selection, user_id, bet_id, parlay_id)
VALUES
('home', 'anthonypisani', 1, 1),
('away', 'jamiekaram', 1, 1),
('home', 'michaexie', 1, 1),

(100, 'anthonypisani', 2, 1),
(200, 'jamiekaram', 2, 1),
(300, 'michaelxie', 2, 1),

('home', 'anthonypisani', 3, 1),
('away', 'jamiekaram', 3, 1),
('home', 'michaelxie', 3, 1),

('home', 'anthonypisani', 4, 2),
('away', 'jamiekaram', 4, 2),
(200, 'anthonypisani', 5, 2),
(300, 'jamiekaram', 5, 2);
