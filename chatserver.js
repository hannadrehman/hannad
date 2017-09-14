const app = require('express')();
const http = require('https').Server(app);
const io = require('socket.io')(http);

let clients = [];
const chatHistory = [];
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  console.log('hit');
  res.json({ status: 200, message: 'OK' });
});

io.on('connection', (socket) => {
  console.log('A user connected', socket.connected);
  socket.emit('acknowledgement', true);
  socket.on('disconnect', () => {
    console.log('disconnected connecttion');
  });
  //   user join
  socket.on('user:enter', (user) => {
    const copyUser = Object.assign(user);
    copyUser.timestamp = new Date().getTime();
    clients.push(copyUser);
    io.emit('user:joins', { message: 'a new user has joined', data: copyUser });
  });
  // user left
  socket.on('user:quits', (user) => {
    const newUser = Object.assign(user);
    newUser.timestamp = new Date().getTime();
    const newUsers = clients.filter(current => newUser.userName !== current.userName);
    clients = newUsers;
    io.emit('user:left', { message: 'a user has left', data: newUser });
  });

  socket.on('user:message', (message) => {
    if (message.text) {
      console.log(message);
      chatHistory.push(message);
      socket.broadcast.emit('newChatMessage', message);
    }
  });
});
// start server
http.listen(8080, () => {
  console.log('chat server is ready on port 8080');
});
