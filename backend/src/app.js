const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json());

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

const WORD_SQL = 'SELECT keyword, media_url, category FROM dictionary WHERE keyword = $1';

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Sin parámetros devuelve el diccionario completo (la app lo cachea); con ?word= una sola palabra.
app.get('/api/dictionary', wrap(async (req, res) => {
  const word = String(req.query.word || '').trim().toLowerCase();
  if (!word) {
    const { rows } = await pool.query('SELECT keyword, media_url, category FROM dictionary ORDER BY keyword');
    return res.json(rows);
  }
  const { rows } = await pool.query(WORD_SQL, [word]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Palabra no encontrada' });
}));

app.get('/api/dictionary/:word', wrap(async (req, res) => {
  const { rows } = await pool.query(WORD_SQL, [req.params.word.toLowerCase()]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'Palabra no encontrada' });
}));

app.get('/api/phrases', wrap(async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, display_text, spoken_text, icon_name FROM quick_phrases ORDER BY display_text');
  res.json(rows);
}));

module.exports = app;
