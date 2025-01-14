const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8080;

const dbUser = process.env.DB_USER || 'user';
const dbPass = process.env.DB_PASS || 'pass';
const dbHost = process.env.DB_HOST || 'qod-db';
const dbPort = process.env.DB_PORT || '27017';
const dbName = process.env.DB_NAME || 'qod';

const dbURI = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true }
});

const Quote = mongoose.model('Quote', quoteSchema);

app.get('/random', async (req, res) => {
  try {
    const count = await Quote.countDocuments();
    const random = Math.floor(Math.random() * count);
    const quote = await Quote.findOne().skip(random);
    res.json(quote);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/daily', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const hash = Array.from(today).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = await Quote.countDocuments();
    const index = hash % count;
    const quote = await Quote.findOne().skip(index);
    res.json(quote);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`QOD API listening at http://localhost:${port}`);
});
