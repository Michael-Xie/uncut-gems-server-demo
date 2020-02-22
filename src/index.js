const PORT = process.env.PORT || 8001;
const ENV = require("./environment");

const app = require("./application")(ENV, { updateState });
const server = require("http").Server(app);

const WebSocket = require("ws");
const ws = new WebSocket.Server({ server });

ws.on("connection", socket => {
  socket.onmessage = event => {
    console.log(`Message Received: ${event.data}`);

    if (event.data === "ping") {
      socket.send(JSON.stringify("pong"));
    }
  };
});

function updateState(data) {
  ws.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      if (data.type === "GLOBAL_UPDATE") {
        const result = data
        client.send(
          JSON.stringify({
            type: "GLOBAL_UPDATE",
            games: result.games,
            scores: result.scores,
            parlays: result.parlays,
            participants: result.participants,
            bets: result.bets,
            user_bets: result.user_bets
          })
        )
      }

      if (data.type === 'SET_GAMES') {
        const games = data.games
        client.send(
          JSON.stringify({
            type: "SET_GAMES",
            games
          })
        ) 
      }

      if (data.type === 'SET_PARLAYS') {
        const parlays = data.parlays
        const bets    = data.bets
        client.send(
          JSON.stringify({
            type: "SET_PARLAYS",
            parlays,
            bets
          })
        )
      }

      if (data.type === 'UPDATE_PARLAYS') {
        const parlays = data.parlays
        client.send(
          JSON.stringify({
            type: "UPDATE_PARLAYS",
            parlays
          })
        )
      }

      if (data.type === 'SET_USER_BETS') {
        const user_bets = data.user_bets
        const participants = data.participants
        client.send(
          JSON.stringify({
            type: "SET_USER_BETS",
            user_bets,
            participants
          })
        )
      }
    }
  })
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT} in ${ENV} mode.`);
})
