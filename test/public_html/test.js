function test() {
    console.log("is working");
    var socket = io();
    socket.on('connection', function() {
      console.log('a user connected');
      socket.on('disconnect', function() {
        console.log('user disconnected');
      });
    });
  }
test();