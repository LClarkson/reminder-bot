/* eslint-disable brace-style */
/* eslint-disable indent */
const chrono = require('chrono-node');
const readline = require('readline');

// Set up readline interface to get user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to test input and parse date
function testInput(input) {
  const formattedInput = `in ${input}`;
  const parsedDate = chrono.parseDate(formattedInput);

  if (parsedDate) {
    // Round to the nearest minute
    parsedDate.setSeconds(0);
    parsedDate.setMilliseconds(0);
    parsedDate.setMinutes(Math.ceil(parsedDate.getMinutes() / 1) * 1);

    console.log(`Parsed date for "${input}": ${parsedDate}`);
  } else {
    console.log(`Could not parse "${input}"`);
  }
  rl.close();
}

// Prompt the user for input
rl.question('Enter a date/time (e.g., "1 day", "5 days", "9am tomorrow"): ', (input) => {
  testInput(input);
});
