const PORT = process.env.PORT || 8001;
const ENV = require("./environment");

const app = require("./application")(ENV, { updateGames });
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

function updateGames(data) {
  ws.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      if (data.type === "SET_GAMES") {
        const games = data.games
        client.send(
          JSON.stringify({
            type: "SET_GAMES",
            games
          })
        )
      }
      if (data.type === "SET_SCORES") {
        const scores = data.scores
        client.send(
          JSON.stringify({
            type: "SET_SCORES",
            scores
          })
        )
      }
    }
  })
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT} in ${ENV} mode.`);
})
