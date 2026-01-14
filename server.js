const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// เก็บข้อมูลผู้เล่นทุกคน
let players = {};

io.on('connection', (socket) => {
  console.log('User connected: ' + socket.id);

  // 1. สร้างตัวละครใหม่ (สุ่มสี สุ่มตำแหน่ง)
  players[socket.id] = {
    x: Math.floor(Math.random() * 300) + 50,
    y: Math.floor(Math.random() * 300) + 50,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  };

  // ส่งข้อมูลให้ทุกคนอัปเดตหน้าจอ
  socket.emit('currentPlayers', players); // บอกเรา
  socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] }); // บอกเพื่อน

  // 2. เมื่อมีคนเดิน
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        
        // บอกทุกคนว่า "คนนี้ขยับแล้วนะ"
        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            x: players[socket.id].x,
            y: players[socket.id].y
        });
    }
  });

  // 3. เมื่อคนออก
  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    delete players[socket.id];
    io.emit('disconnectPlayer', socket.id);
  });
});

// เปิด Server ที่พอร์ต 3000
http.listen(3000, () => {
  console.log('Server พร้อม! เล่นในคอมเข้า: http://localhost:3000');
});