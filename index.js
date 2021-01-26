const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    io.emit("chat message", "user connected");

    socket.on("chat message", (msg, name) => {
        // io.emit("chat message", msg, name);
        socket.broadcast.emit("chat message", msg, name);
    });

    socket.on("user typing", (name) => {
        socket.broadcast.emit("user typing", name);
    });

    socket.on("stop typing", () => {
        socket.broadcast.emit("stop typing");
    });

    socket.on("disconnect", () => {
        io.emit("chat message", "user disconnected");
    });
});

http.listen(3000, () => {
    console.log("listening on *:3000");
});
