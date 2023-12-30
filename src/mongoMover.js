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
		this.mongoURI = process.env.MONGODB_URI;

		this.client = new MongoClient(this.mongoURI);
	}

	async connect() {
		await this.client.connect();
		console.log('Connected to MongoDB');
	}

	async moveDocuments() {
		console.log('Running the cron job...');

		try {
			const dbName = 'smesters-discord';
			const db = this.client.db(dbName);

			const sourceCollection = db.collection(this.sourceCollectionName);
			const destinationCollection = db.collection(this.destinationCollectionName);

			const documentsToMove = await sourceCollection.find().toArray();

			await destinationCollection.insertMany(documentsToMove);
			await sourceCollection.drop();

			console.log(`Cron job completed successfully.\nMoved ${documentsToMove.length} document(s) from ${this.sourceCollectionName} to ${this.destinationCollectionName}.`);
		} catch (error) {
			console.error('Error in cron job:', error);
		}
	}

	scheduleJob() {
		cron.schedule(this.cronSchedule, () => {
			this.moveDocuments();
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