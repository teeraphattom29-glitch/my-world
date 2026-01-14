const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let players = {};

io.on('connection', (socket) => {
  console.log('User connected: ' + socket.id);

  // สร้างตัวละคร
  players[socket.id] = {
    x: Math.floor(Math.random() * 300) + 50,
    y: Math.floor(Math.random() * 300) + 50,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  };

  // ส่งข้อมูลให้ทุกคน
  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

  // เดิน
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            x: players[socket.id].x,
            y: players[socket.id].y
        });
    }
  });

  // ออก
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('disconnectPlayer', socket.id);
  });
});

// 🔥 จุดสำคัญ: ใช้ Port ของ Render ถ้ามี ถ้าไม่มีให้ใช้ 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});