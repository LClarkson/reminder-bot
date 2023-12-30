const MongoMover = require('./mongoMover.js');

// Accepts 3 arguments (sourceCollection, destinationCollection, cronSchedule)
const mover = new MongoMover('remindermsgs', 'archive', '*/10 * * * * *');

mover.connect();
mover.scheduleJob();
mover.closeConnection();