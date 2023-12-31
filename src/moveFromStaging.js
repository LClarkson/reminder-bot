const MongoMover = require('./mongoMover.js');

// Accepts 3 arguments (sourceCollection, destinationCollection, cronSchedule)
// Move from staging to remindermsgs every day at 3 AM CST
const mover = new MongoMover('staging', 'remindermsgs', '0 9 * * *');

mover.connect();
mover.scheduleJob();
mover.closeConnection();