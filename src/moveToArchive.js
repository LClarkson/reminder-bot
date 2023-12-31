const MongoMover = require('./mongoMover.js');

// Accepts 3 arguments (sourceCollection, destinationCollection, cronSchedule)
// Move from remindermsgs to archive every day at 12:05 PM CST
const mover = new MongoMover('remindermsgs', 'archive', '5 12 * * *');

mover.connect();
mover.scheduleJob();
mover.closeConnection();