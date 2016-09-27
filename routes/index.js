var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat', { title: 'Express' });
});

module.exports = router;

// function(io) {
//     var app = require('express');
//     var router = app.Router();
//
//     /* GET home page. */
//     router.get('/', function(req, res, next) {
//       res.render('chat', { title: 'Express' });
//     });
//
//     io.on('connection', function(socket) {
//         console.log("a user connected, dude")
//         socket.on('disconnect', function(){
//           console.log('user disconnected');
//         });
//         socket.on('chat message', function(msg) {
//           console.log('message: '+ msg);
//         });
//         socket.on('chat message', function(msg) {
//           io.emit('chat message', msg);
//         });
//     });
//
//     return router;
// }
