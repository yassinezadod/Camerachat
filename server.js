const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const connections = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for the signal from the connected socket
  socket.on('signal', (initiator, id, signal) => {
    if (!initiator && id !== socket.id) {
      // If the other user is not the initiator, create a new SimplePeer instance
      const newPeer = new SimplePeer({ wrtc });
      // Connect the peers
      newPeer.signal(signal);
      // Emit the signal back to the initiator
      socket.emit('signal', false, newPeer._id, newPeer.signal());
      // Add the new peer to the connections array
      connections.push(newPeer);
    }
  });

  // Listen for the 'disconnect' event
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Remove the disconnected peer from the connections array
    const index = connections.findIndex((p) => p._id === socket.id);
    if (index !== -1) {
      connections.splice(index, 1);
    }
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur en cours d\'exécution sur http://192.168.100.86:3000');
});

