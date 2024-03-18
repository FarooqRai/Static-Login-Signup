const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Sample user data (for demonstration purposes, use a database in a real application)
let users = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname));


app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).send('Invalid username or password');
  }

  const token = jwt.sign({ username: user.username }, 'secret_key');
  res.cookie('token', token);
  res.redirect('/welcome');
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/signup', (req, res) => {
  const { username, name, password } = req.body;

  if (users.find(user => user.username === username)) {
    return res.status(400).send('Username already taken');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  users.push({ username, name, passwordHash });
  
  res.redirect('/account-created');
});

app.get('/welcome', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    const user = users.find(user => user.username === decoded.username);
    res.send(`Welcome ${user.name}`);
  });
});

app.get('/account-created', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account-created.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
