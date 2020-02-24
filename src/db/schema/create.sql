DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS parlays CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS bet_types CASCADE;
DROP TABLE IF EXISTS user_bets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS game_scores CASCADE;
DROP TABLE IF EXISTS participants;
DROP TYPE IF EXISTS status CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  user_name VARCHAR(255) UNIQUE NOT NULL,
  user_photo TEXT DEFAULT 'https://i.imgur.com/pYla8hh.png',
  wallet_amount INTEGER DEFAULT 20000,
  password VARCHAR(255) NOT NULL,
  stripe_charge_id TEXT
);

CREATE TYPE status AS ENUM
('open', 'in-progress', 'close');

CREATE TABLE parlays (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  fee INTEGER NOT NULL,
  current_status status NOT NULL,
  start_time INTEGER NOT NULL,
  admin INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE participants (
  id SERIAL PRIMARY KEY NOT NULL,
  points INTEGER,
  payout INTEGER NOT NULL,
  parlay_id INTEGER REFERENCES parlays(id) ON DELETE CASCADE,
  user_name TEXT REFERENCES users(user_name) ON DELETE CASCADE
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
  game_id     INTEGER UNIQUE NOT NULL
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY NOT NULL,
  status TEXT,
  game_id INTEGER UNIQUE NOT NULL,
  date TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL
);

CREATE TABLE bets (
  id SERIAL PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  parlay_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL
);

CREATE TABLE user_bets (
  id SERIAL PRIMARY KEY NOT NULL,
  selection VARCHAR(255) NOT NULL,
  bet_id INTEGER REFERENCES bets(id) ON DELETE CASCADE,
  parlay_id INTEGER REFERENCES parlays(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL
);
