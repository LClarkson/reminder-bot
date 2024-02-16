# Discord Reminder Bot

Discord Reminder Bot enables users to set reminders on messages through reactions, providing a convenient way to manage and notify users about important events or messages. The bot integrates with MongoDB to store reminders, ensuring persistence even across bot restarts.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [How the Bot Works](#how-the-bot-works)
- [Configuration](#configuration)
- [Usage](#usage)
- [MongoDB Integration](#mongodb-integration)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Features

### 1. Message Reminders
   - Users can set reminders by reacting with the '🔔' emoji on any message.
   - The bot responds with an interactive button interface, providing various reminder durations.

### 2. MongoDB Integration
   - Reminders are stored in a MongoDB database, ensuring data persistence.
   - MongoDB allows efficient management of reminders and enables scalable storage.

### 3. Button Interface
   - The bot utilizes interactive buttons to provide a user-friendly way to set reminder durations.
   - Users can choose from different durations such as 1 week, 2 weeks, 1 month, etc.

### 4. Cron Jobs
   - Reminders are stored in a series of MongoDB collections. This allows for separate logic
     to handle storing of messages, and sending of messages by the bot, insuring that there are
     no lengthly .find() operations performed to send reminders on the current date. Instead
     of sorting through a global collection of messages, checking if the date is current, then
     performing operations on the messages to mark that a reminder has been sent, instead, 
     Reminder Bot uses 3 collections inside Mongo - 'staging', 'remindermsgs', and 'archive'
   - Scheduled tasks move documents between MongoDB collections at specified intervals.
   - Cron jobs automate the process of moving reminders, ensuring timely execution.

## Prerequisites

Before setting up and running the Discord Reminder Bot, ensure you have the following prerequisites:

- Node.js and npm installed on your system.
- A Discord bot token obtained from the Discord Developer Portal.
- Access to a MongoDB database with a valid URI and database name.
- 3 collections created inside your database - `staging`, `remindermsgs`, `archive`.

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/discord-reminder-bot.git
2. **Navigate to the Project Directory**
   ```bash
   cd <project-directory>
3. Install Dependencies
   ```bash
   npm install
4. Create a `.env` file in the root directory and set the following environment variables:
   ```bash
   DISCORD_TOKEN=<your-discord-bot-token>
   MONGODB_URI=<your-mongodb-uri>
   MONGODB_DBNAME=<your-mongodb-database-name>
5. Run the Discord Bot
   ```bash
   node index.js

## How The Bot Works
Reminder bot uses the Discord.js library and Mongoose library for MongoDB. It defines a Discord 
bot that listens for reactions on messages and allows users to set reminder intervals on those messages.
Once the specified interval is reached, the bot sends the message to the relevant discord channel
(the same channel the reminder was set in).

1.  **Import Libraries and Modules:**
    - The script imports necessary modules and classes from the Discord.js library.
    - It also imports the Mongoose library for MongoDB interaction and a custom module `msgSchema.js`.
2.  **Configuration:**
    -   The script sets up configuration constants for Discord bot token (`DISCORD_TOKEN`), MongoDB URI (`MONGODB_URI`), and MongoDB database name (`MONGODB_DBNAME`).
    -   It uses the `dotenv` module to load environment variables from a file.
3.  **Initialize Discord Client:**
    -   A new instance of the Discord.js `Client` class is created with specified intents and partials.
4.  **Listen for Reactions:**
    -   The script listens for the 'messageReactionAdd' event, triggered when a user adds a '🔔' reaction to a message.
5.  **Extract Information about the Reacted Message and User:**

    -   It fetches information about the reacted message and the user who reacted with the '🔔' emoji.
    -   It checks if the '🔔' emoji is present only once on the message. This prevents multiple people from
        setting reminders on the same message.
6.  **Define Bot Reply Embed Builder:**

    -   A function `buildReplyEmbed` is defined to create an embed object for the bot's reply. The bot replies
        to the channel once a '🔔' emoji is set on a message. Only the user who set the emoji can interact with
        the bot reply.
7.  **Define Bot Reply Button Builder:**

    -   A function `buildButtonComponents` is defined to create an array of button components for the bot's reply.
        The button components are a collection of intervals, i.e. `1 week`, `2 weeks`, `1 month`, etc.
8.  **Define Bot Reply Function:**

    -   A function `sendReply` is defined which sends the bot's reply with an embed and buttons to the reacted message.
9.  **Define Save Message to DB Function:**

    -   A function `saveReminderToDatabase` is defined to save information about the reminder to the MongoDB database.
10. **Define Bot Reply Button Click Handler:**

    -   A function `buttonClickHandler` handles button clicks, interprets button IDs, and performs actions accordingly.
11. **Define How Bot Reacts to Different Interactions:**

    -   The script checks if the reacted message is not authored by the bot, and if not, the bot sends a reply with buttons.
12. **Log in to Discord API and MongoDB:**

    -   The script logs in to the Discord API using the bot token.
    -   It connects to the MongoDB database using the specified URI and database name.

## Configuration
--coming soon--