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

function updateGames(games) {
  ws.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "SET_GAMES",
          games
        })
      )
    }
  })
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT} in ${ENV} mode.`);
})
