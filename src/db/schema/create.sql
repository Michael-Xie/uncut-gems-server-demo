DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS winnings CASCADE;
DROP TABLE IF EXISTS parlays CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS bet_types CASCADE;
DROP TABLE IF EXISTS user_bets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS game_scores CASCADE;
DROP TYPE IF EXISTS status CASCADE;

CREATE TABLE users
(
  id SERIAL PRIMARY KEY NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  wallet_amount MONEY,
  password VARCHAR(255) NOT NULL,
  stripe_charge_id TEXT
);

CREATE TYPE status AS ENUM
('open', 'in-progress', 'close');

CREATE TABLE parlays
(
  id SERIAL PRIMARY KEY NOT NULL,
  fee MONEY NOT NULL,
  current_status status NOT NULL
);

CREATE TABLE winnings
(
  id SERIAL PRIMARY KEY NOT NULL,
  payout MONEY NOT NULL,
  parlay_id INTEGER REFERENCES parlays(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_bets
(
  id SERIAL PRIMARY KEY NOT NULL,
  value VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE game_scores (
  id SERIAL PRIMARY KEY NOT NULL,
  status TEXT,
  home_first  SMALLINT NOT NULL,
  home_second SMALLINT NOT NULL,
  home_third  SMALLINT NOT NULL,
  home_fourth SMALLINT NOT NULL,
  away_first  SMALLINT NOT NULL,
  away_second SMALLINT NOT NULL,
  away_third  SMALLINT NOT NULL,
  away_fourth SMALLINT NOT NULL,
  home_total  SMALLINT NOT NULL,
  away_total  SMALLINT NOT NULL,
  game_id     SMALLINT NOT NULL
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY NOT NULL,
  game_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL
);

CREATE table bet_types
(
  id serial primary key not null,
  name varchar(255) not null
);

CREATE TABLE bets
(
  id SERIAL PRIMARY KEY NOT NULL,
  type_id INTEGER REFERENCES bet_types(id) ON DELETE CASCADE,
  parlay_id INTEGER REFERENCES parlays(id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE
);
