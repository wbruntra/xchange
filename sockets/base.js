module.exports = function(io) {
  var userList = [];
  var removeUser = function(name) {
    // Find and remove item from an array
    var i = userList.indexOf(name);
    if(i != -1) {
      userList.splice(i, 1);
    }
  }
  io.on('connection', function(socket) {
    var userName;
    console.log("a user connected, pal");

    socket.send()

    socket.on('join', function(name) {
      removeUser(userName);
      userName = name;
      userList.push(userName);
      console.log(userList);
    });

    socket.on('disconnect', function(){
      console.log(userName + ' disconnected');
      removeUser(userName);
      console.log(userList);
    });

    socket.on('chat message', function(msg) {
      console.log('message: '+ msg);
    });

    socket.on('chat message', function(msg) {
      io.emit('chat message', msg);
    });
});
}
