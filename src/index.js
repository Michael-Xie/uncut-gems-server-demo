const PORT = process.env.PORT || 8001;
const ENV = require("./environment");

const app = require("./application")(ENV, { getGames });
const server = require("http").Server(app);

const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

wss.on("connection", socket => {
  socket.onmessage = event => {
    console.log(`Message Received: ${event.data}`);

    if (event.data === "ping") {
      socket.send(JSON.stringify("pong"));
    }
  };
});

/* [TODO] instead of updateAppointment, update the scores on a
 * set interval of 30 seconds.
 */

function getGames() {
  wss.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "SET_GAMES"
        })
      )
    }
  })
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT} in ${ENV} mode.`);
})
