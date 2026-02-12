const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Private DM Chat</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #4e73df, #1cc88a);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }

      .container {
        width: 420px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .header {
        background: #4e73df;
        color: white;
        padding: 18px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
      }

      .section {
        padding: 20px;
      }

      input {
        width: 100%;
        padding: 12px;
        margin-bottom: 12px;
        border-radius: 10px;
        border: 1px solid #ddd;
        font-size: 14px;
      }

      button {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: #4e73df;
        color: white;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
        transition: 0.2s;
      }

      button:hover {
        background: #2e59d9;
      }

      #messages {
        height: 250px;
        overflow-y: auto;
        border: 1px solid #eee;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
        background: #f8f9fc;
      }

      .message {
        margin-bottom: 8px;
      }

      .me {
        color: #1cc88a;
        font-weight: bold;
      }

      .other {
        color: #4e73df;
        font-weight: bold;
      }

      #chatSection {
        display: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Private DM Chat</div>

      <div class="section" id="loginSection">
        <input id="username" placeholder="Enter Username" />
        <input id="room" placeholder="Conversation Password" />
        <button onclick="joinRoom()">Join / Create Conversation</button>
      </div>

      <div class="section" id="chatSection">
        <div id="messages"></div>
        <input id="messageInput" placeholder="Type message..." />
        <button onclick="sendMessage()">Send Message</button>
      </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
      const socket = io();
      let username;
      let room;

      function joinRoom() {
        username = document.getElementById("username").value;
        room = document.getElementById("room").value;

        if (!username || !room) {
          alert("Enter both fields");
          return;
        }

        socket.emit("joinRoom", { username, room });

        document.getElementById("loginSection").style.display = "none";
        document.getElementById("chatSection").style.display = "block";
      }

      function sendMessage() {
        const messageInput = document.getElementById("messageInput");
        const message = messageInput.value;

        if (!message) return;

        socket.emit("chatMessage", { username, room, message });
        messageInput.value = "";
      }

      socket.on("message", (data) => {
        const messages = document.getElementById("messages");
        const div = document.createElement("div");
        div.classList.add("message");

        if (data.username === username) {
          div.innerHTML = "<span class='me'>" + data.username + ":</span> " + data.message;
        } else {
          div.innerHTML = "<span class='other'>" + data.username + ":</span> " + data.message;
        }

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
      });
    </script>
  </body>
  </html>
  `);
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
  });

  socket.on("chatMessage", ({ username, room, message }) => {
    io.to(room).emit("message", { username, message });
  });
});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
