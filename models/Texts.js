var mongoose = require('mongoose');
var secrets = require('../secrets');

var TextSchema = new mongoose.Schema({
  contributor: String,
  title: String,
  content: String
});

mongoose.model('Text', TextSchema);
