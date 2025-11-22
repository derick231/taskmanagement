import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import routes from "./routes/index.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join_room", (roomId) => {
    socket.join(`room_${roomId}`);
  });

  socket.on("disconnect", () => {});
});

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(routes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
