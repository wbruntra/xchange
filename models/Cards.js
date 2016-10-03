var mongoose = require('mongoose');

var CardSchema = new mongoose.Schema({
  front: String,
  back: String,
  tips: String,
  creator: String,
  deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck' }
});

mongoose.model('Card', CardSchema);
