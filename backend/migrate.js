// Run once to create tables: npm run migrate (see package.json) or `node migrate.js`
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
