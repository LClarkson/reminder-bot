/* eslint-disable spaced-comment */
/* eslint-disable brace-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */

// Load environment variables from .env
require('dotenv').config();

// Store discord API token in variable
const token = process.env.DISCORD_TOKEN;

/*************** Require discord.js classes and create a new client instance ****************/

const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

/******************** Log message to confirm bot is online and logged in ********************/

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

/********************** Listen for user reactions to messages in server *********************/

client.on('messageReactionAdd', async (reaction, user) => {
  // Check if the reaction is from the bot or another user
  if (user.bot) return;

  try {
    // Fetch the full message
    const reactedMessage = await reaction.message.fetch();
    const users = Array.from(await reaction.users.fetch());
    const whoToRemind = users[0][1].username;
    const whoToRemindID = users[0][1].id;

    // Extract information about the message
    const author = reactedMessage.author.username;
    const content = reactedMessage.content;

    console.log('Author:', author);
    console.log('Message:', content);
    console.log('MessageID:', reactedMessage.id);
    console.log('Remind:', whoToRemind);
    console.log ('Remind UserID:', whoToRemindID);

  } catch (error) {
    console.error('Error fetching message:', error);
  }
});

/****************************** Log in to Discord API with Bot ******************************/
client.login(token);
