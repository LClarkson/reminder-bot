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

// Specify model export variable and set collection to write to - 'staging'
const ReminderMsg = mongoose.model('ReminderMsg', MsgSchema, 'staging');

module.exports = ReminderMsg;