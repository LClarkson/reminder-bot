/* eslint-disable spaced-comment */
/* eslint-disable brace-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */

/********************** Require discord.js classes and other packages ***********************/

const { Client, Events, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const ReminderMsg = require('./msgSchema.js');
require('dotenv').config({ path: __dirname + '/../.env' });

/************************* *********** Create client ****************************************/

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

/********************************* Connection Log Messages **********************************/

// Bot login message
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// MongoDB login message
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB smesters-discord');
});

/********************** Listen for user reactions to messages in server *********************/

client.on('messageReactionAdd', async (reaction, user) => {

  // Define message and user variables
  let reactedMessage;
  let users;

  // Check if the reaction is from the bot or another user
  if (user.bot) return;

  try {
    // Fetch the full message and users who react with emoji
    reactedMessage = await reaction.message.fetch();
    users = Array.from(await reaction.users.fetch());
  } catch (error) {
    console.error('Error fetching message:', error);
  }

  /*********** Extract information about message-reacted-to and user who reacted ************/

  const reactedMessageInfo = {
    channelId: reactedMessage.channel.id,
    channelName: reactedMessage.channel.name,
    id: reactedMessage.id,
    author: reactedMessage.member.displayName,
    content: reactedMessage.content,
    timestamp: new Date(reactedMessage.createdTimestamp),
    createdAt: new Date(reactedMessage.createdTimestamp).toLocaleString(
      'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' },
    ),
    avatar: reactedMessage.author.displayAvatarURL(),
  };

  const userWhoReacted = {
    id: users[0][1].id,
    name: users[0][1].username,
    avatar: users[0][1].displayAvatarURL(),
  };

  /*************************** Define Bot Reply Embed Builder *******************************/

  const buildReplyEmbed = () => {
    return [
      new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(reactedMessageInfo.content)
        .setAuthor({ name: `${reactedMessageInfo.author}\n${reactedMessageInfo.createdAt}:` })
        .setThumbnail(reactedMessageInfo.avatar)
        .setFooter({ text: 'Remind everyone about this in:', iconURL: userWhoReacted.avatar }),
    ];
  };

  /************************** Define Bot Reply Button Builder *******************************/

  const buildButtonComponents = () => {
    return [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('1week').setLabel('1 Week').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('2weeks').setLabel('2 Weeks').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('3weeks').setLabel('3 Weeks').setStyle(ButtonStyle.Primary),
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('1month').setLabel('1 Month').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('3months').setLabel('3 Months').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('6months').setLabel('6 Months').setStyle(ButtonStyle.Primary),
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('1year').setLabel('1 Year').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
      ),
    ];
  };

  /****************************** Define Bot Reply Function *********************************/

  const sendReply = (reactedMsg) => {

    // Bot sends embed with buttons for reminder interval
    reactedMsg.reply({
      embeds: buildReplyEmbed(),
      components: buildButtonComponents(),
    });
  };

  /************************ Define Bot Reply Button Click Handler ***************************/

  const interactionCreateHandler = async (interaction) => {

      if (!interaction.isButton()) return;

      if (interaction.customId == '1week' && interaction.user.id === userWhoReacted.id) {

        // Set reminder date
        const reminderDate = new Date(reactedMessageInfo.timestamp);
        reminderDate.setDate(reactedMessageInfo.timestamp.getDate() + 7);

        // Save message to db
        await ReminderMsg.create({
          channelId: reactedMessageInfo.channelId,
          channelName: reactedMessageInfo.channelName,
          msgId: reactedMessageInfo.id,
          msgAuthor: reactedMessageInfo.author,
          msgContent: reactedMessageInfo.content,
          msgTimestamp: reactedMessageInfo.timestamp,
          msgCreatedAt: reactedMessageInfo.createdAt,
          msgAuthorAvatar: reactedMessageInfo.avatar,
          reactedID: userWhoReacted.id,
          reactedName: userWhoReacted.name,
          reactedAvatar: userWhoReacted.avatar,
          reminderDate: reminderDate,
          reminded: false,
        });

        // Edit original bot message to show reminder time and delete interval buttons
        interaction.message.edit({
          embeds: [
            buildReplyEmbed().setFooter({
              text: 'Remind everyone about this in: 1 week',
              iconURL: userWhoReacted.avatar,
            }),
          ],
          // Clear buttons
          components: [],
        });

      // Remove the listener after handling the interaction
      client.removeListener('interactionCreate', interactionCreateHandler);

    } else {
      interaction.reply({
        content: `Only ${userWhoReacted.name} can set a reminder on this message.`,
        ephemeral: true,
      });
    }
  };

  /******************** Define How Bot Reacts to Different Interactions *********************/

  // If user trys to set a reminder on a bot reminder message, disallow that
  if (reactedMessage.author.id !== client.user.id) {
    sendReply(reactedMessage);
  }

  // Add the interactionCreate listener
  client.on('interactionCreate', interactionCreateHandler);
});

/******************** Log in to Discord API with Bot & log in to MongoDB ********************/

client.login(process.env.DISCORD_TOKEN);

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: 'smesters-discord',
  })
  .catch(error => console.log(error));