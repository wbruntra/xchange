var socket = io();
$('form#chat-form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

$('form#name').submit(function() {
  socket.emit('join', $('#n').val());
  return false;
});

socket.on('chat message', function(msg) {
  console.log(msg);
});

socket.on('join', function(name) {
  console.log('somebody is here');
});
