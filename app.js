const path = require('path');
const mustacheExpress = require('mustache-express');
const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fs = require('fs');

const app = express();

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

let allowedChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

app.use((req, res, next) => {
  if (!req.session.myWord) {
    req.session.myWord = generateWord();
    req.session.solved = false;
    req.session.progress = {word: []};
    req.session.count = 0;
    req.session.guessed = [];
    for (let i=0; i<req.session.myWord.length; i++){
      req.session.progress.word.push({letter: "*"});
    }
  }
  console.log(req.session.myWord);
  console.log(req.session);
  console.log(req.session.progress);
  next();
});

app.use((req, res, next) => {
  if (req.session.count === 8) {
    res.render('youLose', req.session)
  } else {
    next();
  }
})

app.use((req, res, next) => {
  req.session.continue = false;
  for (let i=0; i<req.session.myWord.length; i++) {
    if (req.session.progress.word[i].letter === '*') {
      req.session.continue = true;
    }
  }
  if (req.session.continue) {
    next()
  } else {
    req.session.solved = true;
    next();
  }
})

app.use((req, res, next) => {
  (req.session.solved) ? res.redirect('https://youtu.be/3NuFVQk_CCs?t=12') : next();
})

app.use('/guess', (req, res, next) => {
  // console.log(req.body.guess.toLowerCase());
  let myGuess = req.body.guess.toLowerCase();
  req.checkBody("guess", "Enter 1 character, not 0, not 2, just 1").isLength({min: 1, max: 1});
  req.checkBody("guess", "Enter a letter of the alphabet... not a number, not a special character... a letter of the alphabet").isIn(allowedChars);
  let errors = req.validationErrors();
  if (errors) {
    console.log(errors[0].msg);
  } else {
    checkLetter(myGuess, req.session);
  }
    next();
});

app.post("/guess", (req, res) => {
  res.redirect('/');
});

app.get("/", (req, res) => {
  res.render('index', req.session);
});

app.listen(3000, () => console.log('SHOW ME WHAT YOU GOT'));

/* FUNCTIONS - good for your health */

function generateWord() {
  return words[Math.floor(Math.random() * words.length)];
};

function checkLetter (myLetter, mySession) {
  let success = false;
  for (let i=0; i<mySession.myWord.length; i++) {
    if (myLetter === mySession.myWord[i]) {
      // myProgress[i].word.letter = myWord[i];
      console.log("SUCCESS!");
      mySession.progress.word[i].letter = mySession.myWord[i];
      success = true;
    }
  }
  if (!success && mySession.guessed.indexOf(myLetter) === -1) {
    mySession.guessed.push(myLetter);
    mySession.count++;
  }
  console.log(mySession.progress.word);
}
