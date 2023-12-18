/* eslint-disable no-unused-vars */
// Load environment variables from .env
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;

/*
Require the necessary discord.js
classes and create a new client
instance
*/
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

/*
Log message to confirm
bot is online and logged in
*/
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


/*
Listen for user reactions
to messages in server
*/
client.on('messageReactionAdd', async (reaction, user) => {
	// Check if the reaction is from the bot or another user
	if (user.bot) return;

	try {
		// Fetch the full message
		const reactedMessage = await reaction.message.fetch();

		// Extract information about the message
		const author = reactedMessage.author.tag;
		const content = reactedMessage.content;

		// You can now use 'author' and 'content' as needed
		console.log(reactedMessage);
	}

	catch (error) {
		console.error('Error fetching message:', error);
	}

});

// Login to Discord API with Bot
client.login(token);