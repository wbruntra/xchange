var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var secrets = require('../secrets');
var auth = jwt({secret: secrets.secretKey, userProperty: 'payload'});

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var Deck = mongoose.model('Deck');
var Card = mongoose.model('Card');
var Text = mongoose.model('Text');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat', { title: 'Express' });
});

router.post('/register', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({message:'Please fill out all fields'})
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function(err){
    if(err){return next(err);}

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.post('/profile', function(req,res, next) {
  var username = req.body.username;
  if (req.body.password) {
    User.findOne({username: username}, function(err, user) {
      if (err) {return done(err)};
      if (user) {
        console.log(req.body);
        if (user.validPassword(req.body.password)) {
          user.skypename = req.body.skypename;
          user.save(function(err) {
            if(err) {return next(err);}
          });
          return res.json({msg:'Nice post!'});
        }
        else {
          return res.json({msg:'Wrong password!'});
        }
      }
    });
  }
  else {
    return res.json({msg: 'Don\'t forget a password!'})
  }
});

router.param('username', function(req, res, next, name) {
  var query = User.findOne({username: name},'username skypename', function(err,user) {
    if(err) {return next(err);}
    req.user = user;
    return next();
  });
});

router.get('/users/:username', function(req, res) {
  res.json(req.user);
});

router.get('/users', function(req,res,next) {
  User.find({}, function(err,users) {
    res.json(users);
  });
});

router.get('/messages', auth, function(req,res,next) {
  var username = req.payload.username;
  Message.find({receiver: username}, function(err,messages) {
    if(err) {return next(err);}
    res.json(messages);
  });
});

router.post('/messages', auth, function(req,res,next) {
  var message = new Message(req.body);
  message.sender = req.payload.username;

  message.save(function(err, message) {
    if(err) {return next(err)};
    console.log(message);
    res.json({msg:'Success!'});
  });
});

// [START decks]

function getUniqueName(username, deckname) {
  return username + '-' + deckname;
}

router.get('/decks', auth, function(req,res) {
  var username = req.payload.username;
  var deckname = req.body.deckname;
  Deck.find({creator: username}, function(err, decks) {
    if(err) {return next(err)}
    res.json(decks);
  });
});

router.post('/decks', auth, function(req, res) {
  var deckname = req.body.deckname;
  var deck = new Deck(req.body);
  deck.creator = req.payload.username;
  deck.uniqname = req.payload.username + '-' + deck.title;

  deck.save(function(err, deck) {
    if(err) {return next(err); }

    res.json(deck);
  });
});

router.param('deck', function(req, res, next, uniqname) {
  // var query = Deck.findById(id);
  var query = Deck.findOne({'uniqname': uniqname})
  query.exec(function (err, deck){
    if (err) { return next(err); }
    if (!deck) { return next(new Error('can\'t find deck')); }

    req.deck = deck;
    return next();
  });
});

router.get('/study/:deck', function(req, res) {
  req.deck.populate('cards', function(err, deck) {
    if (err) {return next(err);}
    console.log(req.deck);
    res.json(req.deck);
  });
});

// [END decks]

// [START texts]

router.param('text', function(req, res, next, id) {
  var query = Text.findById(id);

  query.exec(function (err, text){
    if (err) { return next(err); }
    if (!text) { return next(new Error('can\'t find text')); }

    req.text = text;
    return next();
  });
});

router.get('/texts/:text', function(req, res) {
  res.json(req.text);
});

router.get('/texts', function(req, res) {
  Text.find(function(err, texts) {
    console.log(texts);
    res.json(texts);
  });
});

router.post('/texts', auth, function(req, res) {
  var text = new Text(req.body);
  text.contributor = req.payload.username;
  text.save(function(err, text) {
    if(err) {return next(err)};
    res.json(text);
  });
});


// [END texts]

// [START cards]

router.post('/cards', auth, function(req, res) {
  var card = new Card(req.body);
  card.creator = req.payload.username;
  console.log(card);
  res.json(card);
  // card.save(function(err, card) {
  //   if(err) {return next(err)};
  //   res.json(card);
  // });
});

router.post('/decks/:deck/cards', auth, function(req, res) {
  var card = new Card(req.body);
  card.creator = req.payload.username;
  card.deck = req.deck;
  card.save(function(err, card) {
    if (err) {return next(err);}
    req.deck.cards.push(card);
    req.deck.save(function(err,deck) {
      if(err) {return next(err);}
      res.json(card);
    });
  });
});

// [END cards]

// [START templates]

router.get('/editor', function(req,res) {
  res.render('editor');
});

router.get('/viewtext', function(req, res) {
  res.render('viewtext');
});

// [END templates]

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
