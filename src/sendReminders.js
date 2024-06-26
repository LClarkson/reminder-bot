/* eslint-disable indent */
/* eslint-disable brace-style */
/* eslint-disable spaced-comment */

// every day at 12:00pm cst, grab all documents inside 'remindermsgs' and send to appropriate channel
// after messages sent, move any documents with reminded:true from 'remindermsgs' into 'archive'

// the above stragegy offloads read/write/delete operations between collections to a low-traffic time of day
// allowing logic and compute to complete when traffic is lowest, then at 12pm only one operation needs to occur,
// send any messages in 'remindermsgs' collection. This offloads write operations to that collection that
// could be happening simultaneously if people are setting reminders during a busy part of the day. Instead,
// write operations will occur in a different collection.

/********************** Require discord.js classes and other packages ***********************/

const {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require('discord.js');
const cron = require('node-cron');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

const DISCORD_TOKEN =
  process.env.NODE_ENV === 'development'
    ? process.env.DISCORD_TOKEN_DEV
    : process.env.DISCORD_TOKEN;

/*********************************** Create bot client **************************************/

const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

/********************************* Connection Log Messages **********************************/

// Bot login message
botClient.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

/********************************* Define MongoDB Variables *********************************/

const mongoURI =
  process.env.NODE_ENV === 'development'
    ? process.env.MONGODB_URI_DEV
    : process.env.MONGODB_URI;
const sourceCollectionName = 'remindermsgs';
const client = new MongoClient(mongoURI);

/*********************************** Define Cron Interval ***********************************/

// every day at 12pm is 0 18 * * *
const cronSchedule = '0 18 * * *';

/********************************* Connect to Mongo Client **********************************/

// Connect to MongoDB and schedule the job
client.connect().then(() => {
  console.log('Connected to MongoDB');

  let messages;

  /******************************** Schedule Cron Job *************************************/

  // Schedule the cron job
  cron.schedule(cronSchedule, async () => {
    console.log('Running the cron job...');

    // Fetch messages from db
    try {
      // Define db variables
      const dbName =
        process.env.NODE_ENV === 'development'
          ? process.env.MONGODB_DBNAME_DEV
          : process.env.MONGODB_DBNAME;
      const db = client.db(dbName);
      const sourceCollection = db.collection(sourceCollectionName);

      // Find documents in the source collection
      messages = await sourceCollection.find().toArray();
    } catch (error) {
      console.error('Error in cron job:', error);
    }

    /************************** Build Bot Message Embed *********************************/

    //`[${message.msgContent}](${message.msgLink})`

    const buildReminderEmbed = (message) => {
      const msgHyperlink = `[View original message](${message.msgLink})`;
      // had to build this conditional to prevent "undefined" from showing up in message embed
      // on messages that were added to db before the URL feature was added. If the message
      // object has a msgLink property, it will build the embed with that property, if not
      // (i.e. any message reacted on prior to 4-5-20204), original embed will be sent

      if (message.msgLink) {
        return new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(message.msgContent)
          .setDescription(msgHyperlink)
          .setAuthor({ name: `${message.msgAuthor}\n${message.msgCreatedAt}:` })
          .setThumbnail(message.msgAuthorAvatar);
      } else {
        return new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(message.msgContent)
          .setAuthor({ name: `${message.msgAuthor}\n${message.msgCreatedAt}:` })
          .setThumbnail(message.msgAuthorAvatar);
      }
    };

    /******************************* Send Messages **************************************/

    messages.forEach((message) => {
      const channel = botClient.channels.cache.get(message.channelId);
      const mentionUser = `<@${message.reactedID}>`;
      channel.send({
        content: `${mentionUser}, here's your reminder:`,
        embeds: [buildReminderEmbed(message)],
      });
    });
  });
});

/******************** Log in to Discord API with Bot & log in to MongoDB ********************/

botClient.login(DISCORD_TOKEN);
