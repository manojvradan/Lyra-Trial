// check-env.js

// This line loads the .env file, just like Prisma and Next.js do.
require('dotenv').config();

// Now we print the value that was loaded.
console.log('--- Running Diagnostic Test ---');
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log('SUCCESS: DATABASE_URL was found!');
  console.log('Value:', dbUrl);
} else {
  console.log('FAILURE: DATABASE_URL was NOT FOUND in the environment!');
}
console.log('-------------------------------');