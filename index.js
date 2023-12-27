/* eslint-disable spaced-comment */
/* eslint-disable brace-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */

// Load environment variables from .env
require('dotenv').config();

// Require date formatter
const moment = require('moment');

// Store discord API token in variable
const token = process.env.DISCORD_TOKEN;

/*************** Require discord.js classes and create a new client instance ****************/

const {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

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
    // Fetch the full message and users who react with emoji
    const reactedMessage = await reaction.message.fetch();
    const users = Array.from(await reaction.users.fetch());

    // Extract information about the message
    const author = reactedMessage.author.username;
    const created = moment(reactedMessage.createdTimestamp).format('MMMM DD, YYYY');
    const avatar = reactedMessage.author.displayAvatarURL();
    const content = reactedMessage.content;
    const whoToRemind = users[0][1].username;
    const whoToRemindAvatar = users[0][1].displayAvatarURL();
    const whoToRemindID = users[0][1].id;

    //console.log('Author:', author);
    //console.log('Avatar:', avatar);
    //console.log('Message:', reactedMessage);
    //console.log('Created at:', created);
    //console.log('MessageID:', reactedMessage.id);
    //console.log('Remind:', whoToRemind);
    //console.log ('Remind UserID:', whoToRemindID);

/******************************** Build bot message reaction ********************************/

    // Build embed
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(content)
      .setAuthor({ name: `On ${created}, ${author} said:` })
      .setThumbnail(avatar)
      .setFooter({ text: 'Remind everyone about this message in:', iconURL: whoToRemindAvatar });

    // Bot sends embed with buttons for reminder interval
    reactedMessage.reply({
      embeds: [exampleEmbed],
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder().setCustomId('1week').setLabel('1 Week').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('2weeks').setLabel('2 Weeks').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('3weeks').setLabel('3 Weeks').setStyle(ButtonStyle.Primary),
        ),
      ],
    });

  } catch (error) {
    console.error('Error fetching message:', error);
  }

});

/****************************** Log in to Discord API with Bot ******************************/
client.login(token);
