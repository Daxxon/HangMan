const path = require('path');
const mustacheExpress = require('mustache-express');
const express = require('express');
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

let myWord = generateWord();
console.log(myWord);

let solved = false;
let progress = {word: []};
let allowedChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
// let acceptedChars = new RegExp('a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z');

for (let i=0; i<myWord.length; i++){
  progress.word.push({letter: "*"});
  // progress.push("_");
}

console.log(progress);

app.get("/", (req, res) => {
  res.render('index', progress);
});

app.use('/guess', (req, res, next) => {
  console.log(req.body.guess.toLowerCase());
  let myGuess = req.body.guess.toLowerCase();
  req.checkBody("guess", "Enter 1 character, not 0, not 2, just 1").isLength({min: 1, max: 1});
  req.checkBody("guess", "Enter a letter of the alphabet... not a number, not a special character... a letter of the alphabet").isIn(allowedChars);
  let errors = req.validationErrors();
  if (errors) {
    console.log(errors[0].msg);
  };
    next();
})

app.post("/guess", (req, res) => {
  res.redirect('/');
});

/* FUNCTIONS - good for your health */

function generateWord() {
  return words[Math.floor(Math.random() * words.length)];
}

app.listen(3000, () => console.log('SHOW ME WHAT YOU GOT'));
