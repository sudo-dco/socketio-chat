const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const rooms = [];

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/create", (req, res) => {
    const id = Math.floor(Math.random() * 10000 + 1).toString();
    rooms.push(id);
    res.send(JSON.stringify(id));
});

io.on("connection", (socket) => {
    // io.emit("chat message", "user connected");

    // username
    socket.on("set username", (name) => {
        socket.username = name;
        console.log(socket);
    });

    // messages
    socket.on("chat message", (msg, name, id) => {
        // io.emit("chat message", msg, name);
        // socket.broadcast.emit("chat message", msg, name);
        io.in(id).emit("chat message", msg, name);
    });

    socket.on("user typing", (name, id) => {
        // socket.broadcast.emit("user typing", name);
        io.in(id).emit("user typing", name);
    });

    socket.on("stop typing", (id) => {
        // socket.broadcast.emit("stop typing");
        io.in(id).emit("stop typing");
    });

    socket.on("user left", (name) => {});

    socket.on("disconnecting", (name) => {
        for (let room of socket.rooms) {
            if (room !== socket.id) {
                socket
                    .io(room)
                    .emit("chat message", `has left`, socket.username);
            }
        }
    });

    // rooms
    socket.on("create room", (name, id) => {
        socket.join(id);
        console.log(socket.username);
        io.to(id).emit(
            "chat message",
            `joined room ${id} has been created by ${name}`,
            name
        );
    });

    socket.on("join room", (name, id) => {
        socket.join(id);
        io.in(id).emit("chat message", `has joined the room`, name);

        console.log(socket.rooms);
    });
});

http.listen(3000, () => {
    console.log("listening on *:3000");
});
