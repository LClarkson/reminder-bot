/* eslint-disable spaced-comment */
/* eslint-disable brace-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */

/*********************** Require packages, configure ENV variables **************************/

const { Client, Events, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const ReminderMsg = require('./msgSchema.js');
require('dotenv').config({ path: __dirname + '/../.env' });

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

/******************************** Initialize Discord Client *********************************/

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

/********************** Listen for user reactions to messages in server *********************/

client.on('messageReactionAdd', async (reaction, user) => {

  // Define message and user variables
  let reactedMessage;
  let users;

  if (user.bot || reaction.emoji.name !== '🔔') return;

  try {
      // Fetch the full message and users who react with emoji
      reactedMessage = await reaction.message.fetch();
      users = Array.from(await reaction.users.fetch());
  } catch (error) {
      console.error('Error fetching message:', error);
  }

  // Check if the '🔔' emoji is already present on the message
  const bellEmojiCount = reactedMessage.reactions.cache.get('🔔')?.count;
  if (bellEmojiCount !== 1) return;

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

  /************ Define Bot Reply Embed Builder [RETURNS an embed oject] *********************/

  const buildReplyEmbed = () => {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(reactedMessageInfo.content)
        .setAuthor({ name: `${reactedMessageInfo.author}\n${reactedMessageInfo.createdAt}:` })
        .setThumbnail(reactedMessageInfo.avatar)
        .setFooter({ text: 'Remind everyone about this in:', iconURL: userWhoReacted.avatar });
  };

  /******** Define Bot Reply Button Builder [RETURNS an array of button components] *********/

  const buildButtonComponents = () => {
    return [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('7').setLabel('1 Week').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('14').setLabel('2 Weeks').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('21').setLabel('3 Weeks').setStyle(ButtonStyle.Primary),
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('30').setLabel('1 Month').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('90').setLabel('3 Months').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('180').setLabel('6 Months').setStyle(ButtonStyle.Primary),
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('365').setLabel('1 Year').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
      ),
    ];
  };

  /****************************** Define Bot Reply Function *********************************/

  const sendReply = (reactedMsg) => {
    reactedMsg.reply({
      embeds: [buildReplyEmbed()],
      components: buildButtonComponents(),
    });
  };

  /************************* Define save message to db function *****************************/

  const saveReminderToDatabase = async (messageInfo, userInfo, interaction) => {
    const reminderDate = new Date(messageInfo.timestamp);
    reminderDate.setDate(messageInfo.timestamp.getDate() + parseInt(interaction.customId));

    // Save message to db
    await ReminderMsg.create({
      channelId: messageInfo.channelId,
      channelName: messageInfo.channelName,
      msgId: messageInfo.id,
      msgAuthor: messageInfo.author,
      msgContent: messageInfo.content,
      msgTimestamp: messageInfo.timestamp,
      msgCreatedAt: messageInfo.createdAt,
      msgAuthorAvatar: messageInfo.avatar,
      reactedID: userInfo.id,
      reactedName: userInfo.name,
      reactedAvatar: userInfo.avatar,
      reminderDate: reminderDate,
    });
  };

  /************************ Define Bot Reply Button Click Handler ***************************/

  const buttonClickHandler = async (interaction) => {

    // Button ID dictionary
    const idTranslate = {
      '7': '1 week',
      '14': '2 weeks',
      '21': '3 weeks',
      '30': '1 month',
      '90': '3 months',
      '180': '6 months',
      '365': '1 year',
    };

    if (!interaction.isButton()) return;
    if (interaction.user.id === userWhoReacted.id) {

      // Delete bot message if user clicks cancel
      if (interaction.customId === 'cancel') {
        await interaction.message.delete();
        client.removeListener('interactionCreate', buttonClickHandler);
        return;
      }

      await saveReminderToDatabase(reactedMessageInfo, userWhoReacted, interaction);

      // Edit original bot message to show reminder time and delete interval buttons
      interaction.message.edit({
        embeds: [
          buildReplyEmbed().setFooter({
            text: `Remind everyone about this in ${idTranslate[interaction.customId]}`,
            iconURL: userWhoReacted.avatar,
          }),
        ],
        // Clear buttons
        components: [],
      });

      // Remove the listener after handling the interaction
      client.removeListener('interactionCreate', buttonClickHandler);
    } else {
      interaction.reply({
        content: `${userWhoReacted.name} set the first bell. Only they can set a reminder on this message.`,
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
  client.on('interactionCreate', buttonClickHandler);

});


/******************** Log in to Discord API with Bot & log in to MongoDB ********************/

client
  .login(DISCORD_TOKEN)
  .then(client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  }))
  .catch(error => console.log(error));

mongoose
  .connect(MONGODB_URI, {
    dbName: MONGODB_DBNAME,
  })
  .then(mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB database: ${MONGODB_DBNAME}`);
  }))
  .catch(error => console.log(error));