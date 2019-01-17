// https://github.com/tonykieling/tinny_app

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");


function generateRandomString() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; //62
  let index = 0;
  let result = "";
  for (let c = 0; c < 6; c += 1){
    index = Math.floor(Math.random() * (62));
    result += possible[index];
  }
  return result;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello WD!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", function (req, res) {
  let templateVars = { urls: urlDatabase };
  if (!req.cookies.name){
    console.log("starting withouth cookie");
    templateVars["username"] = null;
    console.log(templateVars.username);
  } else {
    templateVars.username = req.cookies.name;
  }
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase };
  if (!req.cookies.name){
    console.log("starting withouth cookie");
    templateVars["username"] = null;
    console.log(templateVars.username);
  } else {
    templateVars.username = req.cookies.name;
  }  
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id };
  if (!req.cookies.name){
    templateVars["username"] = null;
  } else {
    templateVars.username = req.cookies.name;
  } 
  res.render("urls_show", templateVars);
  // res.render("urls_show");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting : 'Hello World!'};
  res.render("hello_world", templateVars);
  // res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${newShortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// delete short url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// update short url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// login feature
app.post("/login", (req, res) => {
  console.log("cookie: " , req.body.username);
  res.cookie('name', req.body.username);
  res.redirect("/urls");
});

// logout feature
app.post("/logout", (req, res) => {
  res.clearCookie('name');
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

