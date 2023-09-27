const http = require("http");
const socketIO = require("socket.io");

const arrUserInfo = [];

const server = http.createServer();
const io = socketIO(server, {
  cors: {
    origin: "null",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', socket => {
    socket.on('UserSignUp', user => {
      const isExit = arrUserInfo.some(e => e.name === user.name);
      socket.peerId = user.peerId; 
      if(isExit) return socket.emit('SignUpFail')
        arrUserInfo.push(user);
        socket.emit('ListUserOnline', arrUserInfo);
        socket.broadcast.emit('HadNewUser', user);
    });

    socket.on('disconnect', () => {
      const index = arrUserInfo.findIndex(user => user.peerId === socket.peerId);
      arrUserInfo.slice(index, 1);
      io.emit('SomeoneHasDisconnect', socket.peerId);
    });
});

server.listen(process.env.PORT || 2501, () => {
});