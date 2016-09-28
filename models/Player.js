var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
	username: { type: String, required: true, unique: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	alerts: { type: Schema.ObjectId, ref: 'Alert' },
	rank: { type: Number, default: 0 },
	lastGame: { type: Date, default: null },
	phone: Number,
	email: String
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;
