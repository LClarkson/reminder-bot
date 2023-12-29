/* eslint-disable brace-style */
// every day at 3:00am, move any documents with today's date from 'staging' to 'remindermsgs'

// Import necessary libraries
const cron = require('node-cron');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

// MongoDB connection URI
const mongoURI = process.env.MONGODB_URI;

// MongoDB collection names
const sourceCollectionName = 'staging';
const destinationCollectionName = 'remindermsgs';

// Cron schedule (runs every day at midnight)
const cronSchedule = '0 0 * * *';

// MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB and schedule the job
client.connect().then(() => {
	console.log('Connected to MongoDB');

	// Schedule the cron job
	cron.schedule(cronSchedule, async () => {
		console.log('Running the cron job...');

		try {
			// Specify the database name
			const dbName = 'smesters-discord';

			// Use the specified database
			const db = client.db(dbName);

			// Get the MongoDB collections from the specified database
			const sourceCollection = db.collection(sourceCollectionName);
			const destinationCollection = db.collection(destinationCollectionName);

			// Find documents in the source collection (you can customize the query)
			const documentsToMove = await sourceCollection.find({}).toArray();

			// Insert the documents into the destination collection
			await destinationCollection.insertMany(documentsToMove);

			// Delete the moved documents from the source collection
			await sourceCollection.deleteMany({});

			console.log('Cron job completed successfully.');

		} catch (error) {
			console.error('Error in cron job:', error);
		}
	});
});

// Close the MongoDB connection when the script is terminated
process.on('SIGINT', () => {
	console.log('Closing MongoDB connection...');
	client.close().then(() => process.exit(0));
});