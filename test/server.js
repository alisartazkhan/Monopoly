const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const port1 = 3000;
const port2 = 4000;
app.use(express.static('public_html'));

app.get('/', (req, res) => {
  res.send('Hello from main server!');
});

app.get('/about', (req, res) => {
  res.send('This is the about page!');
});

app.listen(port1, () => {
  console.log(`Main server listening at http://localhost:${port1}`);
});

// Second server
const app2 = express();

app2.get('/', (req, res) => {
  res.send('Hello from second server!');
});

app2.get('/contact', (req, res) => {
  res.send('This is the contact page!');
});

app2.listen(port2, () => {
  console.log(`Second server listening at http://localhost:${port2}`);
});
