const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const redis = require("redis");
const redisClient = redis.createClient();
app.set("view engine", "ejs");
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });
const PORT = 3000;

function sendMessages(socket) {
  redisClient.lRange("messages", "0", "-1", (err, data) => {
    console.log(data);
    data.map((item) => {
      const [username, message] = item.split(":");
      socket.emit("message", {
        username,
        message,
      });
    });
  });
}

io.on("connection", (socket) => {
  const redisMulti = redisClient.multi();
  socket.on("message", ({ username, message }) => {
    redisMulti.rPush("messages", `${username}:${message}`);
    io.emit("message", { username, message });
  });
});

app.get("/chat", (req, res) => {
  const { username } = req.query;
  res.render("chat", { username });
});

app.get("/", (req, res) => {
  res.render("login");
});

server.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
