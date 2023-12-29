/* eslint-disable spaced-comment */
/* eslint-disable brace-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */

/********************** Require discord.js classes and other packages ***********************/

const { Client, Events, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const ReminderMsg = require('./msgSchema.js');
require('dotenv').config({ path: __dirname + '/../.env' });

/************************************** Create client ***************************************/

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
  // Check if the reaction is from the bot or another user
  if (user.bot) return;

  let reactedMessage;
  let users;

  try {
    // Fetch the full message and users who react with emoji
    reactedMessage = await reaction.message.fetch();
    users = Array.from(await reaction.users.fetch());
  } catch (error) {
    console.error('Error fetching message:', error);
  }

  /*********** Extract information about message-reacted-to and user who reacted ************/

  const reactedMessageInfo = {
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

  /************************* Build and send bot message reaction ****************************/

  // Build bot reply embed
  const botReplyEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(reactedMessageInfo.content)
    .setAuthor({
      name: `On ${reactedMessageInfo.createdAt}, ${reactedMessageInfo.author} said:`,
    })
    .setThumbnail(reactedMessageInfo.avatar)
    .setFooter({
      text: 'Remind everyone about this in:',
      iconURL: userWhoReacted.avatar,
    });

  // Bot sends embed with buttons for reminder interval
  reactedMessage.reply({
    embeds: [botReplyEmbed],
    components: [
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId('1week')
          .setLabel('1 Week')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('2weeks')
          .setLabel('2 Weeks')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('3weeks')
          .setLabel('3 Weeks')
          .setStyle(ButtonStyle.Primary),
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId('1month')
          .setLabel('1 Month')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('3months')
          .setLabel('3 Months')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('6months')
          .setLabel('6 Months')
          .setStyle(ButtonStyle.Primary),
      ),
      new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId('1year')
          .setLabel('1 Year')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger),
      ),
    ],
  });

  /*************************** Handle bot message button clicks ***************************/

  const interactionCreateHandler = async (interaction) => {

      if (!interaction.isButton()) return;

      if (interaction.customId == '1week' && interaction.user.id === userWhoReacted.id) {

        // Set reminder date
        const reminderDate = new Date(reactedMessageInfo.timestamp);
        reminderDate.setDate(reactedMessageInfo.timestamp.getDate() + 7);

        // Save message to db
        await ReminderMsg.create({
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
        });

        // Edit original bot message to show reminder time and delete interval buttons
        interaction.message.edit({
          embeds: [
            botReplyEmbed.setFooter({
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

  // Add the interactionCreate listener
  client.on('interactionCreate', interactionCreateHandler);
});

/****************** Log in to Discord API with Bot & log in to MongoDB ********************/

client.login(process.env.DISCORD_TOKEN);

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: 'smesters-discord',
  })
  .catch(error => console.log(error));