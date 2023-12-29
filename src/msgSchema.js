const mongoose = require('mongoose');

const MsgSchema = new mongoose.Schema({
	channelId: mongoose.SchemaTypes.String,
	channelName: mongoose.SchemaTypes.String,
	msgId: mongoose.SchemaTypes.String,
	msgAuthor: mongoose.SchemaTypes.String,
	msgContent: mongoose.SchemaTypes.String,
	msgTimestamp: mongoose.SchemaTypes.Date,
	msgCreatedAt: mongoose.SchemaTypes.String,
	msgAuthorAvatar: mongoose.SchemaTypes.String,
	reactedID: mongoose.SchemaTypes.String,
	reactedName: mongoose.SchemaTypes.String,
	reactedAvatar: mongoose.SchemaTypes.String,
	reminderDate: mongoose.SchemaTypes.Date,
	reminded: mongoose.SchemaTypes.Boolean,
});

module.exports = mongoose.model('ReminderMsg', MsgSchema);