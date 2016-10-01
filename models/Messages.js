var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secrets = require('../secrets');

var MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  content: String
});

mongoose.model('Message', MessageSchema);
