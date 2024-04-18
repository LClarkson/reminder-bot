/* eslint-disable indent */
/* eslint-disable brace-style */

/* MongoMover defines a class that moves documents from one MongoDB collection to another.
 * The class accepts 3 arguments: a source collection, a destination collection, and a cron schedule.
 * When calling the class, use the cronSchedule argument to define when the document move happens.
 * Use a .env file to specify your MongoDB URI.
 */

// Imports
const cron = require('node-cron');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

// Define class
class MongoMover {
  constructor(sourceCollectionName, destinationCollectionName, cronSchedule) {
    this.sourceCollectionName = sourceCollectionName;
    this.destinationCollectionName = destinationCollectionName;
    this.cronSchedule = cronSchedule;
    this.mongoURI =
      process.env.NODE_ENV === 'development'
        ? process.env.MONGODB_URI_DEV
        : process.env.MONGODB_URI;

    this.client = new MongoClient(this.mongoURI);
  }

  async connect() {
    await this.client.connect();
    console.log('Connected to MongoDB');
  }

  async moveDocuments(moveType) {
    console.log('Running the cron job...');

    try {
      const dbName =
        process.env.NODE_ENV === 'development'
          ? process.env.MONGODB_DBNAME_DEV
          : process.env.MONGODB_DBNAME;
      const db = this.client.db(dbName);

      const sourceCollection = db.collection(this.sourceCollectionName);
      const destinationCollection = db.collection(
        this.destinationCollectionName,
      );

      let documentsToMove;

      if (moveType === 'todaysMsgs') {
        // Move documents with a timestamp of today's date
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

        const dateFilter = {
          reminderDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        };

        documentsToMove = await sourceCollection.find(dateFilter).toArray();
      } else {
        // Move all documents
        documentsToMove = await sourceCollection.find().toArray();
      }

      if (documentsToMove.length > 0) {
        await destinationCollection.insertMany(documentsToMove);
        await sourceCollection.deleteMany({
          _id: { $in: documentsToMove.map((doc) => doc._id) },
        });

        console.log(
          `Cron job completed successfully.\nMoved ${documentsToMove.length} document(s) from ${this.sourceCollectionName} to ${this.destinationCollectionName}.`,
        );
      } else {
        console.log('No documents to move.');
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  }

  scheduleJob(moveType = 'all') {
    cron.schedule(this.cronSchedule, () => {
      this.moveDocuments(moveType);
    });
  }

  closeConnection() {
    process.on('SIGINT', () => {
      console.log('Closing MongoDB connection...');
      this.client.close().then(() => process.exit(0));
    });
  }
}

module.exports = MongoMover;
