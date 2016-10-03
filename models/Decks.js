var mongoose = require('mongoose');

var DeckSchema = new mongoose.Schema({
  uniqname: {type: String, unique: true},
  title: String,
  creator: String,
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card'}]
});

mongoose.model('Deck',DeckSchema);
