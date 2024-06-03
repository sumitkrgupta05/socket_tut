import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secretKeyJWT = "qwertyuioplkjhgfdsa";
const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//MIDDLEWARE -> cors ko api me use krna h toh as middleware use krna hoga so uske lie
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "qwertyuiop" }, secretKeyJWT);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({ message: "Login Successful" });
});

//used for authentication {demo}
const user = false;
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Application Error"));

    const decode = jwt.verify(token, secretKeyJWT);
    next();
  });

  // if (user) next();
});

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  // console.log("Id", socket.id);
  // socket.emit("welcome", `Welcome to the server`);
  // socket.broadcast.emit("welcome", `${socket.id} joined the server`);

  socket.on("message", ({ room, message }) => {
    console.log({ room, message });
    // io.emit("message-received", data);
    // socket.broadcast.emit("message-received", data);
    io.to(room).emit("message-received", message);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`user joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
