const MongoMover = require('./mongoMover.js');

const mover = new MongoMover('remindermsgs', 'archive', '*/10 * * * * *');

mover.connect();
mover.scheduleJob();
mover.closeConnection();