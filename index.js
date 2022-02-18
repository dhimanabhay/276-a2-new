require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;

// Database
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });
pool = new Pool({
  connectionString:'postgres://postgres:1234@localhost/rectangles'
});

// Express
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/rectangles', (req, res) => {
  const poolQuery = 'SELECT * FROM rectangle';

  pool.query(poolQuery, (err, result) => {
    if (err) console.log(err);
    else res.render('pages/rectangles', { rows: result.rows });
  });
});

app.get('/rectangles/:id', (req, res) => {
  const id = req.params.id;

  if (!isNaN(id)) {
    const poolQuery = `SELECT * FROM rectangle WHERE id='${id}'`;

    pool.query(poolQuery, (err, result) => {
      if (err) console.log(err);
      else if (result.rows.length === 0) res.render('pages/error');
      else if (result.rows.length > 0) res.render('pages/rectangle', { row: result.rows[0] });
    });
  } else {
    res.render('pages/error');
  }
});

app.get('/add-rectangle', (req, res) => {
  res.render('pages/addRectangle');
});

app.post('/add-rectangle', (req, res) => {
  const { name, color, width, height } = req.body;

  const poolQuery = `INSERT INTO rectangle (id, name, color, width, height) VALUES (DEFAULT,'${name}', '${color.toLowerCase()}', '${width}', '${height}')`;

  pool.query(poolQuery, (err, result) => {
    if (err) console.log(err);
    else res.redirect('/add-rectangle');
  });
});

app.post('/rectangles/:id/update', (req, res) => {
  const id = req.params.id;

  if (!isNaN(id)) {
    const { name, color, width, height } = req.body;

    const poolQuery = `UPDATE rectangle SET (name, color, width, height) = ('${name}', '${color.toLowerCase()}', '${width}','${height}') WHERE id='${id}'`;
  
    pool.query(poolQuery, (err, result) => {
      if (err) console.log(err);
      else res.redirect(`/rectangles/${id}`);
    });
  } else {
    res.render('pages/error');
  }
});

app.get('/rectangles/:id/delete', (req, res) => {
  const id = req.params.id;

  if (!isNaN(id)) {
    const poolQuery = `DELETE FROM rectangle WHERE id='${id}'`;

    pool.query(poolQuery, (err, result) => {
      if (err) console.log(err);
      else res.redirect('/rectangles');
    });
  } else {
    res.render('pages/error');
  }
});

app.get('*', (req, res) => {
  res.render('pages/error');
});

// Server
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));