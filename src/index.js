/* eslint-disable spaced-comment */
/* eslint-disable brace-style */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */

/********************** Require discord.js classes and other packages ***********************/

const { Client, Events, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const token = process.env.DISCORD_TOKEN;

/************************************** Create client ***************************************/

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

  console.log(reactedMessageInfo);
  console.log(userWhoReacted);

  /************************* Build and send bot message reaction ****************************/

    // Build bot reply embed
  const botReplyEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(reactedMessageInfo.content)
    .setAuthor({ name: `On ${reactedMessageInfo.createdAt}, ${reactedMessageInfo.author} said:` })
    .setThumbnail(reactedMessageInfo.avatar)
    .setFooter({ text: 'Remind everyone about this in:', iconURL: userWhoReacted.avatar });

  // Bot sends embed with buttons for reminder interval
  reactedMessage.reply({
    embeds: [botReplyEmbed],
    components: [
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
    ],
  });

  /*************************** Handle bot message button clicks ***************************/

  client.on('interactionCreate', (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId == '1week' && interaction.user.id === userWhoReacted.id) {
      console.log('1 week clicked');
      interaction.reply({
        content: 'You\'ll be reminded in 1 week',
        ephemeral: true,
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
    } else {
      interaction.reply({
        content: `Only ${interaction.user.username} can set a reminder on this message.`,
        ephemeral: true,
      });
    }
  });

});

/****************************** Log in to Discord API with Bot ******************************/

client.login(token);
