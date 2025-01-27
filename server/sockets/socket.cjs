const { Server } = require("socket.io");

let io;

function createSocketServer(httpServer) {
  io = new Server(httpServer, {
    connectionStateRecovery: {},
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  return io;
}

function emitNewEntry(entry) {
  io.emit("new entry", entry);
}

module.exports = { createSocketServer, emitNewEntry };
