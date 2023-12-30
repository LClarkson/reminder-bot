const MongoMover = require('./mongoMover.js');

const mover = new MongoMover('staging', 'remindermsgs', '*/10 * * * * *');

mover.connect();
mover.scheduleJob();
mover.closeConnection();