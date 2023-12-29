// every day at 12:00pm cst, grab all documents inside 'remindermsgs' and send to appropriate channel
// change documents sent "reminded" property to true
// after messages sent, move any documents with reminded:true from 'remindermsgs' into 'archive'


// the above stragegy offloads read/write/delete operations between collections to a low-traffic time of day
// allowing logic and compute to complete when traffic is lowest, then at 12pm only one operation needs to occur,
// send any messages in 'remindermsgs' collection. This offloads write operations to that collection that
// could be happening simultaneously if people are setting reminders during a busy part of the day. Instead, 
// write operations will occur in a different collection.

