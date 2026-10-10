// Crea tablas y datos de ejemplo en la BD configurada en .env
const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  for (const f of ['schema.sql', 'seed.sql']) {
    await pool.query(fs.readFileSync(path.join(__dirname, '..', 'sql', f), 'utf8'));
    console.log('OK', f);
  }
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
